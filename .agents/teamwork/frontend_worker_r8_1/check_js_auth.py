import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx in range(1759, 2400):
    line = lines[idx]
    s = line.strip()
    if s.startswith('function ') or s.startswith('async function ') or 'const ' in s or 'let ' in s:
        if any(keyword in s for keyword in ['login', 'auth', 'navigate', 'route', 'register', 'approval', 'photo', 'avatar', 'user', 'session']):
            clean = s.encode('ascii', errors='replace').decode('ascii')
            print(f"L{idx+1}: {clean[:120]}")
