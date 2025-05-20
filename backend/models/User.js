const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true // Add this to ensure unique phone numbers
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'caterer'],
    required: true
  },
  businessName: {
    type: String,
    required: function () {
      return this.role === 'caterer';
    }
  },
  businessAddress: {
    type: String,
    required: function () {
      return this.role === 'caterer';
    }
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    }
  ],
  cartData: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);