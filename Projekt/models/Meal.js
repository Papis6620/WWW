const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    ingredients: [
        {
            name: { type: String, required: true },
            weight: { type: Number, required: true },
            kcal: { type: Number, required: true },
            protein: { type: Number, required: true },
            fat: { type: Number, required: true },
            carbs: { type: Number, required: true }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

const Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;