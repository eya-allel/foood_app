const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware d'authentification
const auth = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Trouver l'utilisateur correspondant
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Ajouter l'utilisateur à l'objet request
    req.user = user;
    
    // Ajouter des journaux pour déboguer les propriétés de l'utilisateur
    console.log('User authenticated:', req.user.id);
    console.log('User properties:', Object.keys(user._doc || user));
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ message: 'Authentification invalide' });
  }
};

module.exports = auth;