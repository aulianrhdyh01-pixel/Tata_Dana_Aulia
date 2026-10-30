import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open(r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\server.py', 'r', encoding='utf-8') as f:
    for idx, l in enumerate(f, 1):
        if any(term in l for term in ['ai-settings', 'impersonate', 'ai-test']):
            clean = l.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"L{idx}: {clean}")
