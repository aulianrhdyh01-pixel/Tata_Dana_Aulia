import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in range(3200, len(lines)):
    l = lines[idx]
    s = l.strip()
    if s.startswith('function ') or s.startswith('async function ') or s.startswith('window.'):
        clean = s.encode('ascii', errors='replace').decode('ascii')
        print(f"L{idx+1}: {clean[:80]}")
