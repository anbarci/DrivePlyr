const API_URL = 'http://localhost:5000/api';

const authManager = {
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || '{}'),

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Giriş hatası:', error);
      return false;
    }
  },

  async register(username, email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();

      if (data.success) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      return false;
    }
  },

  logout() {
    this.token = null;
    this.user = {};
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login.html';
  },

  isAuthenticated() {
    return !!this.token;
  },

  getAuthHeader() {
    return { 'Authorization': `Bearer ${this.token}` };
  }
};

// Sayfa yüklenmesinde giriş kontrolü
window.addEventListener('load', () => {
  if (window.location.pathname.includes('/admin/index.html') && !authManager.isAuthenticated()) {
    window.location.href = '/admin/login.html';
  }
  if (authManager.user.username) {
    document.getElementById('username').textContent = authManager.user.username;
  }
});