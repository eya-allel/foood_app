const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cors = require('cors');
require('dotenv').config(); // Si vous utilisez dotenv

const app = express();

// Configuration CORS améliorée
app.use(cors({
  origin: '*',  // Accepte toutes les origines pour les tests
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de base
app.use(express.json());

// Middleware for logging requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// Middleware de journalisation détaillée pour les routes de messages
app.use('/api/messages', (req, res, next) => {
  console.log(`MESSAGE API: ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('REQUEST BODY:', req.body);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

// Route 404 pour les chemins non trouvés
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Error handling middleware amélioré
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Connexion MongoDB
mongoose.connect('mongodb+srv://alleleya93:2aB2Hz0IBwAF1foo@cluster0.03spdaf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB connecté');
    app.listen(3000, () => console.log('Serveur sur port 3000'));
  })
  .catch(err => console.error('Erreur DB:', err));