# DrivePlyr Backend API

## 🚀 Profesyonel Video Yönetim Backend Sistemi

Node.js, Express ve MongoDB kullanarak geliştirilmiş tam özellikli RESTful API.

## ✨ Özellikler

### 🔐 Authentication & Authorization
- JWT tabanlı kimlik doğrulama
- Rol tabanlı yetkilendirme (User, Moderator, Admin)
- Permission-based access control
- Şifre hashleme (bcrypt)
- Token refresh mechanism

### 📹 Video Yönetimi
- CRUD işlemleri
- Google Drive entegrasyonu
- Kategori ve tag sistemi
- Arama ve filtreleme
- Pagination desteği
- View tracking
- Multi-quality support

### 🎬 Playlist Sistemi
- Playlist oluşturma ve yönetimi
- Video sıralama
- Collaborator sistemi
- Public/Private playlists

### 📊 Gelişmiş Analytics
- Video görüntülenme istatistikleri
- Watch time tracking
- Device & browser analytics
- Geographic analytics
- Referrer tracking
- Trending videos
- Daily/Weekly/Monthly reports

### 📝 Subtitle Yönetimi
- Multiple language support
- SRT & VTT format
- Auto-conversion (SRT to VTT)
- Upload & download
- Inline editing

### 🔒 Hotlink Koruması
- Domain whitelisting
- Per-video domain control
- Rate limiting per domain
- Referer validation

### 👥 Multi-User Sistem
- User management
- Role assignment
- User activation/deactivation
- Profile management

## 📁 Proje Yapısı

```
backend/
├── server.js              # Ana sunucu dosyası
├── package.json          # Dependencies
├── .env.example          # Environment variables şablonu
├── models/               # MongoDB models
│   ├── User.js
│   ├── Video.js
│   ├── Playlist.js
│   ├── Subtitle.js
│   └── Analytics.js
├── routes/               # API routes
│   ├── auth.js
│   ├── videos.js
│   ├── users.js
│   ├── playlists.js
│   ├── subtitles.js
│   └── analytics.js
├── middleware/           # Custom middleware
│   ├── auth.js           # Authentication
│   ├── hotlink.js        # Hotlink protection
│   └── error.js          # Error handling
└── README.md             # Dokümantasyon
```

## 🛠️ Kurulum

### Gereksinimler
- Node.js (v18+)
- MongoDB (v5+)
- npm veya yarn

### Adım 1: Dependencies Yükle

```bash
cd backend
npm install
```

### Adım 2: Environment Variables

`.env.example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/driveplyr
JWT_SECRET=your_secret_key_here
GOOGLE_DRIVE_API_KEY=your_api_key
CORS_ORIGIN=http://localhost:3000,https://anbarci.github.io
ALLOWED_DOMAINS=anbarci.github.io,localhost
```

### Adım 3: MongoDB Başlat

**Yerel MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
`.env` dosyasında connection string'i güncelleyin.

### Adım 4: Sunucuyu Başlat

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Sunucu çalışıyor: `http://localhost:5000`

## 📚 API Dokümantasyonu

### Base URL
```
http://localhost:5000/api
```

### Authentication

Tüm protected endpoint'ler için JWT token gereklidir:

```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Update Profile**
```http
PUT /api/auth/updateprofile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "avatar": "https://..."
}
```

**Change Password**
```http
PUT /api/auth/changepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

#### Videos

**Get All Videos**
```http
GET /api/videos?page=1&limit=20&category=movie&sort=-views
```

**Get Single Video**
```http
GET /api/videos/:id
```

**Create Video**
```http
POST /api/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Video Title",
  "description": "Video description",
  "driveUrl": "https://drive.google.com/file/d/...",
  "category": "movie",
  "tags": ["action", "adventure"]
}
```

**Update Video**
```http
PUT /api/videos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

**Delete Video**
```http
DELETE /api/videos/:id
Authorization: Bearer <token>
```

**Track View**
```http
POST /api/videos/:id/view
```

**Get Trending Videos**
```http
GET /api/videos/stats/trending?days=7&limit=10
```

#### Playlists

**Get All Playlists**
```http
GET /api/playlists?page=1&limit=20
```

**Get Single Playlist**
```http
GET /api/playlists/:id
```

**Create Playlist**
```http
POST /api/playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Playlist",
  "description": "My favorite videos",
  "category": "movie"
}
```

**Add Video to Playlist**
```http
POST /api/playlists/:id/videos
Authorization: Bearer <token>
Content-Type: application/json

{
  "videoId": "video_id_here",
  "order": 0
}
```

**Remove Video from Playlist**
```http
DELETE /api/playlists/:id/videos/:videoId
Authorization: Bearer <token>
```

#### Subtitles

**Get Video Subtitles**
```http
GET /api/subtitles/video/:videoId
```

**Upload Subtitle**
```http
POST /api/subtitles
Authorization: Bearer <token>
Content-Type: application/json

{
  "video": "video_id",
  "language": "Turkish",
  "languageCode": "tr",
  "label": "Türkçe",
  "content": "SRT content here",
  "format": "srt"
}
```

**Download Subtitle**
```http
GET /api/subtitles/:id/download?format=vtt
```

#### Analytics

**Get Video Analytics**
```http
GET /api/analytics/video/:videoId?days=30
Authorization: Bearer <token>
```

**Get Video Panel (Owner/Admin)**
```http
GET /api/analytics/video/:videoId/panel?days=30
Authorization: Bearer <token>
```

**Get Trending Videos**
```http
GET /api/analytics/trending?days=7&limit=10
Authorization: Bearer <token>
```

**Get Overview (Admin)**
```http
GET /api/analytics/overview?days=30
Authorization: Bearer <admin_token>
```

**Track Analytics**
```http
POST /api/analytics/track
Content-Type: application/json

{
  "videoId": "video_id",
  "watchTime": 120,
  "device": "mobile",
  "browser": "Chrome",
  "country": {
    "code": "TR",
    "name": "Turkey"
  },
  "referrer": "google.com"
}
```

#### Users (Admin Only)

**Get All Users**
```http
GET /api/users?page=1&limit=20&role=user
Authorization: Bearer <admin_token>
```

**Update User Role**
```http
PUT /api/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "moderator"
}
```

**Activate/Deactivate User**
```http
PUT /api/users/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

## 🔒 Rol ve Yetkiler

### Roller
- **User**: Temel kullanıcı
- **Moderator**: İçerik yöneticisi
- **Admin**: Tüm yetkiler

### Permissions
- `videos.create`: Video ekleme
- `videos.edit`: Video düzenleme
- `videos.delete`: Video silme
- `playlists.create`: Playlist oluşturma
- `playlists.edit`: Playlist düzenleme
- `playlists.delete`: Playlist silme
- `users.manage`: Kullanıcı yönetimi
- `analytics.view`: Analytics görüntüleme
- `settings.manage`: Ayar yönetimi

## 🔥 Hotlink Koruması

Videoların yetkisiz domainlerden embed edilmesini engeller:

### Global Ayar
`.env` dosyasında:
```env
ALLOWED_DOMAINS=anbarci.github.io,localhost,*.yourdomain.com
```

### Video Bazlı Ayar
Video oluştururken:
```json
{
  "allowedDomains": ["anbarci.github.io", "custom.domain.com"]
}
```

## 📊 Rate Limiting

- Global: 100 request / 15 dakika
- Domain bazında: 100 request / dakika

## 🧠 Veritabanı Şeması

### User
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  permissions: [String],
  avatar: String,
  isActive: Boolean,
  lastLogin: Date
}
```

### Video
```javascript
{
  title: String,
  description: String,
  driveId: String,
  driveUrl: String,
  poster: String,
  category: String,
  tags: [String],
  owner: ObjectId,
  views: Number,
  likes: Number,
  isPublic: Boolean,
  allowedDomains: [String],
  subtitles: [Object],
  analytics: Object
}
```

### Playlist
```javascript
{
  name: String,
  description: String,
  owner: ObjectId,
  videos: [{
    video: ObjectId,
    order: Number
  }],
  isPublic: Boolean,
  category: String
}
```

## 🚀 Deployment

### Heroku
```bash
heroku create driveplyr-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku backend-api:main
```

### VDS/VPS
```bash
# PM2 ile
npm install -g pm2
pm2 start server.js --name driveplyr-api
pm2 startup
pm2 save

# Nginx reverse proxy
sudo nano /etc/nginx/sites-available/driveplyr
```

Nginx config:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 Lisans

MIT License

## 👨‍💻 Geliştirici

[@anbarci](https://github.com/anbarci)

## 🙏 Katkıda Bulunanlar

Katkılarınız için pull request gönderin!

---

**Not**: Bu backend API production-ready olup, güvenlik best practice'lerini takip eder. Deployment öncesinde environment variables'ları güncellemeyi unutmayın!
