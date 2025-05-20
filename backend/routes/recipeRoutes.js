const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect, restrictTo } = require('../controllers/authController');

router.use((req, res, next) => {
  console.log('Route called:', req.method, req.path);
  next();
});

router.get('/', recipeController.getRecipes);
router.get('/category/:category', recipeController.getRecipesByCategory);

router.use(protect);

router.get('/my', recipeController.getMyRecipes);
router.get('/caterer/:catererId', recipeController.getRecipesByCaterer);
router.get('/:id', recipeController.getRecipe);

router.post('/', restrictTo('caterer'), recipeController.createRecipe);
router.put('/:id', restrictTo('caterer'), recipeController.updateRecipe);
router.delete('/:id', restrictTo('caterer'), recipeController.deleteRecipe);

module.exports = router;
