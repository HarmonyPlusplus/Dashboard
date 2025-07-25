document.getElementById('loginBtn').addEventListener('click', function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const apiUrl = 'https://talent-backend-o5cb.onrender.com/api/auth/login';

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }
      return response.json();
    })
    .then(data => {
      console.log('API response:', data);

      if (data.token) {
        // ✅ CORRECT: Save token HERE while you have it
        localStorage.setItem('authToken', data.token);

        showNotification("Login successful!");
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 1500);
      } else {
        alert("Invalid email or password.");
      }
    })
    .catch(error => {
      console.error('Error occurred:', error);
      alert("Login failed: " + error.message);
    });
});

// ✅ notification helper
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 2000);
}
// ✅ error notification helper
function showErrorNotification(message) {
  const notification = document.getElementById('errorNotifcation');
  if (!notification) return;
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 2000);
}