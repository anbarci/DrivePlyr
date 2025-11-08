# DrivePlyr - Entegrasyon ve Kurulum Rehberi

## 📋 İçindekiler
1. [Hızlı Başlangıç](#hızlı-başlangıç)
2. [Backend Kurulumu](#backend-kurulumu)
3. [Frontend Kurulumu](#frontend-kurulumu)
4. [Admin Panel](#admin-panel)
5. [API Kullanımı](#api-kullanımı)
6. [Sorun Giderme](#sorun-giderme)

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- MongoDB 5+
- Git

### Adım 1: Projeyi Klonla
```bash
git clone https://github.com/anbarci/DrivePlyr.git
cd DrivePlyr
git checkout development
```

### Adım 2: Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
```

### Adım 3: .env Dosyasını Düzenle
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/driveplyr
JWT_SECRET=your_super_secret_key_here
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
ALLOWED_DOMAINS=localhost,127.0.0.1
```

### Adım 4: Backend Sunucusunu Başlat
```bash
npm run dev
```

### Adım 5: Frontend Sunucusu (Yeni Terminal)
```bash
cd ..
python -m http.server 8000
# veya
npx http-server
```

## 📦 Backend Kurulumu

### Dosya Yapısı
```
backend/
├── models/
│   ├── User.js           # Kullanıcı modeli
│   ├── Video.js          # Video modeli
│   ├── Playlist.js       # Playlist modeli
│   ├── Subtitle.js       # Altyazı modeli
│   └── Analytics.js      # Analytics modeli
├── routes/
│   ├── auth.js           # Kimlik doğrulama
│   ├── videos.js         # Video işlemleri
│   ├── playlists.js      # Playlist işlemleri
│   ├── subtitles.js      # Altyazı işlemleri
│   ├── analytics.js      # Analytics
│   └── users.js          # Kullanıcı yönetimi
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── hotlink.js        # Hotlink koruma
│   ├── validation.js     # Input validasyonu
│   └── errorHandler.js   # Hata yönetimi
├── server.js             # Ana sunucu
└── package.json          # Dependencies
```

### API Endpoints

#### Kimlik Doğrulama
```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
PUT /api/auth/updateprofile
PUT /api/auth/changepassword
```

#### Videolar
```bash
GET /api/videos                    # Tüm videoları listele
GET /api/videos/:id               # Video detayları
POST /api/videos                   # Yeni video ekle
PUT /api/videos/:id               # Video güncelle
DELETE /api/videos/:id            # Video sil
GET /api/videos/stats/trending    # Trending videolar
POST /api/videos/:id/view         # İzlenme takibi
```

#### Playlistler
```bash
GET /api/playlists                    # Playlistleri listele
POST /api/playlists                   # Playlist oluştur
GET /api/playlists/:id               # Playlist detayları
POST /api/playlists/:id/videos       # Video ekle
DELETE /api/playlists/:id/videos/:videoId  # Video sil
```

#### Altyazılar
```bash
GET /api/subtitles/video/:videoId   # Video altyazıları
POST /api/subtitles                   # Altyazı ekle
GET /api/subtitles/:id               # Altyazı detayları
GET /api/subtitles/:id/download      # Altyazı indir
```

#### Analytics
```bash
GET /api/analytics/video/:videoId    # Video analytics
GET /api/analytics/trending          # Trending videolar
POST /api/analytics/track            # Analytics takibi
```

## 🎨 Frontend Yapısı

### Ana Dosyalar
```
├── index-new.html          # Yeni ana sayfa (modern tasarım)
├── player.html             # Video oynatıcı sayfası
├── admin/
│   ├── login.html          # Admin giriş
│   ├── index.html          # Admin dashboard
│   ├── css/
│   │   └── admin.css       # Admin stil
│   └── js/
│       ├── auth.js         # Kimlik doğrulama
│       ├── admin.js        # Admin işlemleri
│       └── videos.js       # Video yönetimi
```

### Responsive Özellikleri
- 📱 Mobile First Yaklaşım
- 🖥️ Desktop Optimizasyon
- ⌚ Tablet Desteği
- 🌍 Tüm ekran boyutları

## 🔐 Admin Panel

### Giriş Bilgileri (İlk Kurulum)
```
Email: admin@driveplyr.com
Password: admin123
```

### Özellikleri
- ✅ Dashboard ile istatistik
- ✅ Video yönetimi (CRUD)
- ✅ Playlist yönetimi
- ✅ Altyazı yönetimi
- ✅ Embed kod üretici
- ✅ Analytics raporları
- ✅ Kullanıcı yönetimi (Admin)
- ✅ Sistem ayarları

## 📊 API Kullanım Örnekleri

### Video Ekleme
```javascript
const response = await fetch('http://localhost:5000/api/videos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    title: 'Video Başlığı',
    description: 'Video açıklaması',
    driveUrl: 'https://drive.google.com/file/d/...',
    driveId: 'file_id_here',
    category: 'movie',
    poster: 'https://...',
    tags: ['tag1', 'tag2']
  })
});
```

### Altyazı Ekleme
```javascript
const response = await fetch('http://localhost:5000/api/subtitles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    video: 'video_id',
    language: 'Turkish',
    languageCode: 'tr',
    label: 'Türkçe',
    content: 'VTT/SRT content here',
    format: 'vtt'
  })
});
```

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası
```bash
# MongoDB'yi başlatın
mongod

# Veya MongoDB Atlas kullanıyorsanız .env'de URI'ı güncelleyin
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/driveplyr
```

### CORS Hatası
```bash
# .env'de CORS_ORIGIN'ı güncelleyin
CORS_ORIGIN=http://localhost:8000,http://localhost:3000
```

### Token Hatası
```bash
# JWT_SECRET'ı .env'de değiştirin
JWT_SECRET=your_new_secret_key_123
```

## 🚀 Production Deployment

### Heroku
```bash
heroku create driveplyr-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret
git push heroku development:main
```

### VPS/Sunucu
```bash
# PM2 kurulumu
npm install -g pm2
pm2 start backend/server.js --name driveplyr
pm2 startup
pm2 save
```

## 📄 Lisans
MIT License

## 👨‍💻 Katkıda Bulunma
Pull request gönderin veya issue açın!