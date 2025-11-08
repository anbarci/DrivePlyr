# DrivePlyr Admin Panel

## 🚀 Profesyonel Video Yönetim Sistemi

DrivePlyr için geliştirilmiş profesyonel admin paneli. GDPlayer.Top benzeri özellikler ile Google Drive videolarınızı kolayca yönetin.

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- Güvenli kullanıcı giriş sistemi
- Oturum yönetimi (LocalStorage tabanlı)
- "Beni Hatırla" özelliği
- Demo hesap: `admin / admin123`

### 📹 Video Yönetimi
- Google Drive video ekleme
- Video düzenleme ve silme
- Kategori yönetimi (Film, Dizi, Belgesel, Diğer)
- Otomatik thumbnail oluşturma
- Video istatistikleri

### 📊 Dashboard
- Toplam video sayısı
- Görüntülenme istatistikleri
- Aktif kullanıcı takibi
- Son eklenen videolar
- En çok izlenen videolar

### 🎬 Embed Generator
- 6 farklı player desteği:
  - Plyr
  - SopPlayer
  - vLiteJS
  - Fluid Player
  - Afterglow
  - MediaElements
- Özelleştirilebilir boyutlar
- Tek tıkla embed kodu kopyalama

### ⚙️ Ayarlar
- Google Drive API Key yönetimi
- Site başlığı özelleştirme
- Analytics entegrasyonu

## 📁 Dosya Yapısı

```
admin/
├── index.html          # Ana dashboard sayfası
├── login.html          # Giriş sayfası
├── css/
│   └── admin.css        # Admin panel stilleri
├── js/
│   ├── auth.js          # Kimlik doğrulama
│   ├── admin.js         # Dashboard yönetimi
│   └── videos.js        # Video işlemleri
└── README.md           # Dokümantasyon
```

## 🛠️ Kurulum

1. Repository'yi klonlayın veya fork'layın
2. `admin-panel` branch'ini kullanın:
```bash
git checkout admin-panel
```

3. Admin paneline erişin:
```
https://anbarci.github.io/DrivePlyr/admin/login.html
```

## 📖 Kullanım

### Giriş Yapma
1. `admin/login.html` sayfasını açın
2. Demo kullanıcı bilgileri:
   - Kullanıcı Adı: `admin`
   - Şifre: `admin123`

### Video Ekleme
1. Sol menüden "Video Ekle" seçeneğine tıklayın
2. Google Drive video URL'sini yapıştırın
3. Video başlığı ve açıklamasını girin
4. Kategori seçin
5. "Videoyu Kaydet" butonuna tıklayın
### Embed Kodu Oluşturma
1. "Embed Generator" bölümüne gidin
2. Video seçin
3. Player tipi seçin
4. Boyutları ayarlayın
5. "Embed Kod Oluştur" butonuna tıklayın
6. Kodu kopyalayıp sitenize yapıştırın
## 🎨 Tasarım Özellikleri

- **Modern UI**: Tailwind CSS ile responsive tasarım
- **Glass Morphism**: Modern cam efekti tasarımı
- **Gradient Backgrounds**: Görsel olarak çekici gradyanarka planlar
- **Smooth Animations**: Akıcı geçişler ve animasyonlar
- **Font Awesome Icons**: 1000+ simge desteği
- **Mobile Responsive**: Tüm cihazlarda mükemmel görünüm

## 🔒 Güvenlik

- LocalStorage tabanlı oturum yönetimi
- Şifre doğrulama
- Otomatik oturum süresi kontrolu
- XSS korumalı input yönetimi

## 📱 Responsive Tasarım

- Desktop: Tam özellikli dashboard
- Tablet: Optimize edilmiş layout
- Mobile: Hamburger menü ve mobil uyumlu kartlar

## 🚀 Geliştirme Planları

- [ ] Backend entegrasyonu (Node.js/PHP)
- [ ] Gerçek veritabanı desteği (MySQL/MongoDB)
- [ ] Çoklu kullanıcı sistemi
- [ ] Rol tabanlı yetkilendirme
- [ ] Video subtitle yönetimi
- [ ] Playlist oluşturma
- [ ] Gelişmiş analytics
- [ ] CDN entegrasyonu
- [ ] Video kalite seçimi
- [ ] Hotlink koruması

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın
## 📝 Lisans

MIT License - Detaylar için LICENSE dosyasına bakın
## 👨‍💻 Geliştirici

[@anbarci](https://github.com/anbarci)

## 🙏 Teşekkürler

- Orijinal DrivePlyr projesi: [@SH20RAJ](https://github.com/SH20RAJ)
- GDPlayer.Top: İlham kaynağı
- Tailwind CSS: UI framework
- Font Awesome: İkon kütüphanesi

---

**Not**: Bu admin panel demo amaçlıdır ve LocalStorage kullanır. Üretim ortamı için backend entegrasyonu ve gerçek veritabanı önerilir.