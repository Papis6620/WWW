const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definicja schematu użytkownika
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true  // Nazwa użytkownika musi być unikalna
  },
  email: {
    type: String,
    required: true,
    unique: true  // E-mail musi być unikalny
  },
  passwordHash: {
    type: String,
    required: true  // Hasło jest wymagane
  },
  createdAt: {
    type: Date,
    default: Date.now  // Data rejestracji
  }
});

// Middleware do haszowania hasła przed zapisaniem użytkownika
userSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Tworzenie modelu użytkownika
const User = mongoose.model('User', userSchema);

module.exports = User;
