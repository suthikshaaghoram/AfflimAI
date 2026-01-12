#!/bin/bash
set -e

# EC2 Setup Script for AfflimAI
# This script prepares an Ubuntu EC2 instance for the application.
# It installs dependencies, sets up a lightweight CPU-only environment, and configures system services.

echo "--- Starting AfflimAI Setup ---"

# 1. Update System & Install Native Dependencies
echo "[1/6] Updating system and installing dependencies (ffmpeg, python3-venv)..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv ffmpeg nginx unzip

# 2. Set up Python Environment
echo "[2/6] Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate

# 3. Install PyTorch (CPU Only) - Crucial for "Lightweight" request ~200MB vs 2GB
echo "[3/6] Installing PyTorch (CPU version) to save space..."
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# 4. Install Project Requirements
echo "[4/6] Installing application requirements..."
# Exclude packages that might conflict or we already installed optimized versions of
pip install -r requirements.txt

# 5. Playwright Setup (Headless Browser)
echo "[5/6] Setting up Playwright..."
playwright install chromium
sudo playwright install-deps chromium

# 6. Create Start Script
echo "[6/6] Creating start script..."
cat << 'EOF' > start_app.sh
#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
# Run Gunicorn with Uvicorn workers
# Adjust workers matches (2 x CPU) + 1. For t2.micro (1 CPU), 2-3 workers is good.
exec gunicorn app.main:app \
    --workers 3 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
EOF
chmod +x start_app.sh

echo "--- Setup Complete! ---"
echo "To start the app manually, run: ./start_app.sh"
echo "To keep it running, use: nohup ./start_app.sh &"
