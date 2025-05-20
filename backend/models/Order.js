const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      _id: false,
      recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
      name: String,
      image: String,
      price: Number,
      quantity: Number,
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "preparing", "shipped", "delivered"],
        default: "pending"
      },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
  ],
  address: {
    firstName: String,
    lastName: String,
    email: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
    phone: String,
  },
  method: {
    type: String,
    default: "cod",
  },
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);