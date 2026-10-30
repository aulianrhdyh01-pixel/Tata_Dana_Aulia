with open(r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\server.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in server.py: {len(lines)}")
matches = []
for idx, line in enumerate(lines):
    if 'approve' in line.lower() or 'admin' in line.lower() or 'metrics' in line.lower() or 'conn.commit' in line.lower() or 'init_db' in line.lower():
        if any(term in line.lower() for term in ['def ', 'path', 'approve', 'commit']):
            matches.append((idx + 1, line.strip()))

print(f"Total matching lines: {len(matches)}")
for num, line in matches[:50]:
    print(f"L{num}: {line}")
