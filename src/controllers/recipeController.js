// Contrôleur des recettes gérant la modélisation N-N avec RecipeIngredient et Ingredient
const prisma = require('../config/db');

// Récupération des recettes avec support de la recherche "Frigo Vide"
exports.getAllRecipes = async (req, res) => {
  const { ingredients } = req.query;

  try {
    // 1. Récupération des recettes en incluant la relation avec la table des ingrédients
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            ingredient: true // Inclut les détails du modèle Ingredient (nom, catégorie)
          }
        }
      }
    });

    // 2. Si aucune recherche d'ingrédients n'est fournie, on renvoie toutes les recettes
    if (!ingredients || ingredients.trim() === '') {
      return res.json(recipes);
    }

    // 3. Traitement des termes de recherche de l'utilisateur (nettoyage et gestion du pluriel/singulier)
    const searchTerms = ingredients
      .toLowerCase()
      .split(/[, ]+/)
      .map(term => term.trim().replace(/s$/, '')) // Retire le 's' final s'il existe
      .filter(term => term.length > 2);

    // 4. Filtrage dynamique dans le tableau des recettes
    const filteredRecipes = recipes.filter(recipe => {
      // Extraction des noms d'ingrédients associés à la recette actuelle
      const recipeIngredientNames = recipe.ingredients.map(ri => ri.ingredient.name.toLowerCase());

      // Vérifie si au moins un des ingrédients de la recette contient l'un des termes recherchés
      return searchTerms.some(term => 
        recipeIngredientNames.some(ingName => ingName.includes(term))
      );
    });

    res.json(filteredRecipes);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Création d'une nouvelle recette et création/liaison automatique de ses ingrédients
exports.createRecipe = async (req, res) => {
  try {
    const { title, steps, prepTime, ingredients } = req.body;

    // Découpage de la chaîne transmise (ex: "tomate, oeufs, fromage") en tableau
    const ingredientList = ingredients 
      ? ingredients.split(',').map(item => item.trim()).filter(item => item.length > 0)
      : [];

    // Création de la recette avec liaison relationnelle automatique via connectOrCreate
    const newRecipe = await prisma.recipe.create({
      data: {
        title,
        steps,
        prepTime: Number(prepTime),
        ingredients: {
          create: ingredientList.map(name => ({
            quantity: "Selon goût", // Valeur par défaut pour la quantité
            ingredient: {
              connectOrCreate: {
                where: { name: name.toLowerCase() }, // Recherche si l'ingrédient existe déjà
                create: { name: name.toLowerCase(), category: "Divers" } // Crée l'ingrédient sinon
              }
            }
          }))
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    });

    res.status(201).json(newRecipe);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};