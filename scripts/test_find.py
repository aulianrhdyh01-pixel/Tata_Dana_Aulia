# -*- coding: utf-8 -*-
with open('scripts/server.py', 'r', encoding='utf-8') as f:
    code = f.read()

start = code.find('function simulateSend() {{')
end = code.find('c.scrollTop = c.scrollHeight;\n      }}, 500);\n    }}')
print("simulateSend start:", start, "end:", end)
if end != -1:
    end += len('c.scrollTop = c.scrollHeight;\n      }}, 500);\n    }}')
    print("Found block length:", end - start)
