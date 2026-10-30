import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines: {len(lines)}")

for idx, line in enumerate(lines, 1):
    s = line.strip()
    if s.startswith('<!-- ═══') or '<section id=' in s or '<script' in s or s.startswith('function switch') or s.startswith('function navigate'):
        # sanitize ascii for safe print
        clean = s.encode('ascii', errors='replace').decode('ascii')
        print(f"L{idx}: {clean[:100]}")
