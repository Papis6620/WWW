document.addEventListener('DOMContentLoaded', function () {
    // Sprawdzamy stan logowania z backendu
    fetch('/check-login', { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const isLoggedIn = data.isLoggedIn;
            const profileLink = document.querySelector('.nav-link-profile');
            const loginLink = document.querySelector('.nav-link-login');
            const logoutLink = document.querySelector('.nav-link-logout');

            if (isLoggedIn) {
                profileLink.style.display = 'block';  // Pokaż link do profilu
                loginLink.style.display = 'none';     // Ukryj link do logowania
                logoutLink.style.display = 'block';   // Pokaż link do wylogowania
            } else {
                profileLink.style.display = 'none';   // Ukryj link do profilu
                loginLink.style.display = 'block';    // Pokaż link do logowania
                logoutLink.style.display = 'none';    // Ukryj link do wylogowania
            }
        })
        .catch(error => {
            console.error('Błąd podczas sprawdzania stanu logowania:', error);
        });
});
