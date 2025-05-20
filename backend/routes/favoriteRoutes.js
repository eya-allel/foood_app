const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const {
  getFavorites,
  addFavorite,
  removeFavorite
} = require('../controllers/favoriteController');

router.use(protect);

router.get('/', getFavorites);
router.post('/:id', addFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;
