// Authentication System
class AuthManager {
    constructor() {
        this.users = [
            { username: 'admin', password: 'admin123', role: 'admin' },
            { username: 'demo', password: 'demo123', role: 'user' }
        ];
        this.init();
    }

    init() {
        // Check if already logged in
        if (this.isLoggedIn() && window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }

        // Setup login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = this.users.find(u => u.username === username && u.password === password);

        if (user) {
            const session = {
                username: user.username,
                role: user.role,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('driveplyr_session', JSON.stringify(session));
            window.location.href = 'index.html';
        } else {
            this.showError('Kullanıcı adı veya şifre hatalı!');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
            setTimeout(() => errorDiv.classList.add('hidden'), 5000);
        }
    }

    isLoggedIn() {
        const session = localStorage.getItem('driveplyr_session');
        return session !== null;
    }

    getSession() {
        const session = localStorage.getItem('driveplyr_session');
        return session ? JSON.parse(session) : null;
    }

    logout() {
        localStorage.removeItem('driveplyr_session');
        window.location.href = 'login.html';
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }
}

// Initialize
const authManager = new AuthManager();