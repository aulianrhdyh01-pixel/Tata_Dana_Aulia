import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in range(828, 1760):
    line = lines[idx]
    s = line.strip()
    if 'id=' in s and ('tab' in s.lower() or 'content' in s.lower() or 'nav' in s.lower() or 'section' in s.lower() or 'view' in s.lower() or 'page' in s.lower()):
        clean = s.encode('ascii', errors='replace').decode('ascii')
        print(f"L{idx+1}: {clean[:120]}")
