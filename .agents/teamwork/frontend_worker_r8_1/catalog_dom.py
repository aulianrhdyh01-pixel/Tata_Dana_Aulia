import sys
import re

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all IDs
ids = set(re.findall(r'id=["\']([a-zA-Z0-9_\-]+)["\']', content))
print(f"Total unique IDs found: {len(ids)}")

# Find all functions
funcs = set(re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', content))
print(f"Total functions found: {len(funcs)}")

# Find all fetch URLs
fetches = set(re.findall(r'fetch\([`"\'](/api/[^`"\']*)', content))
print(f"Total API endpoints fetched: {len(fetches)}")
for ep in sorted(fetches):
    print(f"  {ep}")

print("\nSample IDs:")
for sid in sorted(ids)[:40]:
    print(f"  {sid}")
