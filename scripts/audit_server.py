# -*- coding: utf-8 -*-
import sys, re

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('scripts/server.py', 'r', encoding='utf-8') as f:
    server_code = f.read()

# 1. Check anchor hrefs starting with #
hash_hrefs = set(re.findall(r'href=[\'"](#[^\'"]+)[\'"]', server_code))
print("Hash hrefs found:", hash_hrefs)
for h in hash_hrefs:
    target_id = h[1:]
    pattern = f'id=[\'"]{target_id}[\'"]'
    if not re.search(pattern, server_code):
        print(f"  [MISSING TARGET ID] href='{h}' has no corresponding id='{target_id}'")
    else:
        print(f"  [OK] href='{h}' found id='{target_id}'")

# 2. Check all buttons or links that have alert()
dummy_buttons = re.findall(r'<button[^>]*onclick=[\'"][^"\']*alert\([^"\']*[\'"][^>]*>(.*?)</button>', server_code, re.DOTALL)
print(f"\nButtons with alert() ({len(dummy_buttons)}):")
for b in dummy_buttons:
    print(f"  Alert button: {b.strip()}")

# 3. Check all buttons without onclick and not type='submit'
all_buttons = re.findall(r'<button([^>]*)>(.*?)</button>', server_code, re.DOTALL)
print(f"\nTotal buttons: {len(all_buttons)}")
for attrs, text in all_buttons:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    if 'onclick' not in attrs and 'type="submit"' not in attrs and "type='submit'" not in attrs and 'type=submit' not in attrs:
        print(f"  [BUTTON WITHOUT ACTION] text: '{clean_text}', attrs: {attrs.strip()}")

# 4. Check all <a> tags that have href="#" or href="" or no href
dummy_links = re.findall(r'<a([^>]*)>(.*?)</a>', server_code, re.DOTALL)
print(f"\nTotal links: {len(dummy_links)}")
for attrs, text in dummy_links:
    clean_text = re.sub(r'<[^>]+>', '', text).strip()
    m = re.search(r'href=[\'"]([^\'"]*)[\'"]', attrs)
    if not m or m.group(1) in ['#', '', 'javascript:void(0)', 'javascript:;']:
        print(f"  [DUMMY LINK] text: '{clean_text}', href: '{m.group(1) if m else 'NONE'}', attrs: {attrs.strip()}")
