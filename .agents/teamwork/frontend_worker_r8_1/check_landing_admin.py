import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in range(39, 548):
    l = lines[idx]
    if 'admin' in l.lower():
        clean = l.strip().encode('ascii', errors='replace').decode('ascii')
        print(f"L{idx+1}: {clean}")
