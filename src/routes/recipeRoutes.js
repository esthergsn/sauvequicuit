const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// Mappe GET sur /api/recipes pour lire les recettes
router.get('/', recipeController.getAllRecipes);

// Mappe POST sur /api/recipes pour ajouter une recette
router.post('/', recipeController.createRecipe);

module.exports = router;