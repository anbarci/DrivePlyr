// Enhanced Video Management System with Backend Integration
class VideoManager {
    constructor() {
        this.storageKey = 'driveplyr_videos';
        this.API_BASE = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.init();
    }

    async init() {
        // Setup upload form
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleUpload(e));
        }
        
        // Load videos from backend if available, fallback to localStorage
        await this.loadVideosList();
        
        // Load embed selector
        this.loadEmbedSelector();
        
        // Setup subtitle upload
        this.setupSubtitleUpload();
    }

    // API Request Handler
    async apiRequest(endpoint, options = {}) {
        const url = `${this.API_BASE}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(url, { ...options, headers });
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.warn('API not available, using localStorage:', error);
            // Fallback to localStorage
            return null;
        }
    }

    // Get videos from backend or localStorage
    async getVideos() {
        try {
            const response = await this.apiRequest('/videos');
            if (response && response.data) {
                return response.data;
            }
        } catch (error) {
            console.log('Using localStorage fallback');
        }
        
        // Fallback to localStorage
        const videos = localStorage.getItem(this.storageKey);
        return videos ? JSON.parse(videos) : [];
    }

    // Save videos to localStorage
    saveVideosLocal(videos) {
        localStorage.setItem(this.storageKey, JSON.stringify(videos));
    }

    // Extract Drive ID from URL
    extractDriveId(url) {
        const match = url.match(/[-\w]{25,}/);
        return match ? match[0] : null;
    }

    // Handle video upload
    async handleUpload(e) {
        e.preventDefault();
        
        const videoUrl = document.getElementById('videoUrl').value;
        const title = document.getElementById('videoTitle').value;
        const description = document.getElementById('videoDescription').value;
        const poster = document.getElementById('posterUrl').value;
        const category = document.getElementById('videoCategory').value;
        
        const driveId = this.extractDriveId(videoUrl);
        if (!driveId) {
            this.showAlert('Geçersiz Google Drive URL!', 'error');
            return;
        }
        
        const videoData = {
            driveId: driveId,
            title: title,
            description: description,
            posterUrl: poster || `https://lh3.googleusercontent.com/d/${driveId}`,
            category: category,
            tags: [],
            status: 'published'
        };
        
        try {
            // Try to save to backend
            const response = await this.apiRequest('/videos', {
                method: 'POST',
                body: JSON.stringify(videoData)
            });
            
            if (response) {
                this.showAlert('Video başarıyla eklendi!', 'success');
            } else {
                // Fallback to localStorage
                const video = {
                    id: Date.now().toString(),
                    ...videoData,
                    views: 0,
                    createdAt: new Date().toISOString()
                };
                
                const videos = await this.getVideos();
                videos.unshift(video);
                this.saveVideosLocal(videos);
                this.showAlert('Video yerel olarak kaydedildi!', 'success');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.showAlert('Video kaydedilemedi!', 'error');
            return;
        }
        
        e.target.reset();
        
        // Refresh dashboard
        if (window.dashboard) {
            dashboard.loadDashboardData();
        }
        await this.loadVideosList();
        this.loadEmbedSelector();
    }

    // Load videos list
    async loadVideosList() {
        const container = document.getElementById('videosList');
        if (!container) return;
        
        container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-3xl text-purple-600"></i></div>';
        
        const videos = await this.getVideos();
        
        if (videos.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz video eklenmemiş. Yeni video eklemek için "Video Ekle" bölümüne gidin.</p>';
            return;
        }
        
        container.innerHTML = videos.map(video => `
            <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-4 flex-1">
                        <img src="${video.posterUrl || video.poster}" 
                             alt="${video.title}" 
                             onerror="this.src='../drive-logo.png'"
                             class="w-40 h-24 object-cover rounded-lg">
                        <div class="flex-1">
                            <h3 class="font-semibold text-lg text-gray-800">${video.title}</h3>
                            <p class="text-sm text-gray-600 mt-1">${video.description || 'Açıklama yok'}</p>
                            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span><i class="fas fa-tag mr-1"></i> ${video.category}</span>
                                <span><i class="fas fa-eye mr-1"></i> ${video.views || 0} görüntülenme</span>
                                <span><i class="fas fa-calendar mr-1"></i> ${new Date(video.createdAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="videoManager.manageSubtitles('${video.driveId || video.id}', '${video.title}')" 
                                class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition" title="Altyaнılar">
                            <i class="fas fa-closed-captioning"></i>
                        </button>
                        <button onclick="videoManager.editVideo('${video._id || video.id}')" 
                                class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded transition" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="videoManager.deleteVideo('${video._id || video.id}')" 
                                class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="videoManager.previewVideo('${video.driveId || video.id}')" 
                                class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition" title="Önizle">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Delete video
    async deleteVideo(id) {
        if (!confirm('Bu videoyu silmek istediğinizden emin misiniz?')) return;
        
        try {
            const response = await this.apiRequest(`/videos/${id}`, {
                method: 'DELETE'
            });
            
            if (!response) {
                // Fallback to localStorage
                const videos = await this.getVideos();
                const filtered = videos.filter(v => (v._id || v.id) !== id);
                this.saveVideosLocal(filtered);
            }
            
            this.showAlert('Video silindi!', 'success');
            await this.loadVideosList();
            if (window.dashboard) {
                dashboard.loadDashboardData();
            }
        } catch (error) {
            this.showAlert('Video silinemedi!', 'error');
        }
    }

    // Edit video
    async editVideo(id) {
        const videos = await this.getVideos();
        const video = videos.find(v => (v._id || v.id) === id);
        if (!video) return;
        
        // Navigate to upload section and fill form
        window.location.hash = 'upload';
        
        setTimeout(() => {
            document.getElementById('videoUrl').value = `https://drive.google.com/file/d/${video.driveId || video.id}/view`;
            document.getElementById('videoTitle').value = video.title;
            document.getElementById('videoDescription').value = video.description || '';
            document.getElementById('posterUrl').value = video.posterUrl || video.poster || '';
            document.getElementById('videoCategory').value = video.category;
        }, 100);
    }

    // Preview video
    previewVideo(driveId) {
        const ply = { id: driveId };
        const base = btoa(JSON.stringify(ply));
        window.open(`../plyr.html?id=${base}`, '_blank');
    }

    // Load embed selector
    async loadEmbedSelector() {
        const selector = document.getElementById('embedVideoSelect');
        if (!selector) return;
        
        const videos = await this.getVideos();
        selector.innerHTML = '<option value="">Video seçin...</option>' + 
            videos.map(v => `<option value="${v.driveId || v.id}">${v.title}</option>`).join('');
    }

    // Generate embed code
    generateEmbed() {
        const videoId = document.getElementById('embedVideoSelect').value;
        const playerType = document.getElementById('playerType').value;
        const width = document.getElementById('embedWidth').value;
        const height = document.getElementById('embedHeight').value;
        
        if (!videoId) {
            this.showAlert('Lütfen bir video seçin!', 'error');
            return;
        }
        
        const ply = { id: videoId };
        const base = btoa(JSON.stringify(ply));
        
        const embedCode = `<iframe width="${width}" height="${height}" 
src="https://anbarci.github.io/DrivePlyr/${playerType}.html?id=${base}" 
frameborder="0" 
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
allowfullscreen>
</iframe>`;
        
        document.getElementById('embedCode').value = embedCode;
        document.getElementById('embedOutput').classList.remove('hidden');
    }

    // Copy embed code
    copyEmbed() {
        const embedCode = document.getElementById('embedCode');
        embedCode.select();
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(embedCode.value)
                .then(() => this.showAlert('Embed kodu kopyalandı!', 'success'))
                .catch(() => document.execCommand('copy'));
        } else {
            document.execCommand('copy');
            this.showAlert('Embed kodu kopyalandı!', 'success');
        }
    }

    // Save settings
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
        this.showAlert('Ayarlar kaydedildi!', 'success');
    }

    // Subtitle Management
    setupSubtitleUpload() {
        // Create subtitle modal if not exists
        if (!document.getElementById('subtitleModal')) {
            const modal = document.createElement('div');
            modal.id = 'subtitleModal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <h3 class="text-2xl font-bold mb-4">Altyaнı Yönetimi</h3>
                    <div id="subtitleContent"></div>
                    <button onclick="videoManager.closeSubtitleModal()" class="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                        Kapat
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }
    }

    manageSubtitles(videoId, videoTitle) {
        const modal = document.getElementById('subtitleModal');
        const content = document.getElementById('subtitleContent');
        
        content.innerHTML = `
            <p class="text-gray-700 mb-4">Video: <strong>${videoTitle}</strong></p>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Altyaнı Dosyası (.vtt veya .srt)</label>
                <input type="file" id="subtitleFile" accept=".vtt,.srt" class="w-full px-4 py-2 border rounded">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Dil</label>
                <select id="subtitleLanguage" class="w-full px-4 py-2 border rounded">
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                </select>
            </div>
            <button onclick="videoManager.uploadSubtitle('${videoId}')" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
                <i class="fas fa-upload mr-2"></i>Yükle
            </button>
            <div id="subtitleList" class="mt-4"></div>
        `;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Load existing subtitles
        this.loadSubtitles(videoId);
    }

    async loadSubtitles(videoId) {
        const list = document.getElementById('subtitleList');
        if (!list) return;
        
        try {
            const response = await this.apiRequest(`/subtitles/${videoId}`);
            if (response && response.data) {
                list.innerHTML = '<h4 class="font-semibold mb-2">Mevcut Altyaнılar:</h4>' +
                    response.data.map(sub => `
                        <div class="flex justify-between items-center p-2 bg-gray-100 rounded mb-2">
                            <span><i class="fas fa-language mr-2"></i>${sub.language}</span>
                            <button onclick="videoManager.deleteSubtitle('${sub._id}', '${videoId}')" class="text-red-600 hover:text-red-800">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `).join('');
            }
        } catch (error) {
            console.log('Could not load subtitles');
        }
    }

    async uploadSubtitle(videoId) {
        const fileInput = document.getElementById('subtitleFile');
        const language = document.getElementById('subtitleLanguage').value;
        
        if (!fileInput.files[0]) {
            this.showAlert('Lütfen bir dosya seçin!', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const content = e.target.result;
            
            try {
                const response = await this.apiRequest('/subtitles', {
                    method: 'POST',
                    body: JSON.stringify({
                        videoId: videoId,
                        language: language,
                        content: content,
                        format: file.name.endsWith('.vtt') ? 'vtt' : 'srt'
                    })
                });
                
                if (response) {
                    this.showAlert('Altyaнı başarıyla yüklendi!', 'success');
                    this.loadSubtitles(videoId);
                    fileInput.value = '';
                }
            } catch (error) {
                this.showAlert('Altyaнı yüklenemedi!', 'error');
            }
        };
        
        reader.readAsText(file);
    }

    async deleteSubtitle(subtitleId, videoId) {
        if (!confirm('Bu altyaнıyı silmek istediğinizden emin misiniz?')) return;
        
        try {
            await this.apiRequest(`/subtitles/${subtitleId}`, {
                method: 'DELETE'
            });
            this.showAlert('Altyaнı silindi!', 'success');
            this.loadSubtitles(videoId);
        } catch (error) {
            this.showAlert('Altyaнı silinemedi!', 'error');
        }
    }

    closeSubtitleModal() {
        const modal = document.getElementById('subtitleModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // Show alert notification
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white`;
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => alertDiv.remove(), 3000);
    }
}

// Initialize video manager
const videoManager = new VideoManager();