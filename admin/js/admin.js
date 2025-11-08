// Enhanced Admin Dashboard Manager
class Dashboard {
    constructor() {
        this.API_BASE = 'http://localhost:5000/api';
        this.token = localStorage.getItem('token');
        this.init();
    }

    async init() {
        // Check authentication
        if (!this.token) {
            window.location.href = 'login.html';
            return;
        }

        // Load user info
        this.loadUserInfo();
        
        // Setup navigation
        this.setupNavigation();
        
        // Load dashboard data
        await this.loadDashboardData();
        
        // Show current time
        this.updateTime();
        setInterval(() => this.updateTime(), 60000);
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
            
            if (response.status === 401) {
                // Token expired
                localStorage.removeItem('token');
                window.location.href = 'login.html';
                return null;
            }
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.warn('API not available:', error);
            return null;
        }
    }

    // Load user info
    loadUserInfo() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.textContent = userInfo.username || 'Admin';
        }
    }

    // Update time display
    updateTime() {
        const now = new Date();
        const timeEl = document.getElementById('loginTime');
        if (timeEl) {
            timeEl.textContent = now.toLocaleString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    // Setup navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetSection = link.getAttribute('data-section');
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show target section
                sections.forEach(section => {
                    if (section.id === `section-${targetSection}`) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
                
                // Update URL hash
                window.location.hash = targetSection;
            });
        });
        
        // Handle initial hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetLink = document.querySelector(`[data-section="${hash}"]`);
            if (targetLink) {
                targetLink.click();
            }
        }
    }

    // Load dashboard data
    async loadDashboardData() {
        await Promise.all([
            this.loadStats(),
            this.loadRecentVideos(),
            this.loadTopVideos(),
            this.loadCategoryStats()
        ]);
    }

    // Load statistics
    async loadStats() {
        try {
            // Try to get stats from API
            const response = await this.apiRequest('/analytics/stats');
            
            if (response && response.data) {
                this.updateStatsDisplay(response.data);
                return;
            }
        } catch (error) {
            console.log('Using localStorage for stats');
        }
        
        // Fallback to localStorage
        const videos = JSON.parse(localStorage.getItem('driveplyr_videos') || '[]');
        const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthlyViews = videos
            .filter(v => new Date(v.createdAt) >= thisMonth)
            .reduce((sum, v) => sum + (v.views || 0), 0);
        
        this.updateStatsDisplay({
            totalVideos: videos.length,
            totalViews: totalViews,
            activeUsers: 1,
            monthlyViews: monthlyViews
        });
    }

    // Update stats display
    updateStatsDisplay(stats) {
        this.animateNumber('totalVideos', stats.totalVideos || 0);
        this.animateNumber('totalViews', stats.totalViews || 0);
        this.animateNumber('activeUsers', stats.activeUsers || 0);
        this.animateNumber('monthlyViews', stats.monthlyViews || 0);
    }

    // Animate number counter
    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const start = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = Date.now();
        
        const updateNumber = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const current = Math.floor(start + (target - start) * progress);
            element.textContent = current.toLocaleString('tr-TR');
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }

    // Load recent videos
    async loadRecentVideos() {
        const container = document.getElementById('recentVideos');
        if (!container) return;
        
        try {
            const response = await this.apiRequest('/videos?limit=5&sort=createdAt');
            const videos = response?.data || JSON.parse(localStorage.getItem('driveplyr_videos') || '[]').slice(0, 5);
            
            if (videos.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-4">Henüz video yok</p>';
                return;
            }
            
            container.innerHTML = videos.map(video => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div class="flex items-center space-x-3">
                        <img src="${video.posterUrl || video.poster}" alt="${video.title}" 
                             onerror="this.src='../drive-logo.png'"
                             class="w-16 h-10 object-cover rounded">
                        <div>
                            <h5 class="font-semibold text-gray-800">${video.title}</h5>
                            <p class="text-xs text-gray-500">${new Date(video.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                    </div>
                    <span class="text-sm text-gray-600">
                        <i class="fas fa-eye mr-1"></i>${video.views || 0}
                    </span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load recent videos:', error);
        }
    }

    // Load top videos
    async loadTopVideos() {
        const container = document.getElementById('topVideos');
        if (!container) return;
        
        try {
            const videos = JSON.parse(localStorage.getItem('driveplyr_videos') || '[]')
                .sort((a, b) => (b.views || 0) - (a.views || 0))
                .slice(0, 5);
            
            if (videos.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center">Henüz veri yok</p>';
                return;
            }
            
            container.innerHTML = videos.map((video, index) => `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="font-bold text-purple-600">${index + 1}.</span>
                        <span class="text-sm">${video.title}</span>
                    </div>
                    <span class="text-sm font-semibold">${video.views || 0}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load top videos:', error);
        }
    }

    // Load category statistics
    async loadCategoryStats() {
        const container = document.getElementById('categoryStats');
        if (!container) return;
        
        try {
            const videos = JSON.parse(localStorage.getItem('driveplyr_videos') || '[]');
            const categories = {};
            
            videos.forEach(video => {
                const category = video.category || 'other';
                categories[category] = (categories[category] || 0) + 1;
            });
            
            const categoryNames = {
                movie: 'Film',
                series: 'Dizi',
                documentary: 'Belgesel',
                other: 'Diğer'
            };
            
            if (Object.keys(categories).length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center">Henüz veri yok</p>';
                return;
            }
            
            container.innerHTML = Object.entries(categories).map(([cat, count]) => {
                const total = videos.length;
                const percentage = Math.round((count / total) * 100);
                
                return `
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-medium">${categoryNames[cat] || cat}</span>
                            <span class="text-sm text-gray-600">${count} (${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-purple-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Failed to load category stats:', error);
        }
    }

    // Show alert notification
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        } text-white font-semibold`;
        
        alertDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-${
                    type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle'
                }"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translateX(100px)';
            alertDiv.style.transition = 'all 0.3s';
            setTimeout(() => alertDiv.remove(), 300);
        }, 3000);
    }
}

// Authentication Manager
class AuthManager {
    logout() {
        if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = 'login.html';
        }
    }
}

// Initialize dashboard
const dashboard = new Dashboard();
const authManager = new AuthManager();

// Export for use in other scripts
window.dashboard = dashboard;
window.authManager = authManager;