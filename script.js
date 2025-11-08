// DrivePlyr - Enhanced Frontend Script with Backend Integration
// Configuration
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    DRIVE_API_KEY: 'AIzaSyD739-eb6NzS_KbVJq1K8ZAxnrMfkIqPyw', // Will be moved to backend
    PLAYER_BASE_URL: window.location.origin + '/DrivePlyr'
};

// Utility Functions
const $ = (id) => document.getElementById(id);

function getParam(param, url) {
    url = url || window.location.href;
    return new URL(url).searchParams.get(param);
}

function getIdFromUrl(url) {
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : null;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// API Integration
class APIManager {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
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
            console.error('API Error:', error);
            throw error;
        }
    }

    async saveVideo(videoData) {
        return await this.request('/videos', {
            method: 'POST',
            body: JSON.stringify(videoData)
        });
    }

    async getVideo(videoId) {
        return await this.request(`/videos/${videoId}`);
    }

    async trackView(videoId) {
        return await this.request('/analytics/track', {
            method: 'POST',
            body: JSON.stringify({ 
                videoId, 
                event: 'view',
                timestamp: new Date().toISOString()
            })
        });
    }

    async getSubtitles(videoId) {
        return await this.request(`/subtitles/${videoId}`);
    }
}

const api = new APIManager();

// Video Manager
class VideoManager {
    constructor() {
        this.currentVideo = null;
        this.base = null;
    }

    getVideoData() {
        const videoUrl = $('videourl')?.value;
        if (!videoUrl) {
            showNotification('Lütfen bir video URL\'si girin', 'error');
            return null;
        }

        const driveId = getIdFromUrl(videoUrl);
        if (!driveId) {
            showNotification('Geçersiz Google Drive URL\'si', 'error');
            return null;
        }

        const posterUrl = $('posterurl')?.value || 
                         `https://lh3.googleusercontent.com/d/${driveId}`;
        const title = $('videotitle')?.value || 'Untitled Video';

        return {
            id: driveId,
            videoUrl: `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=${CONFIG.DRIVE_API_KEY}`,
            posterUrl,
            title,
            driveId
        };
    }

    encodeVideoData(data) {
        const jsonStr = JSON.stringify(data);
        return btoa(jsonStr);
    }

    decodeVideoData(encoded) {
        try {
            const jsonStr = atob(encoded);
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Failed to decode video data:', error);
            return null;
        }
    }

    async saveToBackend(videoData) {
        try {
            const response = await api.saveVideo({
                driveId: videoData.driveId,
                title: videoData.title,
                posterUrl: videoData.posterUrl,
                category: $('category')?.value || 'other'
            });
            showNotification('Video başarıyla kaydedildi!', 'success');
            return response;
        } catch (error) {
            console.error('Failed to save video:', error);
            showNotification('Video kaydedilemedi', 'error');
            return null;
        }
    }

    updateIframes() {
        if (!this.base) return;

        const players = [
            'sopplayer', 'plyr', 'vlitejs', 
            'fluid', 'afterglow', 'mediaelements'
        ];

        players.forEach(player => {
            const iframe = $(player);
            if (iframe) {
                iframe.src = `${player}.html?id=${this.base}`;
            }
        });
    }
}

const videoManager = new VideoManager();

// Player Functions
function get() {
    const videoData = videoManager.getVideoData();
    if (!videoData) return;

    videoManager.currentVideo = videoData;
    videoManager.base = videoManager.encodeVideoData(videoData);
    window.base = videoManager.base;

    videoManager.updateIframes();
    
    // Optional: Save to backend
    // videoManager.saveToBackend(videoData);
    
    showNotification('Video yüklendi!', 'success');
}

// Player Openers
const playerOpeners = {
    opensp: () => window.open(`sopplayer.html?id=${window.base}`),
    openplyr: () => window.open(`plyr.html?id=${window.base}`),
    openfluid: () => window.open(`fluid.html?id=${window.base}`),
    openafterglow: () => window.open(`afterglow.html?id=${window.base}`),
    openmediaelements: () => window.open(`mediaelements.html?id=${window.base}`),
    openvlitejs: () => window.open(`vlitejs.html?id=${window.base}`)
};

// Export to global scope
Object.assign(window, playerOpeners);

// Embed Code Generators
function generateEmbedCode(player) {
    if (!window.base) {
        showNotification('Önce bir video yükleyin', 'error');
        return;
    }

    const embedCode = `<iframe width="560" height="315" 
scrolling="no"
src="${CONFIG.PLAYER_BASE_URL}/${player}.html?id=${window.base}" 
frameborder="0" 
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
allowfullscreen>
</iframe>`;

    // Modern clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(embedCode)
            .then(() => showNotification('Embed kodu kopyalandı!', 'success'))
            .catch(() => prompt('Embed Kodu:', embedCode));
    } else {
        prompt('Embed Kodu:', embedCode);
    }
}

const embedFunctions = {
    embedsp: () => generateEmbedCode('sopplayer'),
    embedplyr: () => generateEmbedCode('plyr'),
    embedfluid: () => generateEmbedCode('fluid'),
    embedafterglow: () => generateEmbedCode('afterglow'),
    embedmediaelements: () => generateEmbedCode('mediaelements'),
    embedvlitejs: () => generateEmbedCode('vlitejs')
};

Object.assign(window, embedFunctions);

// Subtitle Manager
class SubtitleManager {
    constructor() {
        this.subtitles = [];
    }

    async loadSubtitles(videoId) {
        try {
            const response = await api.getSubtitles(videoId);
            this.subtitles = response.data || [];
            return this.subtitles;
        } catch (error) {
            console.error('Failed to load subtitles:', error);
            return [];
        }
    }

    parseVTT(vttContent) {
        // Basic VTT parser
        const lines = vttContent.split('\n');
        const subtitles = [];
        let current = {};

        lines.forEach(line => {
            if (line.includes('-->')) {
                const [start, end] = line.split('-->');
                current.start = this.parseTime(start.trim());
                current.end = this.parseTime(end.trim());
            } else if (line.trim() && !line.includes('WEBVTT')) {
                current.text = line;
                if (current.start !== undefined) {
                    subtitles.push({...current});
                    current = {};
                }
            }
        });

        return subtitles;
    }

    parseTime(timeStr) {
        const parts = timeStr.split(':');
        const seconds = parts[parts.length - 1].split(',')[0];
        return parseFloat(parts[0]) * 3600 + 
               parseFloat(parts[1]) * 60 + 
               parseFloat(seconds);
    }
}

const subtitleManager = new SubtitleManager();

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DrivePlyr Enhanced - Ready!');
    
    // Check for video ID in URL
    const videoId = getParam('id');
    if (videoId) {
        const videoData = videoManager.decodeVideoData(videoId);
        if (videoData) {
            videoManager.currentVideo = videoData;
            window.base = videoId;
            console.log('Video loaded from URL:', videoData);
        }
    }
});

// Export for use in other scripts
window.DrivePlyr = {
    api,
    videoManager,
    subtitleManager,
    CONFIG,
    showNotification
};