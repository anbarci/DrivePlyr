// Video Management System
class VideoManager {
    constructor() {
        this.storageKey = 'driveplyr_videos';
        this.init();
    }

    init() {
        // Setup upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }
        
        // Load videos in videos section
        this.loadVideosList();
        
        // Load embed selector
        this.loadEmbedSelector();
    }

    getVideos() {
        const videos = localStorage.getItem(this.storageKey);
        return videos ? JSON.parse(videos) : [];
    }

    saveVideos(videos) {
        localStorage.setItem(this.storageKey, JSON.stringify(videos));
    }

    extractDriveId(url) {
        const match = url.match(/[-\w]{25,}/);
        return match ? match[0] : null;
    }

    handleUpload(e) {
        e.preventDefault();
        
        const videoUrl = document.getElementById('videoUrl').value;
        const title = document.getElementById('videoTitle').value;
        const description = document.getElementById('videoDescription').value;
        const poster = document.getElementById('posterUrl').value;
        const category = document.getElementById('videoCategory').value;
        
        const driveId = this.extractDriveId(videoUrl);
        if (!driveId) {
            dashboard.showAlert('Geçersiz Google Drive URL!', 'error');
            return;
        }
        
        const video = {
            id: Date.now().toString(),
            driveId: driveId,
            title: title,
            description: description,
            poster: poster || `https://lh3.googleusercontent.com/d/${driveId}`,
            category: category,
            views: 0,
            createdAt: new Date().toISOString()
        };
        
        const videos = this.getVideos();
        videos.unshift(video);
        this.saveVideos(videos);
        
        dashboard.showAlert('Video başarıyla eklendi!', 'success');
        e.target.reset();
        
        // Refresh dashboard
        dashboard.loadDashboardData();
        this.loadVideosList();
        this.loadEmbedSelector();
    }

    loadVideosList() {
        const container = document.getElementById('videosList');
        if (!container) return;
        
        const videos = this.getVideos();
        
        if (videos.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz video eklenmemiş. Yeni video eklemek için "Video Ekle" bölümüne gidin.</p>';
            return;
        }
        
        container.innerHTML = videos.map(video => `
            <div class="video-card">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4 flex-1">
                        <img src="${video.poster}" 
                             alt="${video.title}" 
                             class="w-40 h-24 object-cover rounded-lg">
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg text-gray-800">${video.title}</h3>
                            <p class="text-sm text-gray-600 mt-1">${video.description || 'Açıklama yok'}</p>
                            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span><i class="fas fa-tag"></i> ${video.category}</span>
                                <span><i class="fas fa-eye"></i> ${video.views} görüntülenme</span>
                                <span><i class="fas fa-calendar"></i> ${new Date(video.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="videoManager.editVideo('${video.id}')" 
                                class="btn btn-primary">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="videoManager.deleteVideo('${video.id}')" 
                                class="btn btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="videoManager.previewVideo('${video.driveId}')" 
                                class="btn btn-success">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    deleteVideo(id) {
        if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) return;
        
        const videos = this.getVideos();
        const filtered = videos.filter(v => v.id !== id);
        this.saveVideos(filtered);
        
        dashboard.showAlert('Video silindi!', 'success');
        this.loadVideosList();
        dashboard.loadDashboardData();
    }

    editVideo(id) {
        const videos = this.getVideos();
        const video = videos.find(v => v.id === id);
        if (!video) return;
        
        // Navigate to upload section and fill form
        window.location.hash = 'upload';
        
        setTimeout(() => {
            document.getElementById('videoUrl').value = `https://drive.google.com/file/d/${video.driveId}/view`;
            document.getElementById('videoTitle').value = video.title;
            document.getElementById('videoDescription').value = video.description || '';
            document.getElementById('posterUrl').value = video.poster;
            document.getElementById('videoCategory').value = video.category;
        }, 100);
    }

    previewVideo(driveId) {
        const ply = { id: driveId };
        const base = btoa(JSON.stringify(ply));
        window.open(`../plyr.html?id=${base}`, '_blank');
    }

    loadEmbedSelector() {
        const selector = document.getElementById('embedVideoSelect');
        if (!selector) return;
        
        const videos = this.getVideos();
        selector.innerHTML = '<option value="">Video seçin...</option>' + 
            videos.map(v => `<option value="${v.driveId}">${v.title}</option>`).join('');
    }

    generateEmbed() {
        const videoId = document.getElementById('embedVideoSelect').value;
        const playerType = document.getElementById('playerType').value;
        const width = document.getElementById('embedWidth').value;
        const height = document.getElementById('embedHeight').value;
        
        if (!videoId) {
            dashboard.showAlert('Lütfen bir video seçin!', 'error');
            return;
        }
        
        const ply = { id: videoId };
        const base = btoa(JSON.stringify(ply));
        
        const embedCode = `<iframe width="${width}" height="${height}" 
src="https://anbarci.github.io/DrivePlyr/${playerType}.html?id=${base}" 
frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
allowfullscreen></iframe>`;
        
        document.getElementById('embedCode').value = embedCode;
        document.getElementById('embedOutput').classList.remove('hidden');
    }

    copyEmbed() {
        const embedCode = document.getElementById('embedCode');
        embedCode.select();
        document.execCommand('copy');
        dashboard.showAlert('Embed kodu kopyalandı!', 'success');
    }

    saveSettings() {
        const apiKey = document.getElementById('apiKey').value;
        const siteTitle = document.getElementById('siteTitle').value;
        const enableAnalytics = document.getElementById('enableAnalytics').checked;
        
        const settings = {
            apiKey: apiKey,
            siteTitle: siteTitle,
            enableAnalytics: enableAnalytics
        };
        
        localStorage.setItem('driveplyr_settings', JSON.stringify(settings));
        dashboard.showAlert('Ayarlar kaydedildi!', 'success');
    }
}

// Initialize video manager
const videoManager = new VideoManager();