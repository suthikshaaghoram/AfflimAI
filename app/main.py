
import sys
import os
import importlib.util

# 1. Setup paths
# We are in [root]/app/main.py
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, 'backend')

# 2. Add backend to sys.path so 'api' module (which sits in backend/api) can be found
# We append it to avoid overriding standard library or other paths, 
# but effectively 'import api' will look in [root]/backend/api.
sys.path.append(backend_dir)

# 3. Load the actual backend app module manually
# We cannot do 'from app.main import app' because that imports *this* file (circular).
target_path = os.path.join(backend_dir, 'app', 'main.py')

spec = importlib.util.spec_from_file_location("backend_app_main", target_path)
if spec is None:
    raise ImportError(f"Could not load spec for {target_path}")

backend_module = importlib.util.module_from_spec(spec)
sys.modules["backend_app_main"] = backend_module
spec.loader.exec_module(backend_module)

# 4. Expose the app object for Gunicorn
app = backend_module.app
