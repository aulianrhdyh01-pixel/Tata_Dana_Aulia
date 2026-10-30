import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

html_path = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

sections = [
    ("Head & TopBanner", 1, 39),
    ("viewLanding", 40, 548),
    ("viewLogin", 549, 693),
    ("viewApproval", 694, 828),
    ("viewDashboard Header & Sidebar", 829, 988),
    ("viewDashboard Tabs (beranda, transaksi, dll)", 989, 1477),
    ("viewDashboard AdminPanel", 1478, 1673),
    ("viewDashboard MobileNav & Modals", 1674, 1759),
    ("Script: AppState & Router", 1760, 2100),
    ("Script: Auth & Approval", 2101, 2800),
    ("Script: Admin & AI Settings", 2801, 3200),
    ("Script: Profile, Reports & Others", 3201, len(lines))
]

for name, s, e in sections:
    print(f"{name:40}: L{s:4} - L{e:4} ({e - s + 1} lines)")
