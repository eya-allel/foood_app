const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Le nom de la recette est obligatoire"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "La description est obligatoire"],
    trim: true,
  },
  ingredients: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    default: "Uncategorized",
    required: [true, "La categorie est obligatoire"],
    trim: true,
  },
  image: {
    type: String,
  },
  price: { type: Number, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Recipe", RecipeSchema);
