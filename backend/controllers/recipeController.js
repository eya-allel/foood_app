
// Correction du contrôleur de recettes
const Recipe = require('../models/Recipe');

// Récupérer toutes les recettes (PUBLIC - ne requiert pas d'authentification)
exports.getRecipes = async (req, res) => {
  try {
    console.log('Exécution de getRecipes');
    const recipes = await Recipe.find({}).populate('createdBy', 'username businessName');
    
    // Log le nombre de recettes trouvées
    console.log(`Nombre de recettes trouvées: ${recipes.length}`);
    
    // Retourner directement le tableau de recettes, sans l'envelopper dans un objet
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching all recipes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching all recipes', 
      error: error.message 
    });
  }
};

// Récupérer mes recettes
exports.getMyRecipes = async (req, res) => {
  try {
    console.log('Exécution de getMyRecipes, userID:', req.user.id);
    const recipes = await Recipe.find({ createdBy: req.user.id }).populate('createdBy', 'username businessName');
    
    // Retourner directement le tableau de recettes
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching my recipes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching my recipes', 
      error: error.message 
    });
  }
};

// Récupérer les recettes par catégorie (PUBLIC - ne requiert pas d'authentification)
exports.getRecipesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log('Catégorie demandée:', category);
    
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category not specified' 
      });
    }
    
    // Recherche insensible à la casse
    const recipes = await Recipe.find({
      category: new RegExp(`^${category}$`, 'i')
    }).populate('createdBy', 'username businessName');
    
    console.log(`Nombre de recettes dans la catégorie ${category}: ${recipes.length}`);
    
    // Retourner directement le tableau de recettes
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recipes by category', 
      error: error.message 
    });
  }
};

// Récupérer une recette spécifique (PUBLIC - ne requiert pas d'authentification)
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id
    }).populate('createdBy', 'username businessName');
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found' 
      });
    }
    
    // Retourner directement l'objet recette
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recipe', 
      error: error.message 
    });
  }
};

// Créer une nouvelle recette
exports.createRecipe = async (req, res) => {
  try {
    const { name, description, ingredients, image, category, price } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'The name and description fields are required'
      });
    }
    
    const recipe = await Recipe.create({
      name,
      description,
      ingredients: ingredients || [],
      image,
      price,
      category: category || 'Uncategorized',
      createdBy: req.user.id
    });
    
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating recipe', 
      error: error.message 
    });
  }
};

// Mettre à jour une recette
exports.updateRecipe = async (req, res) => {
  try {
    const { name, description, ingredients, image, category, price } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'The name and description fields are required'
      });
    }
    
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { 
        name, 
        description, 
        ingredients: ingredients || [], 
        image,
        price,
        category: category || 'Uncategorized' 
      },
      { new: true, runValidators: true }
    );
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found or not authorized to edit it' 
      });
    }
    
    res.status(200).json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating recipe', 
      error: error.message 
    });
  }
};

// Supprimer une recette
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipe not found or not authorized to delete it' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Recipe deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error while deleting recipe', 
      error: error.message 
    });
  }
};

// Récupérer les recettes par traiteur
exports.getRecipesByCaterer = async (req, res) => {
  try {
    const { catererId } = req.params;
    const recipes = await Recipe.find({ createdBy: catererId }).populate('createdBy', 'username businessName');
    
    // Retourner directement le tableau de recettes
    res.status(200).json(recipes);
  } catch (error) {
    console.error('Error fetching recipes by caterer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching recipes by caterer', 
      error: error.message 
    });
  }
};