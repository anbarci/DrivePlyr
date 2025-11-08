const videoAPI = {
  async getVideos(page = 1, limit = 20) {
    try {
      const response = await fetch(`http://localhost:5000/api/videos?page=${page}&limit=${limit}`, {
        headers: authManager.getAuthHeader()
      });
      return await response.json();
    } catch (error) {
      console.error('Videolar yüklenirken hata:', error);
      return null;
    }
  },

  async createVideo(videoData) {
    try {
      const response = await fetch('http://localhost:5000/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authManager.getAuthHeader()
        },
        body: JSON.stringify(videoData)
      });
      return await response.json();
    } catch (error) {
      console.error('Video oluşturulurken hata:', error);
      return null;
    }
  },

  async updateVideo(videoId, videoData) {
    try {
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authManager.getAuthHeader()
        },
        body: JSON.stringify(videoData)
      });
      return await response.json();
    } catch (error) {
      console.error('Video güncellenirken hata:', error);
      return null;
    }
  },

  async deleteVideo(videoId) {
    try {
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: authManager.getAuthHeader()
      });
      return await response.json();
    } catch (error) {
      console.error('Video silinirken hata:', error);
      return null;
    }
  }
};

// Upload form handler
document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const videoData = {
    title: document.getElementById('videoTitle').value,
    description: document.getElementById('videoDescription').value,
    driveUrl: document.getElementById('videoUrl').value,
    driveId: new URL(document.getElementById('videoUrl').value).pathname.split('/d/')[1].split('/')[0],
    category: document.getElementById('videoCategory').value,
    poster: document.getElementById('posterUrl').value
  };

  const result = await videoAPI.createVideo(videoData);
  if (result?.success) {
    alert('Video başarıyla kaydedildi!');
    document.getElementById('uploadForm').reset();
  } else {
    alert('Video kaydedilirken hata oluştu!');
  }
});