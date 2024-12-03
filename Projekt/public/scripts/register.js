document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');

    if (message) {
        // Jeśli istnieje parametr 'message', wyświetl go w elemencie alertu
        const errorMessage = document.getElementById('error-message');
        errorMessage.style.display = 'block';
        errorMessage.innerText = message;
    }
});
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();  // Zatrzymuje domyślną akcję formularza (przeładowanie strony)

    const formData = new FormData(this);
    const formObject = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        // Sprawdzamy, czy odpowiedź jest w formacie JSON
        const result = await response.json(); // Parsowanie odpowiedzi jako JSON

        const responseMessage = document.getElementById('responseMessage');
        
        // Obsługuje odpowiedzi o sukcesie i błędach
        if (response.ok) {
            responseMessage.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
        } else {
            responseMessage.innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Błąd podczas rejestracji:', error);
        document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Błąd serwera.</div>`;
    }
});