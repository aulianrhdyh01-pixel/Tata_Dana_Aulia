# -*- coding: utf-8 -*-
"""
Verification Test Script for Worker 4: Real Data Export & CSV/Excel Generator
Project: TataDana
Author: Worker 4 (Specialist & Implementer)

Test Scope:
1. Endpoint /api/export verification:
   - HTTP 200 response
   - Content-Type: 'text/csv; charset=utf-8'
   - Content-Disposition: 'attachment; filename="Laporan_Keuangan_TataDana.csv"'
2. Authentic Database Data Verification:
   - Query tatadana.db directly for transactions of user_id=1.
   - Parse CSV body from HTTP response using standard csv.reader.
   - Verify header matches exact columns:
     ['No', 'Tanggal (WIB)', 'Jenis', 'Kategori', 'Catatan', 'Dompet', 'Nominal (IDR)', 'Sumber']
   - Verify each transaction record in CSV matches row-for-row with database query results.
3. Special Characters Escaping Test:
   - Insert transaction with quotes, commas, and newlines.
   - Fetch /api/export.
   - Verify RFC 4180 escaping preserved exact text without corrupting CSV structure.
4. Clean teardown and summary.
"""

import os
import sys
import io
import csv
import json
import time
import socket
import sqlite3
import threading
import urllib.request
import urllib.parse
import socketserver

# Force utf-8 encoding for stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import server

DB_FILE = os.path.join(PROJECT_ROOT, 'tatadana.db')

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def run():
    print("=" * 70)
    print("TATADANA WORKER 4: REAL DATA EXPORT & CSV GENERATOR TEST SUITE")
    print("=" * 70)

    # 1. Initialize DB and verify connection
    server.init_db()
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    # Ensure admin user has seeded transactions
    c.execute("SELECT id FROM users WHERE email = 'shopnoure1619@gmail.com'")
    admin_row = c.fetchone()
    if not admin_row:
        print("❌ Admin user not found in tatadana.db!")
        sys.exit(1)
    admin_id = admin_row['id']
    print(f"[*] Admin user ID in database: {admin_id}")

    # Ensure wallets and sample transactions exist
    server.seed_user_wallets_and_data(conn, admin_id)

    # Check transactions in DB
    c.execute("""
        SELECT t.id, t.transaction_time, t.transaction_type, t.category_name, 
               t.notes, COALESCE(w.name, 'Dompet Utama') as wallet_name, 
               t.amount, t.source
        FROM transactions t
        LEFT JOIN wallets w ON t.wallet_id = w.id
        WHERE t.user_id = ?
        ORDER BY t.id ASC
    """, (admin_id,))
    db_txs = [dict(row) for row in c.fetchall()]
    print(f"[*] Total transactions in DB for user {admin_id}: {len(db_txs)}")

    # 2. Start HTTP test server on free port
    test_port = find_free_port()
    server.PORT = test_port
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(('127.0.0.1', test_port), server.TataDanaRequestHandler)

    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()
    time.sleep(0.5)
    print(f"[*] Test server running at http://127.0.0.1:{test_port}")

    passed_checks = 0
    total_checks = 0

    try:
        # TEST 1: Basic GET /api/export
        total_checks += 1
        export_url = f"http://127.0.0.1:{test_port}/api/export?user_id={admin_id}"
        req = urllib.request.Request(export_url, headers={'User-Agent': 'Worker4Test'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status_code = resp.getcode()
            content_type = resp.headers.get('Content-Type')
            content_disp = resp.headers.get('Content-Disposition')
            raw_body = resp.read()

        print(f"\n--- TEST 1: HTTP Headers & Status Code for /api/export ---")
        if status_code == 200:
            print(f"  ✅ [PASS] HTTP Status Code: 200 OK")
            passed_checks += 1
        else:
            print(f"  ❌ [FAIL] HTTP Status Code: {status_code} (expected 200)")

        total_checks += 1
        if content_type and 'text/csv' in content_type and 'charset=utf-8' in content_type.lower():
            print(f"  ✅ [PASS] Content-Type Header: {content_type}")
            passed_checks += 1
        else:
            print(f"  ❌ [FAIL] Content-Type Header: {content_type}")

        total_checks += 1
        if content_disp and 'attachment' in content_disp and 'Laporan_Keuangan_TataDana.csv' in content_disp:
            print(f"  ✅ [PASS] Content-Disposition Header: {content_disp}")
            passed_checks += 1
        else:
            print(f"  ❌ [FAIL] Content-Disposition Header: {content_disp}")

        # TEST 2: CSV Parsing & Header Verification
        print(f"\n--- TEST 2: CSV Structure & Column Headers ---")
        total_checks += 1
        csv_text = raw_body.decode('utf-8')
        reader = csv.reader(io.StringIO(csv_text))
        rows = list(reader)

        expected_headers = ['No', 'Tanggal (WIB)', 'Jenis', 'Kategori', 'Catatan', 'Dompet', 'Nominal (IDR)', 'Sumber']
        if len(rows) > 0 and rows[0] == expected_headers:
            print(f"  ✅ [PASS] CSV Headers match expected specification: {rows[0]}")
            passed_checks += 1
        else:
            print(f"  ❌ [FAIL] CSV Headers mismatch: {rows[0] if rows else 'EMPTY'}")

        # TEST 3: Data Integrity vs SQLite
        print(f"\n--- TEST 3: Data Integrity (CSV records vs SQLite tatadana.db) ---")
        data_rows = rows[1:]
        total_checks += 1
        if len(data_rows) == len(db_txs):
            print(f"  ✅ [PASS] CSV row count ({len(data_rows)}) exactly matches database records ({len(db_txs)})")
            passed_checks += 1
        else:
            print(f"  ❌ [FAIL] Row count mismatch: CSV has {len(data_rows)}, DB has {len(db_txs)}")

        total_checks += 1
        all_match = True
        for idx, (csv_r, db_r) in enumerate(zip(data_rows, db_txs), 1):
            expected_amt = int(db_r['amount']) if float(db_r['amount']).is_integer() else db_r['amount']
            # csv_r: [No, Tanggal, Jenis, Kategori, Catatan, Dompet, Nominal, Sumber]
            if (int(csv_r[0]) != idx or 
                csv_r[1] != (db_r['transaction_time'] or '') or
                csv_r[2] != (db_r['transaction_type'] or '') or
                csv_r[3] != (db_r['category_name'] or '') or
                csv_r[4] != (db_r['notes'] or '') or
                csv_r[5] != (db_r['wallet_name'] or '') or
                csv_r[6] != str(expected_amt) or
                csv_r[7] != (db_r['source'] or 'web')):
                print(f"  ❌ [FAIL] Mismatch at row {idx}: CSV={csv_r} vs DB={dict(db_r)}")
                all_match = False
                break

        if all_match and len(data_rows) > 0:
            print(f"  ✅ [PASS] All {len(data_rows)} records verified: columns match database values genuinely")
            passed_checks += 1
        elif not all_match:
            print(f"  ❌ [FAIL] Record verification failed")

        # TEST 4: Special Characters Escaping (RFC 4180)
        print(f"\n--- TEST 4: Special Characters Escaping (Quotes, Commas, Newlines) ---")
        test_note = 'Makan siang "Spesial", harga Rp 45.000\nPaket nasi + es teh'
        test_category = 'Makanan & Minuman'
        c.execute("""
            INSERT INTO transactions (user_id, wallet_id, category_name, transaction_type, amount, notes, source, transaction_time)
            VALUES (?, 1, ?, 'pengeluaran', 45000.0, ?, 'test_special', '2026-10-17 12:30:00 WIB')
        """, (admin_id, test_category, test_note))
        conn.commit()
        special_tx_id = c.lastrowid
        print(f"[*] Inserted test transaction id={special_tx_id} with special characters in notes.")

        # Re-fetch CSV
        total_checks += 1
        with urllib.request.urlopen(export_url, timeout=5) as resp_spec:
            csv_spec_text = resp_spec.read().decode('utf-8')

        reader_spec = csv.reader(io.StringIO(csv_spec_text))
        rows_spec = list(reader_spec)
        found_special = False
        for r in rows_spec[1:]:
            if r[7] == 'test_special':
                found_special = True
                if r[4] == test_note:
                    print(f"  ✅ [PASS] Special characters in notes successfully preserved through CSV export & parse:")
                    print(f"           Note content: {repr(r[4])}")
                    passed_checks += 1
                else:
                    print(f"  ❌ [FAIL] Special characters corrupted: expected {repr(test_note)}, got {repr(r[4])}")
                break

        if not found_special:
            print(f"  ❌ [FAIL] Special character test row not found in export")

        # Clean up test transaction
        c.execute("DELETE FROM transactions WHERE id = ?", (special_tx_id,))
        conn.commit()
        print(f"[*] Cleaned up test transaction id={special_tx_id}.")

        # TEST 5: Fallback & Default Parameters
        print(f"\n--- TEST 5: Default User Fallback & /api/export/excel alias ---")
        total_checks += 1
        url_default = f"http://127.0.0.1:{test_port}/api/export"
        with urllib.request.urlopen(url_default, timeout=5) as resp_def:
            if resp_def.getcode() == 200:
                print(f"  ✅ [PASS] Default user_id fallback handled seamlessly: HTTP 200")
                passed_checks += 1
            else:
                print(f"  ❌ [FAIL] Default user_id fallback returned {resp_def.getcode()}")

        total_checks += 1
        url_excel = f"http://127.0.0.1:{test_port}/api/export/excel?user_id={admin_id}"
        with urllib.request.urlopen(url_excel, timeout=5) as resp_xls:
            if resp_xls.getcode() == 200 and 'text/csv' in resp_xls.headers.get('Content-Type', ''):
                print(f"  ✅ [PASS] /api/export/excel alias route functional: HTTP 200")
                passed_checks += 1
            else:
                print(f"  ❌ [FAIL] /api/export/excel alias failed")

    finally:
        conn.close()
        httpd.shutdown()
        server_thread.join(timeout=1)

    print("\n" + "=" * 70)
    print(f"TEST RESULTS: {passed_checks}/{total_checks} CHECKS PASSED")
    print("=" * 70)

    if passed_checks == total_checks:
        print("🎉 ALL REAL DATA EXPORT TESTS PASSED SUCCESSFULLY!")
        return 0
    else:
        print("❌ SOME CHECKS FAILED!")
        return 1

if __name__ == '__main__':
    sys.exit(run())
