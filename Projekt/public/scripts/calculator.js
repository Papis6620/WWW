document.addEventListener('DOMContentLoaded', function () {
    const addMealSection = document.getElementById('add-meal-section');
    const addMealInfo = document.getElementById('add-meal-info');
    const mealForm = document.getElementById('meal-form');

    const productTableBody = document.getElementById('product-table-body');
    const noProductsMessage = document.getElementById('no-products-message');
    const noSummaryMessage = document.getElementById('no-summary-message');
    const productTable = document.querySelector('.table.selected');
    const productTable2 = document.querySelector('.table.selected2');

    const mealProductTableBody = document.getElementById('meal-product-table-body');
    const noMealProductsMessage = document.getElementById('no-meal-products-message');
    const noMealSummaryMessage = document.getElementById('no-meal-summary-message');
    const mealProductTable = document.querySelector('.table.meal-products');
    const mealSummaryTable = document.querySelector('.table.meal-summary');

    if (mealProductTableBody.children.length === 0) {
        mealProductTable.style.display = 'none';
        mealSummaryTable.style.display = 'none';
        noMealProductsMessage.style.display = 'block';
        noMealSummaryMessage.style.display = 'block';
    } else {
        mealProductTable.style.display = 'table';
        mealSummaryTable.style.display = 'table';
        noMealProductsMessage.style.display = 'none';
        noMealSummaryMessage.style.display = 'none';
    }
    if (productTableBody.children.length === 0) {
        productTable.style.display = 'none';
        productTable2.style.display = 'none';
        noProductsMessage.style.display = 'block';
        noSummaryMessage.style.display = 'block';
    } else {
        productTable.style.display = 'table';
        productTable2.style.display = 'table';
        noProductsMessage.style.display = 'none';
        noSummaryMessage.style.display = 'none';
    }
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
                addMealInfo.style.display = 'none';
                mealForm.style.display = 'block';
            } else {
                profileLink.style.display = 'none';   // Ukryj link do profilu
                loginLink.style.display = 'block';    // Pokaż link do logowania
                logoutLink.style.display = 'none';    // Ukryj link do wylogowania
                addMealInfo.textContent = 'Zaloguj się, żeby dodać posiłek';
                addMealInfo.style.display = 'block';
                mealForm.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Błąd podczas sprawdzania stanu logowania:', error);
        });
});

document.getElementById("weight").addEventListener("input", function (event) {
    this.value = this.value.replace(/[^0-9]/g, ""); // Usuwa wszystkie znaki, które nie są cyframi
});

const productCache = {};

document.getElementById('product-input').addEventListener('input', function () {
    const query = this.value;
    const suggestionsContainer = document.getElementById('product-suggestions');

    if (query.length < 2) {
        suggestionsContainer.style.display = 'none'; // Ukryj listę, jeśli tekst jest zbyt krótki
        return;
    }

    // Pobieranie produktów z backendu
    fetch(`/api/products/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            suggestionsContainer.innerHTML = ''; // Wyczyść listę

            if (data.length === 0) {
                suggestionsContainer.style.display = 'none'; // Ukryj, jeśli brak wyników
                return;
            }

            // Pokaż wyniki
            suggestionsContainer.style.display = 'block';

            data.forEach(product => {
                productCache[product["Nazwa produktu"]] = product; // Przechowaj produkt w cache
                const suggestion = document.createElement('div');
                suggestion.textContent = product["Nazwa produktu"]; // Wyświetl nazwę produktu
                suggestion.dataset.product = JSON.stringify(product); // Przechowuj dane produktu

                // Obsługa kliknięcia na podpowiedź
                suggestion.addEventListener('click', function () {
                    document.getElementById('product-input').value = product["Nazwa produktu"]; // Ustaw wartość w polu input
                    suggestionsContainer.style.display = 'none'; // Ukryj listę
                });

                suggestionsContainer.appendChild(suggestion);
            });
        })
        .catch(error => console.error('Błąd podczas pobierania produktów:', error));
});

document.getElementById('meal-product-input').addEventListener('input', function () {
    const query = this.value;
    const suggestionsContainer = document.getElementById('meal-product-suggestions');

    if (query.length < 2) {
        suggestionsContainer.style.display = 'none'; // Ukryj listę, jeśli tekst jest zbyt krótki
        return;
    }

    // Pobieranie produktów z backendu
    fetch(`/api/products/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            suggestionsContainer.innerHTML = ''; // Wyczyść listę

            if (data.length === 0) {
                suggestionsContainer.style.display = 'none'; // Ukryj, jeśli brak wyników
                return;
            }

            // Pokaż wyniki
            suggestionsContainer.style.display = 'block';

            data.forEach(product => {
                productCache[product["Nazwa produktu"]] = product; // Przechowaj produkt w cache
                const suggestion = document.createElement('div');
                suggestion.textContent = product["Nazwa produktu"]; // Wyświetl nazwę produktu
                suggestion.dataset.product = JSON.stringify(product); // Przechowuj dane produktu

                // Obsługa kliknięcia na podpowiedź
                suggestion.addEventListener('click', function () {
                    document.getElementById('meal-product-input').value = product["Nazwa produktu"]; // Ustaw wartość w polu input
                    suggestionsContainer.style.display = 'none'; // Ukryj listę
                });

                suggestionsContainer.appendChild(suggestion);
            });
        })
        .catch(error => console.error('Błąd podczas pobierania produktów:', error));
});

function addProduct() {
    const productInput = document.getElementById('product-input');
    const weightInput = document.getElementById('weight');
    const productTableBody = document.getElementById('product-table-body');
    const responseMessage = document.getElementById('responseMessage');
    const noProductsMessage = document.getElementById('no-products-message');
    const productTable = document.querySelector('.table.selected');
    const productTable2 = document.querySelector('.table.selected2');
    

    const selectedProduct = productCache[productInput.value];
    const weight = parseFloat(weightInput.value);

    if (!selectedProduct) {
        responseMessage.innerHTML = '<div class="alert alert-danger">Wybierz produkt z listy!</div>';
        return;
    }
    if (isNaN(weight) || weight <= 0) {
        responseMessage.innerHTML = '<div class="alert alert-danger">Podaj poprawną wagę!</div>';
        return;
    }

    const kcal = (selectedProduct.kcal * weight) / 100;
    const białka = (selectedProduct.białka * weight) / 100;
    const tłuszcze = (selectedProduct.tłuszcze * weight) / 100;
    const węglowodany = (selectedProduct.węglowodany * weight) / 100;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${selectedProduct["Nazwa produktu"]}</td>
        <td>${weight}</td>
        <td>${kcal.toFixed(2)}</td>
        <td>${białka.toFixed(2)}</td>
        <td>${tłuszcze.toFixed(2)}</td>
        <td>${węglowodany.toFixed(2)}</td>
    `;
    productTableBody.appendChild(row);

    responseMessage.innerHTML = '<div class="alert alert-success">Produkt dodany pomyślnie!</div>';
    updateSummary();
    document.getElementById('product-form').reset();

    // Show the product table and hide the no products message
    productTable.style.display = 'table';
    noProductsMessage.style.display = 'none';
}

function addMealProduct() {
    const productInput = document.getElementById('meal-product-input');
    const weightInput = document.getElementById('meal-weight');
    const mealProductTableBody = document.getElementById('meal-product-table-body');
    const mealResponseMessage = document.getElementById('mealResponseMessage');
    const noMealProductsMessage = document.getElementById('no-meal-products-message');
    const mealProductTable = document.querySelector('.table.meal-products');
    const mealSummaryTable = document.querySelector('.table.meal-summary');

    const selectedProduct = productCache[productInput.value];
    const weight = parseFloat(weightInput.value);

    if (!selectedProduct) {
        mealResponseMessage.innerHTML = '<div class="alert alert-danger">Wybierz produkt z listy!</div>';
        return;
    }
    if (isNaN(weight) || weight <= 0) {
        mealResponseMessage.innerHTML = '<div class="alert alert-danger">Podaj poprawną wagę!</div>';
        return;
    }

    const kcal = (selectedProduct.kcal * weight) / 100;
    const białka = (selectedProduct.białka * weight) / 100;
    const tłuszcze = (selectedProduct.tłuszcze * weight) / 100;
    const węglowodany = (selectedProduct.węglowodany * weight) / 100;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${selectedProduct["Nazwa produktu"]}</td>
        <td>${weight}</td>
        <td>${kcal.toFixed(2)}</td>
        <td>${białka.toFixed(2)}</td>
        <td>${tłuszcze.toFixed(2)}</td>
        <td>${węglowodany.toFixed(2)}</td>
    `;
    mealProductTableBody.appendChild(row);

    mealResponseMessage.innerHTML = '<div class="alert alert-success">Produkt dodany do posiłku!</div>';
    updateMealSummary();
    document.getElementById('meal-product-input').value = '';
    document.getElementById('meal-weight').value = '';
    
    // Show the meal product table and hide the no meal products message
    mealProductTable.style.display = 'table';
    noMealProductsMessage.style.display = 'none';
    mealSummaryTable.style.display = 'table';
}

function updateSummary() {
    const productTableBody = document.getElementById('product-table-body');
    const summaryTableBody = document.getElementById('summary-table-body');
    const noSummaryMessage = document.getElementById('no-summary-message');
    const allRows = productTableBody.querySelectorAll('tr');
    const productTable2 = document.querySelector('.table.selected2');
    let totalKcal = 0, totalBiałka = 0, totalTłuszcze = 0, totalWęglowodany = 0;

    allRows.forEach(row => {
        totalKcal += parseFloat(row.children[2].textContent);
        totalBiałka += parseFloat(row.children[3].textContent);
        totalTłuszcze += parseFloat(row.children[4].textContent);
        totalWęglowodany += parseFloat(row.children[5].textContent);
    });

    // Clear previous summary
    summaryTableBody.innerHTML = '';

    if (allRows.length === 0) {
        noSummaryMessage.style.display = 'block';
    } else {
        productTable2.style.display = 'table';
        noSummaryMessage.style.display = 'none';
        // Add new summary rows
        const summaryRow = document.createElement('tr');
        summaryRow.innerHTML = `
            <td>${totalKcal.toFixed(2)} kcal</td>
            <td>${totalBiałka.toFixed(2)} g</td>
            <td>${totalTłuszcze.toFixed(2)} g</td>
            <td>${totalWęglowodany.toFixed(2)} g</td>
        `;
        summaryTableBody.appendChild(summaryRow);
    }
}

function updateMealSummary() {
    const mealProductTableBody = document.getElementById('meal-product-table-body');
    const mealSummaryTableBody = document.getElementById('meal-summary');
    const noMealSummaryMessage = document.getElementById('no-meal-summary-message');
    const allRows = mealProductTableBody.querySelectorAll('tr');
    const mealSummaryTable = document.querySelector('.table.meal-summary');
    const noMealProductsMessage = document.getElementById('no-meal-products-message');
    const mealResponseMessage = document.getElementById('mealResponseMessage');
    const mealProductTable = document.querySelector('.table.meal-products');
    const mealAddedResponseMessage = document.getElementById('mealAddedResponseMessage');

    let totalKcal = 0, totalBiałka = 0, totalTłuszcze = 0, totalWęglowodany = 0;

    allRows.forEach(row => {
        totalKcal += parseFloat(row.children[2].textContent);
        totalBiałka += parseFloat(row.children[3].textContent);
        totalTłuszcze += parseFloat(row.children[4].textContent);
        totalWęglowodany += parseFloat(row.children[5].textContent);
    });

    // Clear previous summary
    mealSummaryTableBody.innerHTML = '';

    if (allRows.length === 0) {
        mealProductTable.style.display = 'none';
        mealSummaryTable.style.display = 'none';
        noMealProductsMessage.style.display = 'block';
        noMealSummaryMessage.style.display = 'block';
        mealResponseMessage.style.display = 'none';
        mealAddedResponseMessage.style.display = 'none';
    } else {
        noMealSummaryMessage.style.display = 'none';
        // Add new summary rows
        const summaryRow = document.createElement('tr');
        summaryRow.innerHTML = `
            <td>${totalKcal.toFixed(2)} kcal</td>
            <td>${totalBiałka.toFixed(2)} g</td>
            <td>${totalTłuszcze.toFixed(2)} g</td>
            <td>${totalWęglowodany.toFixed(2)} g</td>
        `;
        mealSummaryTableBody.appendChild(summaryRow);
        mealSummaryTable.style.display = 'table';
    }
}

document.getElementById('add-product-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('add-product-form').style.display = 'block';
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('add-meal-section').style.display = 'none';

    document.getElementById('add-product-link').classList.add('active');
    document.getElementById('calculator-link').classList.remove('active');
    document.getElementById('add-meal-link').classList.remove('active');
    document.getElementById('product-form').reset();
    document.getElementById('add-product-to-db').reset();
    document.getElementById('add-meal-form').reset();
});

document.getElementById('calculator-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('calculator-form').style.display = 'block';
    document.getElementById('add-meal-section').style.display = 'none';

    document.getElementById('calculator-link').classList.add('active');
    document.getElementById('add-product-link').classList.remove('active');
    document.getElementById('add-meal-link').classList.remove('active');
    document.getElementById('product-form').reset();
    document.getElementById('add-product-to-db').reset();
    document.getElementById('add-meal-form').reset();
});

document.getElementById('add-meal-link').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('add-product-form').style.display = 'none';
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('add-meal-section').style.display = 'block';
    document.getElementById('add-product-to-db').reset();
    document.getElementById('product-form').reset();
    document.getElementById('add-meal-form').reset();

    const addMealInfo = document.getElementById('add-meal-info');
    const mealForm = document.getElementById('meal-form');

    // Sprawdzamy stan logowania z backendu
    fetch('/check-login', { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const isLoggedIn = data.isLoggedIn;

            if (isLoggedIn) {
                addMealInfo.style.display = 'none';
                mealForm.style.display = 'block';
            } else {
                addMealInfo.textContent = 'Zaloguj się, żeby dodać posiłek';
                addMealInfo.style.display = 'block';
                mealForm.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Błąd podczas sprawdzania stanu logowania:', error);
        });

    document.getElementById('add-meal-link').classList.add('active');
    document.getElementById('add-product-link').classList.remove('active');
    document.getElementById('calculator-link').classList.remove('active');
});

function addProductToDB() {
    const productName = document.getElementById('product-name').value;
    const productKcal = parseInt(document.getElementById('product-kcal').value);
    const productProtein = parseFloat(document.getElementById('product-protein').value);
    const productFat = parseFloat(document.getElementById('product-fat').value);
    const productCarbs = parseFloat(document.getElementById('product-carbs').value);
    const addProductResponseMessage = document.getElementById('addProductResponseMessage');

    if(!productName){
        addProductResponseMessage.innerHTML = '<div class="alert alert-danger">Podaj nazwę produktu!</div>';
        return;
    }else if(isNaN(productKcal) || productKcal <= 0){
        addProductResponseMessage.innerHTML = '<div class="alert alert-danger">Podaj poprawną wartość kalorii!</div>';
        return;
    }else if(isNaN(productProtein) || productProtein < 0){
        addProductResponseMessage.innerHTML = '<div class="alert alert-danger">Podaj poprawną wartość białka!</div>';
        return;
    }else if(isNaN(productFat) || productFat < 0){
        addProductResponseMessage.innerHTML = '<div class="alert alert-danger">Podaj poprawną wartość tłuszczu!</div>';
        return;
    }else if(isNaN(productCarbs) || productCarbs < 0){
        addProductResponseMessage.innerHTML = '<div class="alert alert-danger">Podaj poprawną wartość węglowodanów!</div>';
        return;
    }


    const productData = {
        name: productName,
        kcal: productKcal,
        protein: productProtein,
        fat: productFat,
        carbs: productCarbs
    };

    // Send the product data to the server
    fetch('/api/add-product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addProductResponseMessage.innerHTML = '<div class="alert alert-success">Produkt dodany pomyślnie</div>';
            document.getElementById('add-product-to-db').reset();
        } else {
            addProductResponseMessage.innerHTML = '<div class="alert alert-danger">Błąd podczas dodawania produktu: ' + (data.message || 'Nieznany błąd') + '</div>';
        }
    })
    .catch(error => {
        console.error('Błąd:', error);
        addProductResponseMessage.innerHTML = '<div class="alert alert-danger">Wystąpił problem z dodaniem produktu. Spróbuj ponownie.</div>';
    });
}

function addMeal() {
    const mealName = document.getElementById('meal-name').value;
    const mealProductTableBody = document.getElementById('meal-product-table-body');
    const mealResponseMessage = document.getElementById('mealResponseMessage');
    const mealAddedResponseMessage = document.getElementById('mealAddedResponseMessage');
    const selectedProducts = Array.from(mealProductTableBody.querySelectorAll('tr')).map(row => {
        return {
            name: row.children[0].textContent,
            weight: parseFloat(row.children[1].textContent),
            kcal: parseFloat(row.children[2].textContent),
            protein: parseFloat(row.children[3].textContent),
            fat: parseFloat(row.children[4].textContent),
            carbs: parseFloat(row.children[5].textContent)
        };
    });

    if (!mealName || selectedProducts.length === 0) {
        mealResponseMessage.innerHTML = '<div class="alert alert-danger">Podaj nazwę posiłku i dodaj co najmniej jeden produkt.</div>';
        return;
    }

    const mealData = {
        userId: sessionStorage.getItem('userId'), // Assuming userId is stored in sessionStorage
        name: mealName,
        ingredients: selectedProducts
    };

    // Dodanie posiłku do profilu użytkownika
    fetch('/api/add-meal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mealData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mealAddedResponseMessage.innerHTML = '<div class="alert alert-success">Posiłek dodany pomyślnie.</div>';
                document.getElementById('add-meal-form').reset();
                document.getElementById('meal-product-table-body').innerHTML = ''; // Clear the table
                updateMealSummary(); // Clear the summary
            } else {
                mealAddedResponseMessage.innerHTML = '<div class="alert alert-danger">Błąd podczas dodawania posiłku: ' + (data.message || 'Nieznany błąd.') + '</div>';
            }
        })
        .catch(error => {
            console.error('Błąd podczas dodawania posiłku:', error);
            mealAddedResponseMessage.innerHTML = '<div class="alert alert-danger">Wystąpił problem. Spróbuj ponownie.</div>';
        });
}

function resetProducts() {
    const productTableBody = document.getElementById('product-table-body');
    const responseMessage = document.getElementById('responseMessage');
    const summaryTableBody = document.getElementById('summary-table-body');
    const noProductsMessage = document.getElementById('no-products-message');
    const noSummaryMessage = document.getElementById('no-summary-message');
    const productTable = document.querySelector('.table.selected');
    const productTable2 = document.querySelector('.table.selected2');

    // Clear the product table
    productTableBody.innerHTML = '';

    // Clear the summary
    summaryTableBody.innerHTML = '';

    // Clear any response messages
    responseMessage.innerHTML = '';

    // Reset the form
    document.getElementById('product-form').reset();

    // Hide the product table and show the no products message
    productTable.style.display = 'none';
    productTable2.style.display = 'none';
    noProductsMessage.style.display = 'block';
    noSummaryMessage.style.display = 'block';
}

function resetMealProducts() {
    const mealProductTableBody = document.getElementById('meal-product-table-body');
    const mealResponseMessage = document.getElementById('mealResponseMessage');
    const mealSummaryTableBody = document.getElementById('meal-summary');
    const noMealProductsMessage = document.getElementById('no-meal-products-message');
    const noMealSummaryMessage = document.getElementById('no-meal-summary-message');
    const mealProductTable = document.querySelector('.table.meal-products');
    const mealSummaryTable = document.querySelector('.table.meal-summary');

    // Clear the meal product table
    mealProductTableBody.innerHTML = '';

    // Clear the meal summary
    mealSummaryTableBody.innerHTML = '';

    // Clear any response messages
    mealResponseMessage.innerHTML = '';

    // Reset the form
    document.getElementById('add-meal-form').reset();

    // Hide the meal product table and show the no meal products message
    mealProductTable.style.display = 'none';
    mealSummaryTable.style.display = 'none';
    noMealProductsMessage.style.display = 'block';
    noMealSummaryMessage.style.display = 'block';
}