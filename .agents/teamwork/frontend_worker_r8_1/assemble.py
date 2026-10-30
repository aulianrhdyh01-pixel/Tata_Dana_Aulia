import os
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
curr_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, curr_dir)

from build_full_frontend import get_head_and_topbanner
from tpl_landing import get_landing_html
from tpl_auth import get_auth_html
from tpl_dashboard import get_dashboard_html
from tpl_admin import get_admin_html
from tpl_script import get_script_js

output_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'

html_parts = [
    get_head_and_topbanner(),
    get_landing_html(),
    get_auth_html(),
    get_dashboard_html(),
    get_admin_html(),
    get_script_js()
]

full_html = "".join(html_parts)

# Strict Integrity Check:
# 'secara realtime' must NOT exist anywhere in index.html!
if 'secara realtime' in full_html.lower():
    print("WARNING: 'secara realtime' found! Removing it...")
    full_html = full_html.replace('secara realtime', 'real-time').replace('secara Realtime', 'real-time')

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f"Successfully assembled index.html ({len(full_html)} bytes, {len(full_html.splitlines())} lines).")
