document.addEventListener('DOMContentLoaded', () => {
  // Sidebar navigation
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Hide all sections
      document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
      
      // Show selected section
      const section = link.dataset.section;
      document.getElementById(`section-${section}`).classList.remove('hidden');
    });
  });

  // Load dashboard data
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const response = await fetch('http://localhost:5000/api/videos', {
      headers: authManager.getAuthHeader()
    });
    const data = await response.json();
    
    if (data.success) {
      document.getElementById('totalVideos').textContent = data.videos.length;
      // Update other stats
    }
  } catch (error) {
    console.error('Dashboard yükleme hatası:', error);
  }
}

const videoManager = {
  async generateEmbed() {
    const videoSelect = document.getElementById('embedVideoSelect');
    const playerType = document.getElementById('playerType').value;
    const width = document.getElementById('embedWidth').value || 560;
    const height = document.getElementById('embedHeight').value || 315;

    if (!videoSelect.value) {
      alert('Lütfen video seçin');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/videos/${videoSelect.value}`, {
        headers: authManager.getAuthHeader()
      });
      const data = await response.json();
      
      if (data.success) {
        const embedCode = data.video.getEmbedCode(playerType, width, height);
        document.getElementById('embedCode').value = embedCode;
        document.getElementById('embedOutput').classList.remove('hidden');
      }
    } catch (error) {
      console.error('Embed kodu oluşturma hatası:', error);
    }
  },

  copyEmbed() {
    const embedCode = document.getElementById('embedCode');
    embedCode.select();
    document.execCommand('copy');
    alert('Embed kodu kopyalandı!');
  },

  async saveSettings() {
    const apiKey = document.getElementById('apiKey').value;
    const siteTitle = document.getElementById('siteTitle').value;
    const enableAnalytics = document.getElementById('enableAnalytics').checked;

    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('siteTitle', siteTitle);
    localStorage.setItem('enableAnalytics', enableAnalytics);
    
    alert('Ayarlar kaydedildi!');
  }
};