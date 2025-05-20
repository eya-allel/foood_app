const express = require("express");
const { 
  placeOrder, 
  getOrdersForCaterer, 
  getOrdersForUser,
  acceptOrderItems,
  rejectOrderItems
} = require("../controllers/orderController");
const { protect } = require('../controllers/authController');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Order placement
router.post("/place", placeOrder);

// Order management for caterers
router.get("/caterer", getOrdersForCaterer);
router.post("/accept", acceptOrderItems);
router.post("/reject", rejectOrderItems);

// Order management for users
router.get("/user", getOrdersForUser);

module.exports = router;