const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    kcal: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
});

const Ingredient = mongoose.model('Ingredient', IngredientSchema);
module.exports = Ingredient;