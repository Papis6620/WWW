const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');  // Załaduj model użytkownika
const Ingredient = require('./models/Ingredient');  // Załaduj model składnika
const bodyParser = require('body-parser');  // Używamy body-parser do parsowania danych POST
const bcrypt = require('bcrypt');
const session = require('express-session');
const Meal = require('./models/Meal');


const app = express();
const PORT = process.env.PORT || 5000;

// Konfiguracja body-parser
app.use(bodyParser.json());  // Dla danych JSON
app.use(bodyParser.urlencoded({ extended: true }));  // Dla formularzy URL-encoded

// Serwowanie plików statycznych (CSS, obrazy, itp.)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'sites')));

app.use(session({
  secret: 'secret_key', // Zmień na bardziej bezpieczny klucz
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Użyj true, jeśli masz HTTPS
}));

// Trasa rejestracji
app.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate: check if passwords match
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Hasła nie pasują do siebie' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Użytkownik z tym adresem e-mail już istnieje' });
    }

    // Create a new user
    const user = new User({
        username,
        email,
        passwordHash: password  // Store the plain password temporarily
    });

    try {
        await user.save();
        res.status(201).json({ message: 'Użytkownik zarejestrowany pomyślnie' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Błąd serwera. Spróbuj ponownie później' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Użytkownik nie istnieje' });
        }

        // Sprawdzenie poprawności hasła
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Niepoprawne hasło' });
        }

        // Zapisz dane użytkownika w sesji
        req.session.userId = user._id;
        req.session.username = user.username;

        // Jeśli logowanie się udało, wyślij odpowiedź sukcesu z userId
        res.status(200).json({ message: 'Zalogowano pomyślnie', userId: user._id });
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        res.status(500).json({ message: 'Błąd serwera. Spróbuj ponownie później.' });
    }
});

// Trasa wylogowywania
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.status(500).send('Błąd wylogowywania');
      }
      res.redirect('/');
  });
});

// Middleware do sprawdzania stanu logowania
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.userId ? true : false; // Sprawdzenie, czy użytkownik jest zalogowany
  res.locals.username = req.session.username;  // Dostęp do nazwy użytkownika w sesji
  next();
});

// Strona główna
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'sites', 'index.html')); // Ścieżka do pliku index.html
});

// Strona profilu
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // Jeśli użytkownik nie jest zalogowany, przekieruj do logowania
  }

  // Przekazujemy dane użytkownika
  res.sendFile(path.join(__dirname, 'sites', 'profile.html'));
});

app.get('/check-login', (req, res) => {
  if (req.session.userId) {
      User.findById(req.session.userId)
          .then(user => {
              res.json({ isLoggedIn: true, username: user.username });  // Zwróć imię użytkownika
          })
          .catch(err => {
              console.error('Błąd pobierania danych użytkownika:', err);
              res.json({ isLoggedIn: false });
          });
  } else {
      res.json({ isLoggedIn: false });  // Użytkownik nie jest zalogowany
  }
});

app.get('/api/products', async (req, res) => {
  try {
      // Pobieranie produktów posortowanych alfabetycznie
      const products = await Ingredient.find().sort({ name: 1 }); // 1 oznacza sortowanie rosnąco (alfabetycznie)
      res.json(products);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Błąd podczas pobierania produktów' });
  }
});

app.get('/api/products/search', async (req, res) => {
  const query = req.query.q; // Zapytanie wyszukiwania z parametru URL
  try {
      const products = await Ingredient.find({
          "Nazwa produktu": { $regex: query, $options: 'i' } // Wyszukiwanie case-insensitive
      });
      res.json(products);
  } catch (error) {
      res.status(500).json({ error: 'Błąd podczas wyszukiwania produktów' });
  }
});

app.post('/api/add-product', async (req, res) => {
  const { name, kcal, protein, fat, carbs } = req.body;

  if (!name || !kcal || !protein || !fat || !carbs) {
      return res.status(400).json({ success: false, message: 'Wszystkie pola są wymagane' });
  }

  try {
      const newIngredient = new Ingredient({
          name,
          kcal,
          protein,
          fat,
          carbs
      });

      await newIngredient.save();
      res.status(201).json({ success: true, message: 'Produkt dodany pomyślnie' });
    } catch (error) {
        console.error('Błąd podczas dodawania produktu:', error);
        res.status(500).json({ success: false, message: 'Błąd serwera, spróbuj ponownie' });
    }
});

app.post('/api/add-meal', (req, res) => {
    const { userId, name, ingredients } = req.body;
    const newMeal = new Meal({
        userId,
        name,
        ingredients
    });

    newMeal.save()
        .then(meal => res.json({ success: true, meal }))
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

// Get meals for a user
app.get('/api/meals', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Użytkownik nie jest zalogowany' });
    }
    Meal.find({ userId })
        .then(meals => res.json({ success: true, meals }))
        .catch(err => res.status(500).json({ success: false, message: err.message }));
});

app.post('/api/update-user', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Użytkownik nie jest zalogowany' });
    }

    const { 'new-email': newEmail, 'new-username': newUsername, 'new-password': newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Użytkownik nie znaleziony' });
        }

        if (newEmail){
            if(newEmail === user.email){
                return res.status(400).json({ success: false, message: 'Podano ten sam e-mail' });
            } 
            const existingEmailUser = await User.findOne({ email: newEmail });
            if (existingEmailUser) {
                return res.status(400).json({ success: false, message: 'Użytkownik z tym adresem e-mail już istnieje' });
            }
            user.email = newEmail;
        } 
        if (newUsername){
            if (newUsername === user.username) {
                return res.status(400).json({ success: false, message: 'Podano tę samą nazwę użytkownika' });
            }
            const existingUsernameUser = await User.findOne({ username: newUsername });
            if (existingUsernameUser) {
                return res.status(400).json({ success: false, message: 'Użytkownik z taką nazwą już istnieje' });
            }
            user.username = newUsername;
        }
        if (newPassword) user.passwordHash = newPassword;
            
        if (!newEmail && !newUsername && !newPassword) {
            return res.status(400).json({ success: false, message: 'Brak danych do aktualizacji' });
        }
            
        await user.save();
        res.json({ success: true, message: 'Dane użytkownika zostały zaktualizowane' });
    } catch (error) {
        console.error('Błąd podczas aktualizacji danych użytkownika:', error);
        res.status(500).json({ success: false, message: 'Błąd serwera. Spróbuj ponownie później.' });
    }
});

// Połączenie z MongoDB
mongoose.connect('mongodb://localhost:27017/Project', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Połączono z MongoDB');
}).catch((error) => {
    console.error('Błąd połączenia z MongoDB:', error);
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
