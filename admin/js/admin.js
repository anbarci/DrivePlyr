// Admin Dashboard Manager
class AdminDashboard {
    constructor() {
        this.init();
    }

    init() {
        // Require authentication
        authManager.requireAuth();
        
        // Load user info
        this.loadUserInfo();
        
        // Setup navigation
        this.setupNavigation();
        
        // Load dashboard data
        this.loadDashboardData();
        
        // Handle hash navigation
        this.handleHashNavigation();
        window.addEventListener('hashchange', () => this.handleHashNavigation());
    }

    loadUserInfo() {
        const session = authManager.getSession();
        if (session) {
            document.getElementById('username').textContent = session.username;
            const loginTime = new Date(session.loginTime);
            document.getElementById('loginTime').textContent = loginTime.toLocaleString('tr-TR');
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show selected section
        const section = document.getElementById(`section-${sectionName}`);
        if (section) {
            section.classList.remove('hidden');
        }
    }

    handleHashNavigation() {
        const hash = window.location.hash.substring(1) || 'dashboard';
        this.showSection(hash);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === hash) {
                link.classList.add('active');
            }
        });
    }

    loadDashboardData() {
        const videos = videoManager.getVideos();
        const stats = this.calculateStats(videos);
        
        // Update stats cards
        document.getElementById('totalVideos').textContent = stats.totalVideos;
        document.getElementById('totalViews').textContent = stats.totalViews.toLocaleString('tr-TR');
        document.getElementById('activeUsers').textContent = stats.activeUsers;
        document.getElementById('monthlyViews').textContent = stats.monthlyViews.toLocaleString('tr-TR');
        
        // Load recent videos
        this.loadRecentVideos(videos);
    }

    calculateStats(videos) {
        return {
            totalVideos: videos.length,
            totalViews: videos.reduce((sum, v) => sum + (v.views || 0), 0),
            activeUsers: Math.floor(Math.random() * 50) + 10, // Simulated
            monthlyViews: videos.reduce((sum, v) => sum + (v.views || 0), 0) * 0.3 // Simulated
        };
    }

    loadRecentVideos(videos) {
        const recentVideos = videos.slice(0, 5);
        const container = document.getElementById('recentVideos');
        
        if (recentVideos.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Henüz video eklenmemiş.</p>';
            return;
        }
        
        container.innerHTML = recentVideos.map(video => `
            <div class="video-card flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <img src="${video.poster || 'https://via.placeholder.com/120x68'}" 
                         alt="${video.title}" 
                         class="w-32 h-18 object-cover rounded-lg">
                    <div>
                        <h3 class="font-semibold text-gray-800">${video.title}</h3>
                        <p class="text-sm text-gray-500">${video.category || 'Genel'}</p>
                        <p class="text-xs text-gray-400 mt-1">${new Date(video.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-600">
                        <i class="fas fa-eye"></i> ${video.views || 0}
                    </span>
                </div>
            </div>
        `).join('');
    }

    showAlert(message, type = 'success') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
            ${message}
        `;
        
        document.body.appendChild(alert);
        alert.style.position = 'fixed';
        alert.style.top = '20px';
        alert.style.right = '20px';
        alert.style.zIndex = '9999';
        
        setTimeout(() => alert.remove(), 5000);
    }
}

// Initialize dashboard
const dashboard = new AdminDashboard();