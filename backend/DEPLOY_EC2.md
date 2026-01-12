# Deploying AfflimAI to AWS EC2

This guide describes how to deploy the backend to an AWS EC2 instance (Ubuntu).

## Prerequisites
1.  **AWS Account** with an active EC2 instance running **Ubuntu 22.04 LTS** or **24.04 LTS**. (t2.small or t3.small recommended due to Python/ML deps, but t2.micro *might* work with swap).
2.  **SSH Key** (`.pem` file) to access your instance.
3.  **Inbound Rules**: Ensure port `8000` is open in your Security Group (or port 80 if you configure Nginx reverse proxy).

## Step 1: Upload Code
Copy the `backend` directory to your EC2 instance.

```bash
# From your local machine
scp -i /path/to/key.pem -r backend ubuntu@<your-ec2-ip>:~/afflimai-backend
```

## Step 2: Run Setup Script
SSH into your instance and run the setup script. This script automatically:
- Installs System Dependencies (`ffmpeg`, `python3-venv`, etc.)
- Sets up a Python Virtual Environment
- Installs **CPU-optimized** PyTorch (saving ~2GB space)
- Installs Playwright browsers
- creates a `start_app.sh` script

```bash
ssh -i /path/to/key.pem ubuntu@<your-ec2-ip>

cd ~/afflimai-backend
chmod +x setup_ec2.sh
./setup_ec2.sh
```

## Step 3: Configure Environment
Create your `.env` file on the server.

```bash
nano .env
```
Paste your environment variables (`GEMINI_API_KEY`, `ASTRO_API_KEY`, etc.) and save (`Ctrl+O`, `Enter`, `Ctrl+X`).

## Step 4: Start the Application
Run the application using the start script.

```bash
# Run in background (keeps running after you exit SSH)
nohup ./start_app.sh > app.log 2>&1 &

# Check if it's running
tail -f app.log
```

## Step 5: Verify
Visit `http://<your-ec2-ip>:8000/docs` in your browser.

## (Optional) Systemd Persistence
To make the app restart automatically if the server reboots:

1. Edit service file: `sudo nano /etc/systemd/system/afflimai.service`
2. Paste content:
   ```ini
   [Unit]
   Description=AfflimAI Backend
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/afflimai-backend
   ExecStart=/home/ubuntu/afflimai-backend/start_app.sh
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable it: `sudo systemctl enable --now afflimai`
