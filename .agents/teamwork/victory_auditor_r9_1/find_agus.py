import os

search_terms = ['333111', '08211234123', 'sayaagus', 'agus']
project_dir = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana'

for root, dirs, files in os.walk(project_dir):
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    if '.next' in dirs:
        dirs.remove('.next')
    for file in files:
        if file.endswith(('.py', '.html', '.js', '.json', '.md', '.bat')):
            fpath = os.path.join(root, file)
            try:
                with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for term in search_terms:
                        if term in content:
                            print(f"Found '{term}' in {fpath}")
            except Exception as e:
                pass
