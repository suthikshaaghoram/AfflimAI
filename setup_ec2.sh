#!/bin/bash
set -e

# ==========================================
# AfflimAI EC2 Full Stack Setup Script
# ==========================================
# This script deploys both Backend (FastAPI) and Frontend (React/Vite) on Ubuntu EC2.
# It sets up Nginx as a web server and reverse proxy.

PROJECT_DIR=$(pwd)
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "========================================"
echo "    Starting AfflimAI Deployment"
echo "========================================"

# 1. Update System & Install Dependencies
echo "[1/7] Updating system and installing dependencies..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv ffmpeg nginx unzip curl

# Install Node.js (LTS)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# 2. Setup Backend
echo "[2/7] Setting up Backend..."
cd "$BACKEND_DIR"

# Create/Update Virtual Environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate

# Install Dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
# Install optimized PyTorch (CPU)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt

# Playwright
echo "Installing Playwright browsers..."
playwright install chromium
sudo playwright install-deps chromium

# Create backend start script
cat << 'EOF' > start_backend.sh
#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
exec gunicorn app.main:app \
    --workers 3 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
EOF
chmod +x start_backend.sh

echo "Backend setup complete."

# 3. Setup Frontend
echo "[3/7] Setting up Frontend..."
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm ci || npm install
fi

echo "Building frontend..."
VITE_API_URL="" npm run build

echo "Frontend build complete."

# 4. Configure Systemd for Backend
echo "[4/7] Configuring Systemd service..."
SERVICE_FILE="/etc/systemd/system/afflimai.service"

sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=AfflimAI Backend Service
After=network.target

[Service]
User=$USER
WorkingDirectory=$BACKEND_DIR
ExecStart=$BACKEND_DIR/start_backend.sh
Restart=always
EnvironmentFile=$BACKEND_DIR/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
# We don't enable it yet, user needs to set .env first

# 5. Configure Nginx
echo "[5/7] Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/afflimai"

# Ensure log directory exists
sudo mkdir -p /var/log/nginx

sudo bash -c "cat > $NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;

    # Frontend Static Files
    location / {
        root $FRONTEND_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Swagger docs support (optional)
    location /docs {
        proxy_pass http://127.0.0.1:8000;
         proxy_set_header Host \$host;
    }
     location /openapi.json {
        proxy_pass http://127.0.0.1:8000;
         proxy_set_header Host \$host;
    }
}
EOF

# Enable Site
if [ -L /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
fi

if [ ! -L /etc/nginx/sites-enabled/afflimai ]; then
    sudo ln -s $NGINX_CONF /etc/nginx/sites-enabled/
fi

echo "Testing Nginx configuration..."
sudo nginx -t

# 6. Final Instructions
echo "========================================"
echo "    Setup Almost Complete!"
echo "========================================"
echo ""
echo "NEXT STEPS:"
echo "1. Create your .env file in the backend directory:"
echo "   nano backend/.env"
echo ""
echo "2. Start the backend service:"
echo "   sudo systemctl enable afflimai"
echo "   sudo systemctl start afflimai"
echo ""
echo "3. Restart Nginx to apply changes:"
echo "   sudo systemctl restart nginx"
echo ""
echo "Your app should then be live at http://<your-ec2-ip>/"
echo "========================================"
