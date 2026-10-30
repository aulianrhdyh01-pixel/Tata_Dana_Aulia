import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
root = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana'

for dirpath, _, filenames in os.walk(root):
    if '.agents' in dirpath or '.git' in dirpath:
        continue
    for f in filenames:
        if f.endswith('.py'):
            p = os.path.join(dirpath, f)
            try:
                with open(p, 'r', encoding='utf-8') as fl:
                    content = fl.read()
                    if 'index.html' in content:
                        print(f"File {p} references index.html")
            except Exception as e:
                pass
