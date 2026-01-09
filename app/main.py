
import sys
import os

# Add the 'backend' directory to sys.path so that internal imports (like 'api') work correctly
# We get the parent directory of this file (root), then add 'backend'
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, 'backend')

sys.path.append(backend_dir)

# Now we can import the actual FastAPI app from the backend source
from app.main import app
