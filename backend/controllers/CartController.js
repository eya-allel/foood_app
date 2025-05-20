const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Ajouter un produit au panier
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;

    const userData = await User.findById(userId);
    let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    await User.findByIdAndUpdate(userId, { cartData });
    res.status(200).json({ success: true, message: 'Added to cart' });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Error adding to cart', error: error.message });
  }
};

// Mettre à jour le panier utilisateur
exports.updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId, quantity } = req.body;

    const userData = await User.findById(userId);
    let cartData = userData.cartData || {};

    cartData[itemId] = quantity;

    await User.findByIdAndUpdate(userId, { cartData });
    res.status(200).json({ success: true, message: 'Cart updated' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ success: false, message: 'Error updating cart', error: error.message });
  }
};

// Récupérer le panier utilisateur
exports.getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const userData = await User.findById(userId);
    let cartData = userData.cartData || {};

    // Fetch recipe details for each item in cartData
    // Filter itemIds to only valid ObjectId strings
    const itemIds = Object.keys(cartData).filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    const recipes = await Recipe.find({ _id: { $in: itemIds } });

    // Map recipes to cart items with quantity
    const cartItems = recipes.map(recipe => ({
      _id: recipe._id,
      name: recipe.name,
      image: recipe.image,
      price: recipe.price,
      quantity: cartData[recipe._id.toString()] || 0,
    }));

    res.status(200).json({ success: true, cartItems });
  } catch (error) {
    console.error('Error getting user cart:', error);
    res.status(500).json({ success: false, message: 'Error getting user cart', error: error.message });
  }
};
