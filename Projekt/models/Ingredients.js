const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    "Nazwa produktu": { type: String, required: true },
    kcal: { type: Number, required: true },
    białka: { type: Number, required: true },
    tłuszcze: { type: Number, required: true },
    węglowodany: { type: Number, required: true },
});

module.exports = mongoose.model('Ingredient', IngredientSchema);