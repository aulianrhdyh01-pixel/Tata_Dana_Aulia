import os
import sys
import shutil

# Resolve application root directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# SQLite persistence fallback for Vercel Serverless environment (/tmp)
tmp_db = '/tmp/tatadana.db'
if not os.path.exists(tmp_db):
    bundle_db = os.path.join(ROOT_DIR, 'tatadana.db')
    if os.path.exists(bundle_db):
        try:
            shutil.copy2(bundle_db, tmp_db)
            print("[Vercel Init] Successfully copied bundled tatadana.db to /tmp/tatadana.db")
        except Exception as e:
            print(f"[Vercel Init] Notice copying bundled database to /tmp: {e}")

os.environ['TATADANA_DB_FILE'] = tmp_db

import server

# Initialize database schema in /tmp if not already initialized
server.DB_FILE = tmp_db
server.TataDanaRequestHandler.directory = ROOT_DIR
server.init_db(tmp_db)

# Expose Vercel serverless request handler
class handler(server.TataDanaRequestHandler):
    directory = ROOT_DIR
