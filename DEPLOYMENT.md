# DrivePlyr Deployment Rehberi

## 🚀 Production Kurulumu

### 1. Server Hazırlama

#### Sistem Gereksinimleri
- Ubuntu 20.04 LTS
- Node.js 18+
- MongoDB 5+
- Nginx
- SSL Sertifikası (Let's Encrypt)

#### Packages Kurulumu
```bash
sudo apt update && sudo apt upgrade
sudo apt install curl software-properties-common git nginx

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# MongoDB
sudo apt install mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod
```

### 2. Projeyi Deploy Etme

```bash
# Kullanıcı oluştur
sudo useradd -m -s /bin/bash driveplyr
sudo su - driveplyr

# Projeyi klonla
git clone https://github.com/anbarci/DrivePlyr.git
cd DrivePlyr
git checkout main

# Backend kurulumu
cd backend
npm install --production
cp .env.example .env
```

### 3. Environment Konfigürasyonu

```bash
# .env dosyasını düzenle
nano .env
```

```env
# Production Settings
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/driveplyr

# Security
JWT_SECRET=your_very_secure_secret_key_here_change_it
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Hotlink Protection
ALLOWED_DOMAINS=yourdomain.com,www.yourdomain.com,*.yourdomain.com

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Analytics
ENABLE_ANALYTICS=true
```

### 4. PM2 Configuration

```bash
# PM2 kurulumu
sudo npm install -g pm2

# ecosystem.config.js oluştur
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'driveplyr-api',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# PM2 başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx Configuration

```bash
# Nginx config oluştur
sudo nano /etc/nginx/sites-available/driveplyr
```

```nginx
upstream driveplyr_backend {
    server 127.0.0.1:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    client_max_body_size 100M;

    # API proxy
    location /api {
        proxy_pass http://driveplyr_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        root /home/driveplyr/DrivePlyr;
        try_files $uri $uri/ /index-new.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # Admin panel
    location /admin {
        root /home/driveplyr/DrivePlyr;
        try_files $uri $uri/ /admin/index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 6. SSL/TLS (Let's Encrypt)

```bash
# Certbot kurulması
sudo apt install certbot python3-certbot-nginx

# Sertifika oluştur
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# HTTPS Nginx config
sudo nano /etc/nginx/sites-available/driveplyr
```

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Rest of config...
}
```

### 7. Nginx Aktivasyon

```bash
# Konfigürasyonu test et
sudo nginx -t

# Enable site
sudo ln -s /etc/nginx/sites-available/driveplyr /etc/nginx/sites-enabled/

# Restart Nginx
sudo systemctl restart nginx
```

### 8. Firewall Konfigürasyonu

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9. Backup ve Restore

```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/driveplyr" --out=/backups/

# MongoDB restore
mongorestore --uri="mongodb://localhost:27017/driveplyr" /backups/

# Scheduled backup (crontab)
0 2 * * * /usr/local/bin/backup-driveplyr.sh
```

### 10. Monitoring

```bash
# PM2 monitoring
pm2 monit

# Log görüntüleme
pm2 logs driveplyr-api

# System monitoring
top
htop
```

## 📊 Performance Optimization

### Database Optimization
```bash
# MongoDB indexing
db.videos.createIndex({ createdAt: -1 })
db.videos.createIndex({ views: -1 })
db.videos.createIndex({ owner: 1 })
db.analytics.createIndex({ video: 1, timestamp: -1 })
```

### Caching Strategy
```nginx
# Browser cache
add_header Cache-Control "public, max-age=31536000" for static files;

# API caching
add_header Cache-Control "public, max-age=300" for API responses;
```

## 🔒 Security Checklist

- [x] SSL/TLS enabled
- [x] Rate limiting configured
- [x] CORS properly set
- [x] Input validation added
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Security headers
- [x] Environment variables protected
- [x] Firewall configured

## 🆘 Troubleshooting

### Port 5000 Already in Use
```bash
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Failed
```bash
sudo systemctl restart mongod
mongo --eval "db.adminCommand('ping')"
```

### SSL Certificate Error
```bash
sudo certbot renew --force-renewal
```

### High Memory Usage
```bash
pm2 restart driveplyr-api --max-memory-restart 500M
```
