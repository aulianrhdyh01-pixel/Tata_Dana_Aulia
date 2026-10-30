"""
Comprehensive Test Script for Round 7:
Strict Superadmin vs User View Separation & Waiting for Admin Approval Gate
"""

import os
import sys
import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://127.0.0.1:3000"

def test_round7_full_workflow():
    print("==================================================================")
    print(" RUNNING ROUND 7 E2E & COMPLIANCE TEST SUITE")
    print("==================================================================")
    ts = int(time.time())

    # 1. Superadmin login test
    login_payload = json.dumps({
        'email': 'akunadminaul16@gmail.com',
        'password': 'akuadmin123'
    }).encode('utf-8')
    req_login = urllib.request.Request(f"{BASE_URL}/api/auth/login", data=login_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_login) as resp:
        assert resp.status == 200, f"Expected 200, got {resp.status}"
        data = json.loads(resp.read().decode('utf-8'))
        assert data.get('ok') is True, "Login should return ok: True"
        assert data.get('success') is True, "Login should return success: True"
        assert data.get('role') == 'superadmin', "Role should be superadmin"
        assert data.get('plan') == 'PRO VIP', "Plan should be PRO VIP"
        assert data.get('is_approved') == 1, "Superadmin should have is_approved: 1"
        print("✓ [TEST 1 PASS] Superadmin login valid: role=superadmin, plan=PRO VIP, is_approved=1")

    # 2. Register new regular user
    user_email = f"user.r7.{ts}@tatadana.id"
    reg_payload = json.dumps({
        'full_name': f'Tata User {ts}',
        'email': user_email,
        'phone_number': f'0812{ts % 100000000:08d}',
        'password': 'UserSecret123!'
    }).encode('utf-8')
    req_reg = urllib.request.Request(f"{BASE_URL}/api/auth/register", data=reg_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_reg) as resp:
        assert resp.status == 200
        data_reg = json.loads(resp.read().decode('utf-8'))
        assert data_reg.get('ok') is True
        assert data_reg.get('success') is True
        assert data_reg.get('is_approved') == 0, "New registrant must have is_approved: 0"
        user_id = data_reg['user_id']
        otp_code = data_reg.get('otp_code', '123456')
        print(f"✓ [TEST 2 PASS] User registered #{user_id} ({user_email}) with is_approved=0, OTP={otp_code}")

    # 3. Verify OTP: regular users MUST strictly remain is_approved=0 (NEVER auto-approve)
    verify_payload = json.dumps({
        'user_id': user_id,
        'email': user_email,
        'otp': otp_code
    }).encode('utf-8')
    req_verify = urllib.request.Request(f"{BASE_URL}/api/auth/verify-otp", data=verify_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_verify) as resp:
        assert resp.status == 200
        data_verify = json.loads(resp.read().decode('utf-8'))
        assert data_verify.get('ok') is True
        assert data_verify.get('success') is True
        assert data_verify.get('is_approved') == 0, "verify-otp MUST strictly return is_approved: 0 for regular users"
        assert data_verify.get('status') == 'pending_approval', "verify-otp MUST return status: pending_approval"
        print(f"✓ [TEST 3 PASS] /api/auth/verify-otp strictly kept is_approved=0 and status='pending_approval'")

    # 4. Check status via GET and POST /api/auth/status (Pending state)
    req_status_get = urllib.request.Request(f"{BASE_URL}/api/auth/status?user_id={user_id}&email={user_email}")
    with urllib.request.urlopen(req_status_get) as resp:
        assert resp.status == 200
        d_sg = json.loads(resp.read().decode('utf-8'))
        assert d_sg.get('ok') is True
        assert d_sg.get('success') is True
        assert d_sg.get('is_approved') == 0
        assert d_sg.get('status') == 'PENDING'
        assert d_sg.get('approval_status') == 'PENDING'
        print("✓ [TEST 4a PASS] GET /api/auth/status confirmed is_approved=0 and status=PENDING")

    post_status_payload = json.dumps({'user_id': user_id, 'email': user_email}).encode('utf-8')
    req_status_post = urllib.request.Request(f"{BASE_URL}/api/auth/status", data=post_status_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_status_post) as resp:
        assert resp.status == 200
        d_sp = json.loads(resp.read().decode('utf-8'))
        assert d_sp.get('ok') is True
        assert d_sp.get('success') is True
        assert d_sp.get('is_approved') == 0
        assert d_sp.get('status') == 'PENDING'
        assert d_sp.get('approval_status') == 'PENDING'
        print("✓ [TEST 4b PASS] POST /api/auth/status confirmed is_approved=0 and status=PENDING")

    # 5. Superadmin approves user via /api/admin/approve-user
    approve_payload = json.dumps({'user_id': user_id}).encode('utf-8')
    req_approve = urllib.request.Request(f"{BASE_URL}/api/admin/approve-user", data=approve_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req_approve) as resp:
        assert resp.status == 200
        d_app = json.loads(resp.read().decode('utf-8'))
        assert d_app.get('ok') is True
        assert d_app.get('success') is True
        assert d_app.get('is_approved') == 1
        assert d_app.get('user_id') == user_id
        print(f"✓ [TEST 5 PASS] POST /api/admin/approve-user approved user #{user_id} with is_approved=1")

    # 6. Check status after approval via GET and POST
    req_status_after = urllib.request.Request(f"{BASE_URL}/api/auth/status?user_id={user_id}&email={user_email}")
    with urllib.request.urlopen(req_status_after) as resp:
        assert resp.status == 200
        d_sa = json.loads(resp.read().decode('utf-8'))
        assert d_sa.get('is_approved') == 1
        assert d_sa.get('status') == 'APPROVED'
        assert d_sa.get('approval_status') == 'APPROVED'
        print("✓ [TEST 6 PASS] GET /api/auth/status confirmed approved status: is_approved=1, status=APPROVED")

    # 7. Verify all SPA routes respond with HTTP 200
    spa_routes = ['/', '/login', '/approval', '/dashboard', '/admin', '/superadmin', '/settings']
    for route in spa_routes:
        req_route = urllib.request.Request(f"{BASE_URL}{route}")
        with urllib.request.urlopen(req_route) as resp:
            assert resp.status == 200, f"Route {route} returned HTTP {resp.status}"
            content = resp.read().decode('utf-8')
            assert '<!DOCTYPE html>' in content or '<html' in content, f"Route {route} did not return HTML content"
    print(f"✓ [TEST 7 PASS] All {len(spa_routes)} SPA routes responded HTTP 200 with index.html")

    print("==================================================================")
    print(" ALL ROUND 7 TESTS PASSED SUCCESSFULLY! (100% GREEN)")
    print("==================================================================")

if __name__ == '__main__':
    test_round7_full_workflow()
