# Staging Environment Setup Guide

## Overview

This guide walks you through setting up a staging environment for the Vasenvolt CI/CD pipeline. The staging environment serves as a pre-production testing ground for deployments.

## Prerequisites

- Ubuntu 20.04+ server with SSH access
- PostgreSQL 15+ installed
- Redis 7+ installed
- Python 3.11+ installed
- Node.js 18+ installed (for build tools)
- Nginx or Apache for reverse proxy
- SSL certificate for HTTPS

## Server Setup

### 1. Create Staging User

```bash
# Create deployment user
sudo adduser vasenvolt-deploy
sudo usermod -aG sudo vasenvolt-deploy

# Switch to deployment user
sudo su - vasenvolt-deploy
```

### 2. Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3.11-dev
sudo apt install -y postgresql postgresql-contrib
sudo apt install -y redis-server
sudo apt install -y nginx
sudo apt install -y git curl wget unzip
sudo apt install -y build-essential libpq-dev
```

### 3. Configure PostgreSQL

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE vasenvolt_staging;
CREATE USER vasenvolt_staging WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE vasenvolt_staging TO vasenvolt_staging;
ALTER USER vasenvolt_staging CREATEDB;
\q

# Test connection
psql -h localhost -U vasenvolt_staging -d vasenvolt_staging
```

### 4. Configure Redis

```bash
# Redis is typically configured correctly by default
# Verify it's running
sudo systemctl status redis-server

# Test connection
redis-cli ping
```

## Application Setup

### 1. Clone Repository

```bash
# Clone the repository
cd /opt
sudo git clone https://github.com/your-username/vasenvolt.git
sudo chown -R vasenvolt-deploy:vasenvolt-deploy vasenvolt

# Navigate to backend
cd vasenvolt/backend
```

### 2. Setup Python Environment

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy production environment file
cp env.production .env.staging

# Edit environment variables
nano .env.staging

# Key changes for staging:
APP_ENV=staging
DATABASE__DATABASE_URL=postgresql://vasenvolt_staging:your_secure_password@localhost:5432/vasenvolt_staging
DATABASE__DATABASE_TEST_URL=postgresql://vasenvolt_staging:your_secure_password@localhost:5432/vasenvolt_staging
REDIS__REDIS_URL=redis://localhost:6379/0
CORS__FRONTEND_URL=https://staging.vasenvolt.com
CORS__ALLOWED_ORIGINS=["https://staging.vasenvolt.com", "https://www.staging.vasenvolt.com"]
```

### 4. Initialize Database

```bash
# Set environment
export APP_ENV=staging

# Run migrations
python migrate.py migrate

# Verify tables
python -c "
from app.database import get_db
from app.models import User, Tenant, Site, Meter
db = next(get_db())
print(f'Users: {db.query(User).count()}')
print(f'Tenants: {db.query(Tenant).count()}')
print(f'Sites: {db.query(Site).count()}')
print(f'Meters: {db.query(Meter).count()}')
"
```

## Service Configuration

### 1. Create Systemd Service

```bash
# Create service file
sudo nano /etc/systemd/system/vasenvolt-backend.service
```

Add the following content:

```ini
[Unit]
Description=Vasenvolt Backend API
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=vasenvolt-deploy
Group=vasenvolt-deploy
WorkingDirectory=/opt/vasenvolt/backend
Environment=PATH=/opt/vasenvolt/backend/venv/bin
Environment=APP_ENV=staging
ExecStart=/opt/vasenvolt/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 2. Enable and Start Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable vasenvolt-backend

# Start service
sudo systemctl start vasenvolt-backend

# Check status
sudo systemctl status vasenvolt-backend
```

### 3. Configure Nginx

```bash
# Create nginx configuration
sudo nano /etc/nginx/sites-available/vasenvolt-staging
```

Add the following content:

```nginx
server {
    listen 80;
    server_name staging.vasenvolt.com www.staging.vasenvolt.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.vasenvolt.com www.staging.vasenvolt.com;

    ssl_certificate /etc/letsencrypt/live/staging.vasenvolt.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.vasenvolt.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
        proxy_set_header Host $host;
    }

    # Frontend (if serving from same server)
    location / {
        root /var/www/vasenvolt-staging;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 4. Enable Nginx Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/vasenvolt-staging /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## SSL Certificate

### 1. Install Certbot

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d staging.vasenvolt.com -d www.staging.vasenvolt.com

# Test renewal
sudo certbot renew --dry-run
```

## GitHub Secrets Configuration

### 1. Required Secrets

Add these secrets to your GitHub repository:

```bash
STAGING_HOST=your-staging-server.com
STAGING_USER=vasenvolt-deploy
STAGING_SSH_KEY=your-private-ssh-key
BACKEND_STAGING_URL=https://staging.vasenvolt.com
FRONTEND_STAGING_URL=https://staging.vasenvolt.com
```

### 2. SSH Key Setup

```bash
# Generate SSH key pair (on your local machine)
ssh-keygen -t ed25519 -C "vasenvolt-staging-deploy"

# Copy public key to staging server
ssh-copy-id -i ~/.ssh/id_ed25519.pub vasenvolt-deploy@your-staging-server.com

# Test connection
ssh vasenvolt-deploy@your-staging-server.com
```

## Testing the Setup

### 1. Test Backend API

```bash
# Test health endpoint
curl https://staging.vasenvolt.com/health

# Test database health
curl https://staging.vasenvolt.com/health/db

# Test authentication endpoint
curl -X POST https://staging.vasenvolt.com/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@staging.com",
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

### 2. Test Service Management

```bash
# Check service status
sudo systemctl status vasenvolt-backend

# View logs
sudo journalctl -u vasenvolt-backend -f

# Restart service
sudo systemctl restart vasenvolt-backend
```

## Monitoring and Maintenance

### 1. Log Rotation

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/vasenvolt-backend

# Add content:
/opt/vasenvolt/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 vasenvolt-deploy vasenvolt-deploy
}
```

### 2. Backup Strategy

```bash
# Create backup script
nano /opt/vasenvolt/backup-staging.sh

# Add content:
#!/bin/bash
BACKUP_DIR="/opt/backups/vasenvolt-staging"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U vasenvolt_staging vasenvolt_staging > $BACKUP_DIR/db_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/vasenvolt/backend

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 3. Health Monitoring

```bash
# Create health check script
nano /opt/vasenvolt/health-check.sh

# Add content:
#!/bin/bash

# Check API health
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://staging.vasenvolt.com/health)

if [ $HEALTH -eq 200 ]; then
    echo "API is healthy"
else
    echo "API health check failed: $HEALTH"
    # Send notification or restart service
    sudo systemctl restart vasenvolt-backend
fi
```

## Troubleshooting

### Common Issues

1. **Service won't start**: Check logs with `sudo journalctl -u vasenvolt-backend -f`
2. **Database connection failed**: Verify PostgreSQL is running and credentials are correct
3. **Permission denied**: Check file ownership and permissions
4. **Port already in use**: Check if another service is using port 8000

### Useful Commands

```bash
# Check service logs
sudo journalctl -u vasenvolt-backend -f

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Test database connection
psql -h localhost -U vasenvolt_staging -d vasenvolt_staging

# Test Redis connection
redis-cli ping
```

## Next Steps

1. **Test the CI/CD pipeline** by triggering a manual deployment
2. **Set up monitoring** with tools like Prometheus and Grafana
3. **Configure alerts** for service failures
4. **Set up automated backups** with cron jobs
5. **Implement log aggregation** with ELK stack or similar
