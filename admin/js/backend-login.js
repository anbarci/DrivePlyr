// Semantik, tam mobil uyumlu backend login ve hata yönetimi
const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMessage.classList.add('hidden');
  successMessage.classList.add('hidden');

  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    if (data.status === 'success' && data.token) {
      successMessage.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      localStorage.setItem('driveplyr_token', data.token);
      localStorage.setItem('driveplyr_user', JSON.stringify(data.user));
    } else {
      errorMessage.textContent = (data.message || 'Giriş başarısız.');
      errorMessage.classList.remove('hidden');
    }
  } catch (err) {
    errorMessage.textContent = 'Sunucuya ulaşılmadı.';
    errorMessage.classList.remove('hidden');
  }
});
