const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');  // Załaduj model użytkownika
const bodyParser = require('body-parser');  // Używamy body-parser do parsowania danych POST
const bcrypt = require('bcrypt');
const session = require('express-session');

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

  // Walidacja: sprawdzenie, czy hasła się zgadzają
  if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Hasła nie pasują do siebie' });
  }

  // Sprawdzenie, czy użytkownik już istnieje
  const existingUser = await User.findOne({ email });
  if (existingUser) {
      return res.status(400).json({ message: 'Użytkownik z tym adresem e-mail już istnieje' });
  }

  // Haszowanie hasła przed zapisaniem
  const hashedPassword = await bcrypt.hash(password, 10);

  // Tworzenie nowego użytkownika
  const user = new User({
      username,
      email,
      passwordHash: hashedPassword
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

  // Jeśli logowanie się udało, wyślij odpowiedź sukcesu
  res.status(200).json({ message: 'Zalogowano pomyślnie' });
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
