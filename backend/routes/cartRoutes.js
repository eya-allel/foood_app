const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const { protect } = require('../controllers/authController');

// Debug logs for cartController
console.log('cartController keys:', Object.keys(cartController));
console.log('typeof addToCart:', typeof cartController.addToCart);
console.log('typeof getUserCart:', typeof cartController.getUserCart);
console.log('typeof updateCart:', typeof cartController.updateCart);

// Destructure controller methods
const {
  addToCart,
  getUserCart,
  updateCart,
} = cartController;

// Log all incoming requests
router.use((req, res, next) => {
  console.log('Route appelée:', req.method, req.path);
  next();
});

// Apply authentication to all routes
router.use(protect);

// Cart routes
router.post('/get', getUserCart);
router.post('/add', addToCart);
router.post('/update', updateCart);

module.exports = router;
