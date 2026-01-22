# Deploying AfflimAI to AWS EC2 (No Docker)

This guide describes how to deploy the full AfflimAI application (Frontend + Backend) to an AWS EC2 instance (Ubuntu).

## Prerequisites

1.  **AWS Account** with an active EC2 instance running **Ubuntu 22.04 LTS** or **24.04 LTS**.
    *   **Recommended Size**: `t3.medium` or `t3.small` (due to Machine Learning / Playwright dependencies).
    *   `t2.micro` might struggle with memory during installation.
2.  **SSH Key** (`.pem` file) to access your instance.
3.  **Inbound Rules**: Ensure ports `80` (HTTP) and `22` (SSH) are open in your Security Group.

## Deployment Steps

### 1. Upload the Code
Copy the entire `AfflimAI` project folder to your EC2 instance.

```bash
# Run this from your local machine
scp -i /path/to/key.pem -r AfflimAI ubuntu@<your-ec2-ip>:~/AfflimAI
```

### 2. Connect to EC2
SSH into your instance.

```bash
ssh -i /path/to/key.pem ubuntu@<your-ec2-ip>
```

### 3. Run the Setup Script
Navigate to the project folder and run the automated setup script. This script will install all dependencies (Python, Node.js, Nginx), build the frontend, and configure the system.

```bash
cd ~/AfflimAI
chmod +x setup_ec2.sh
./setup_ec2.sh
```

**Note**: This process may take 5-10 minutes depending on internet speed and instance size.

### 4. Configure Environment Variables
You need to create the `.env` file for the backend.

```bash
nano backend/.env
```

Paste your environment variables (e.g., keys for Gemini, Database, etc.):
```env
# Example
GEMINI_API_KEY=your_key_here
# Add other variables as needed
```
Save and exit (`Ctrl+O` -> `Enter` -> `Ctrl+X`).

### 5. Start Services
Enable and start the backend service, then restart Nginx.

```bash
# Start Backend
sudo systemctl enable afflimai
sudo systemctl start afflimai

# Start Web Server
sudo systemctl restart nginx
```

### 6. Verify Deployment
Open your browser and visit your EC2 IP address:
`http://<your-ec2-ip>/`

You should see the application load. The frontend communicates with the backend via `/api`.

---

## Troubleshooting

- **Check Backend Logs**:
  ```bash
  sudo journalctl -u afflimai -f
  ```
- **Check Nginx Logs**:
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```
- **Restart Backend**:
  ```bash
  sudo systemctl restart afflimai
  ```
