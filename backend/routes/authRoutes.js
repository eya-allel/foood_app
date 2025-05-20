const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route pour l'inscription (ne changez pas le chemin)
router.post('/register', authController.register);

// Route pour la connexion (ne changez pas le chemin)
router.post('/login', authController.login);

// Route pour se déconnecter
router.post('/logout', authController.logout);

// Route protégée pour obtenir le profil de l'utilisateur actuel
router.get('/me', authController.protect, authController.getMe);

// Route pour obtenir tous les traiteurs
router.get('/caterers', authController.getCaterers);

// Routes de récupération des utilisateurs
router.get('/user/:id', authController.getUserById);
router.get('/caterer/:id', authController.getCatererById);

// NOUVELLES ROUTES DE MESSAGERIE
// Envoyer un message (accessible à tous)
router.post('/send-message', authController.sendMessage);

// Obtenir les messages d'un traiteur (protégée)
router.get('/messages', authController.protect, authController.getCatererMessages);

// Marquer un message comme lu (protégée)
router.put('/messages/:id/read', authController.protect, authController.markMessageAsRead);

// Log pour vérifier que les routes sont enregistrées
console.log('Routes d\'authentification et de messagerie enregistrées avec succès!');

module.exports = router;