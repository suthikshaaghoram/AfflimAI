# Deployment Guide

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Monitoring \& Logging](#monitoring--logging)
- [Security Hardening](#security-hardening)
- [Scaling Strategies](#scaling-strategies)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### Infrastructure
- [ ] Domain name registered
- [ ] SSL certificate ready (Let's Encrypt recommended)
- [ ] Server/hosting provider selected
- [ ] Database storage plan
- [ ] Backup strategy defined

### Code
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Secrets secured (not in code)
- [ ] CORS configured for production
- [ ] Error handling comprehensive
- [ ] Logging configured

### Performance
- [ ] Load testing completed
- [ ] Caching strategy implemented
- [ ] File storage optimized
- [ ] API rate limiting added
- [ ] Database optimized

### Security
- [ ] HTTPS enforced
- [ ] Input validation comprehensive
- [ ] Authentication implemented (if needed)
- [ ] API keys rotated
- [ ] Security headers configured

---

## Backend Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')"

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p outputs chroma_db cache

# Expose port
EXPOSE 8000

# Run with Gunicorn + Uvicorn workers
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

#### 2. Create docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - HUGGINGFACE_API_KEY=${HUGGINGFACE_API_KEY}
      - MODEL_ID=deepseek-ai/DeepSeek-V3
    volumes:
      - ./backend/outputs:/app/outputs
      - ./backend/chroma_db:/app/chroma_db
      - ./backend/cache:/app/cache
    restart: unless-stopped
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped
```

#### 3. Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Traditional Server Deployment

#### 1. Update Requirements

```bash
# Add production dependencies
echo "gunicorn" >> backend/requirements.txt
```

#### 2. Install on Server

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone https://github.com/yourusername/AfflimAI.git
cd AfflimAI/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download NLTK data
python3 -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')"

# Set environment variables
cp .env.example .env
nano .env  # Edit with production values
```

#### 3. Configure Systemd Service

```ini
# /etc/systemd/system/afflimai.service
[Unit]
Description=AfflimAI Backend
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/AfflimAI/backend
Environment="PATH=/var/www/AfflimAI/backend/venv/bin"
ExecStart=/var/www/AfflimAI/backend/venv/bin/gunicorn app.main:app \
    -w 4 \
    -k uvicorn.workers.UvicornWorker \
    -b 0.0.0.0:8000 \
    --access-logfile /var/log/afflimai/access.log \
    --error-logfile /var/log/afflimai/error.log

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable afflimai
sudo systemctl start afflimai
sudo systemctl status afflimai
```

#### 4. Configure Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/afflimai
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
    
    # Max upload size
    client_max_body_size 10M;
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/afflimai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 3: Platform-as-a-Service (PaaS)

#### Render.com

Create `render.yaml`:

```yaml
services:
  - type: web
    name: afflimai-backend
    env: python
    buildCommand: "pip install -r requirements.txt && python -c 'import nltk; nltk.download(\"punkt\"); nltk.download(\"punkt_tab\")'"
    startCommand: "gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT"
    envVars:
      - key: HUGGINGFACE_API_KEY
        sync: false
      - key: MODEL_ID
        value: deepseek-ai/DeepSeek-V3
    disk:
      name: afflimai-data
      mountPath: /opt/render/project/src/outputs
      sizeGB: 10
```

Deploy: Connect GitHub repo to Render and deploy automatically.

#### Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Heroku

```bash
# Create Procfile
echo "web: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:\$PORT" > Procfile

# Deploy
heroku create afflimai-backend
git push heroku main
heroku config:set HUGGINGFACE_API_KEY=your_key_here
```

---

## Frontend Deployment

### Option 1: Static Hosting (Vercel, Netlify)

#### Build for Production

```bash
cd frontend
npm run build
```

This creates a `dist/` directory with optimized static files.

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Or connect GitHub repo for automatic deployments
```

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=dist
```

**Netlify Configuration** (`netlify.toml`):

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 2: Docker + Nginx

#### Create Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Environment Configuration

### Backend Environment Variables

**Production `.env`**:

```bash
# API Configuration
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxx
MODEL_ID=deepseek-ai/DeepSeek-V3

# Server Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=4

# CORS (Update with your frontend URL)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/afflimai/app.log

# Cache Configuration
CACHE_DIR=/app/cache
CACHE_MAX_SIZE_MB=500

# ChromaDB Configuration
CHROMA_DB_PATH=/app/chroma_db
CHROMA_DB_PERSIST=true

# File Storage
OUTPUT_DIR=/app/outputs
MAX_FILE_AGE_DAYS=30  # Auto-cleanup old files
```

### Frontend Environment Variables

Create `.env.production`:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=AfflimAI
VITE_APP_VERSION=1.0.0
```

Update `frontend/src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
```

---

## Database Setup

### ChromaDB Persistence

Ensure ChromaDB data persists across deployments:

**Docker Volume**:
```yaml
volumes:
  - chroma_data:/app/chroma_db
```

**Server Deployment**:
```bash
# Create persistent directory
sudo mkdir -p /var/lib/afflimai/chroma_db
sudo chown www-data:www-data /var/lib/afflimai/chroma_db

# Update paths in config
CHROMA_DB_PATH=/var/lib/afflimai/chroma_db
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/afflimai"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup ChromaDB
tar -czf "$BACKUP_DIR/chroma_db_$DATE.tar.gz" /var/lib/afflimai/chroma_db

# Backup outputs
tar -czf "$BACKUP_DIR/outputs_$DATE.tar.gz" /var/lib/afflimai/outputs

# Keep last 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

**Cron Job**:
```bash
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup.sh
```

---

## Monitoring & Logging

### Application Logging

Configure structured logging:

```python
# backend/app/config.py
import logging
import sys

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('/var/log/afflimai/app.log')
        ]
    )
```

### Error Tracking

#### Sentry Integration

```bash
pip install sentry-sdk
```

```python
# backend/app/main.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://your-sentry-dsn",
    integrations=[FastApiIntegration()],
    environment="production",
    traces_sample_rate=0.1
)
```

### Performance Monitoring

#### Prometheus + Grafana

```bash
pip install prometheus-fastapi-instrumentator
```

```python
# backend/app/main.py
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()
Instrumentator().instrument(app).expose(app)
```

### Health Checks

```python
# backend/api/v1/endpoints/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }
```

---

## Security Hardening

### 1. HTTPS/SSL

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renew
sudo certbot renew --dry-run
```

### 2. Update CORS

```python
# backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],  # NO wildcards in production
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

```bash
pip install slowapi
```

```python
# backend/app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/generate-manifestation")
@limiter.limit("10/minute")
async def generate_manifestation(request: Request, ...):
    ...
```

### 4. Security Headers

```python
# backend/app/main.py
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware

# app.add_middleware(HTTPSRedirectMiddleware)  # Redirect HTTP to HTTPS
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### 5. Input Sanitization

Already implemented via Pydantic, but add extra validation:

```python
import re

def sanitize_filename(name: str) -> str:
    return re.sub(r'[^a-zA-Z0-9_-]', '', name)
```

---

## Scaling Strategies

### Horizontal Scaling

#### Load Balancer (Nginx)

```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location / {
        proxy_pass http://backend;
    }
}
```

### Caching Layer

#### Redis for API Responses

```bash
pip install redis
```

```python
import redis
from functools import wraps

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cache_response(expire=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expire, json.dumps(result))
            return result
        return wrapper
    return decorator
```

### CDN for Static Assets

Use Cloudflare, AWS CloudFront, or similar for:
- Frontend static files
- Generated audio files (if publicly accessible)

---

## Production Checklist

Before going live:

- [ ] SSL certificate installed and auto-renewing
- [ ] CORS configured for production domains only
- [ ] Environment variables secured (no hardcoded secrets)
- [ ] Rate limiting enabled
- [ ] Error tracking (Sentry) configured
- [ ] Logging to persistent storage
- [ ] Backup automation running
- [ ] Health check endpoint tested
- [ ] Load testing completed
- [ ] Security headers added
- [ ] Firewall rules configured
- [ ] Database persistence verified
- [ ] Monitoring dashboard set up
- [ ] Documentation updated with production URLs

---

*Last Updated: January 2, 2026*
