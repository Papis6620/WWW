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
            const welcomeMessage = document.getElementById('welcome-message');

            if (data.isLoggedIn) {
                // Jeśli użytkownik jest zalogowany, wyświetl powitanie z jego imieniem
                welcomeMessage.textContent = `Witaj, ${data.username}!`;  
            } else {
                // Jeśli użytkownik nie jest zalogowany, wyświetl komunikat o konieczności logowania
                welcomeMessage.textContent = 'Musisz być zalogowany, aby zobaczyć swój profil.';
            }
        })
        .catch(error => {
            console.error('Błąd podczas sprawdzania stanu logowania:', error);
        });

    document.getElementById('show-meals').addEventListener('click', function() {
        const mealsContainer = document.getElementById('meals-container');
        const settingsContainer = document.getElementById('settings-container');
        const mealsList = document.getElementById('meals-list');
        document.getElementById('show-meals').classList.add('active');
        document.getElementById('account-settings').classList.remove('active');
        mealsContainer.style.display = 'block';
        settingsContainer.style.display = 'none';
        document.getElementById('start-message').style.display = 'none';
        mealsList.innerHTML = ''; // Clear previous meals

        const userId = sessionStorage.getItem('userId');
        fetch(`/api/meals?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    data.meals.forEach(meal => {
                        const mealDiv = document.createElement('div');
                        mealDiv.classList.add('meal');
                        mealDiv.innerHTML = `
                            <h3>${meal.name} <button class="btn toggle-button" data-bs-toggle="collapse" data-bs-target="#meal-${meal._id}">v</button></h3>
                            <div id="meal-${meal._id}" class="collapse">
                                <ul>
                                    ${meal.ingredients.map(ingredient => `
                                        <li>${ingredient.name} ${ingredient.weight}g <br>${ingredient.kcal.toLocaleString('fullwide', {maximumFractionDigits:12})} kcal, ${ingredient.protein.toLocaleString('fullwide', {maximumFractionDigits:12})}g białka, ${ingredient.fat.toLocaleString('fullwide', {maximumFractionDigits:12})}g tłuszczy, ${ingredient.carbs.toLocaleString('fullwide', {maximumFractionDigits:12})}g węglowodanów</li>
                                    `).join('')}
                                </ul>
                                <p><strong>Podsumowanie:</strong></p>
                                <ul>
                                    <li>Kalorie: ${meal.ingredients.reduce((sum, ingredient) => sum + ingredient.kcal, 0).toLocaleString('fullwide', {maximumFractionDigits:12})} kcal</li>
                                    <li>Białko: ${meal.ingredients.reduce((sum, ingredient) => sum + ingredient.protein, 0).toLocaleString('fullwide', {maximumFractionDigits:12})} g</li>
                                    <li>Tłuszcze: ${meal.ingredients.reduce((sum, ingredient) => sum + ingredient.fat, 0).toLocaleString('fullwide', {maximumFractionDigits:12})} g</li>
                                    <li>Węglowodany: ${meal.ingredients.reduce((sum, ingredient) => sum + ingredient.carbs, 0).toLocaleString('fullwide', {maximumFractionDigits:12})} g</li>
                                </ul>
                            </div>
                        `;
                        mealsList.appendChild(mealDiv);
                    });

                    // Add event listeners to toggle buttons
                    document.querySelectorAll('.toggle-button').forEach(button => {
                        button.addEventListener('click', function() {
                            const target = document.querySelector(this.getAttribute('data-bs-target'));
                            if (target.classList.contains('show')) {
                                this.textContent = 'v';
                            } else {
                                this.textContent = '^';
                            }
                        });

                        // Handle the collapse event to toggle the button text
                        const target = document.querySelector(button.getAttribute('data-bs-target'));
                        target.addEventListener('shown.bs.collapse', function() {
                            button.textContent = '^';
                        });
                        target.addEventListener('hidden.bs.collapse', function() {
                            button.textContent = 'v';
                        });
                    });
                } else {
                    mealsList.innerHTML = '<p>Nie udało się pobrać posiłków.</p>';
                }
            })
            .catch(error => {
                console.error('Błąd podczas pobierania posiłków:', error);
                mealsList.innerHTML = '<p>Wystąpił błąd podczas pobierania posiłków.</p>';
            });
    });

    document.getElementById('account-settings').addEventListener('click', function() {
        const mealsContainer = document.getElementById('meals-container');
        const settingsContainer = document.getElementById('settings-container');
        mealsContainer.style.display = 'none';
        document.getElementById('account-settings').classList.add('active');
        document.getElementById('show-meals').classList.remove('active');
        document.getElementById('start-message').style.display = 'none';
        settingsContainer.style.display = 'block';
    });

    document.getElementById('settings-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const formData = new FormData(this);
        const formObject = Object.fromEntries(formData.entries());

        fetch('/api/update-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        })
        .then(response => response.json())
        .then(data => {
            const settingsResponse = document.getElementById('settings-response');
            if (data.success) {
                settingsResponse.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
                if (formObject['new-username']) {
                    document.getElementById('welcome-message').textContent = `Witaj, ${formObject['new-username']}!`;
                }
                // Reset the form
                document.getElementById('settings-form').reset();
            } else {
                settingsResponse.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Błąd podczas aktualizacji danych:', error);
            document.getElementById('settings-response').innerHTML = `<div class="alert alert-danger">Błąd serwera. Spróbuj ponownie później.</div>`;
        });
    });
});