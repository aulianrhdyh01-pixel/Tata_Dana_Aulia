import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines, 1):
    s = line.strip()
    if 'id="tab-' in s or 'id="adminTab' in s or 'data-view' in s or 'id="superadmin' in s.lower() or 'id="admin' in s.lower():
        clean = s.encode('ascii', errors='replace').decode('ascii')
        print(f"L{idx}: {clean[:100]}")
