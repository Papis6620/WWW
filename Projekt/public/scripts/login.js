document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Zatrzymuje domyślną akcję formularza (przeładowanie strony)

    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        const result = await response.json(); // Parsowanie odpowiedzi jako JSON
        const responseMessage = document.getElementById('responseMessage');

        // Obsługuje odpowiedzi o sukcesie i błędach
        if (response.ok) {
            sessionStorage.setItem('userId', result.userId);
            responseMessage.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
            window.location.href = '/profile';
        } else {
            responseMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Błąd serwera. Spróbuj ponownie później.</div>`;
    }
});