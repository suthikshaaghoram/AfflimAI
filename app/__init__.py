
import os
import sys

# Get absolute paths
current_dir = os.path.dirname(os.path.abspath(__file__)) # [root]/app
root_dir = os.path.dirname(current_dir) # [root]
backend_dir = os.path.join(root_dir, 'backend')
backend_app_dir = os.path.join(backend_dir, 'app')

# 1. Add 'backend' to sys.path so 'import api' works (since api is in backend/api)
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

# 2. Add 'backend/app' to this package's path
# This allows 'from app import schemas' to find backend/app/schemas.py
# even though this package is physically at root/app
__path__.append(backend_app_dir)
