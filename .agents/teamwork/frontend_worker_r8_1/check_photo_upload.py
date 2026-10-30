import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    for idx, l in enumerate(f, 1):
        if 'handlelocalphotoupload' in l.lower() or 'settingphotofileinput' in l.lower() or 'profile-photo' in l.lower() or 'saveuserprofile' in l.lower():
            clean = l.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"L{idx}: {clean}")
