const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Get all favorite recipes for the authenticated user
exports.getFavorites = async (req, res) => {
  try {
    console.log('req.user in getFavorites:', req.user);
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user.favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Add a recipe to favorites
exports.addFavorite = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.favorites.includes(recipeId)) {
      return res.status(400).json({ success: false, message: 'Recipe already in favorites' });
    }
    user.favorites.push(recipeId);
    await user.save();
    res.status(200).json({ success: true, message: 'Recipe added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Remove a recipe from favorites
exports.removeFavorite = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.favorites = user.favorites.filter(favId => favId.toString() !== recipeId);
    await user.save();
    res.status(200).json({ success: true, message: 'Recipe removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
