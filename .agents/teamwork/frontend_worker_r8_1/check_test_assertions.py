import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
test_files = [
    r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\test_round7_approval_gate.py',
    r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\test_round7_backend.py',
    r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\test_adversarial_challenger.py',
    r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\tests\test_round7_adversarial_suite.py',
    r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\tests\test_acceptance_criteria.py'
]

for tf in test_files:
    try:
        with open(tf, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        print(f"=== {tf} ===")
        for idx, l in enumerate(lines, 1):
            if 'index.html' in l or ('assert' in l and any(k in l for k in ['view', 'login', 'admin', 'html', 'id='])):
                print(f"  L{idx}: {l.strip()[:100]}")
    except Exception as e:
        print(f"Error reading {tf}: {e}")
