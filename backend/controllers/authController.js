const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

// Fonction pour l'inscription
exports.register = async (req, res) => {
  try {
    const { username, phone, password, role, businessName, businessAddress } = req.body;

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone already registered.' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new User({
      username,
      phone,
      password: hashedPassword,
      role,
      businessName: role === 'caterer' ? businessName : undefined,
      businessAddress: role === 'caterer' ? businessAddress : undefined
    });

    await newUser.save();

    // Generate JWT token for immediate authentication
    const token = jwt.sign({ userId: newUser._id }, 'your-secret-key', { expiresIn: '1h' });

    // Return user and token
    res.status(201).json({ 
      message: 'User registered successfully!', 
      user: {
        username: newUser.username,
        phone: newUser.phone,
        role: newUser.role,
        businessName: newUser.businessName,
        businessAddress: newUser.businessAddress
      },
      token
    });
  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Fonction pour la connexion
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid phone or password.' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid phone or password.' });
    }

    // Créer un token JWT
    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        username: user.username,
        phone: user.phone,
        role: user.role,
        businessName: user.businessName,
        businessAddress: user.businessAddress
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add endpoint to get current user
exports.getMe = async (req, res) => {
  try {
    // The user is already attached to req by the protect middleware
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      _id: user._id.toString(),
      username: user.username,
      phone: user.phone,
      role: user.role,
      businessName: user.businessName,
      businessAddress: user.businessAddress
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Middleware pour protéger les routes (vérification du token)
exports.protect = async (req, res, next) => {
  try {
    // 1) Vérifier si le token est présent
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.'
      });
    }

    // 2) Vérification du token
    const decoded = jwt.verify(token, 'your-secret-key');

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'L\'utilisateur associé à ce token n\'existe plus.'
      });
    }

    // Ajouter l'utilisateur à l'objet request
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token invalide ou expiré'
    });
  }
};

// Handle user logout
exports.logout = (req, res) => {
  // Since JWT is stateless, we don't need to do much on the server
  // The client should remove the token
  res.status(200).json({ message: 'Logout successful' });
};

// Middleware pour restreindre l'accès selon le rôle
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Vérifie si le rôle de l'utilisateur est inclus dans les rôles autorisés
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Vous n\'avez pas la permission d\'effectuer cette action'
      });
    }
    next();
  };
};

// New method to get all caterers
exports.getCaterers = async (req, res) => {
  try {
    const caterers = await User.find({ role: 'caterer' }).select('username businessName');
    res.status(200).json({ caterers });
  } catch (error) {
    console.error('Error fetching caterers:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Fonction pour obtenir un utilisateur par ID
exports.getUserById = async (req, res) => {
  console.log(`getUserById appelé avec ID: ${req.params.id}`);
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    console.log('Résultat de la recherche utilisateur:', user ? 'Utilisateur trouvé' : 'Utilisateur non trouvé');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fonction pour obtenir un traiteur par ID
exports.getCatererById = async (req, res) => {
  try {
    const caterer = await User.findOne({ 
      _id: req.params.id,
      role: 'caterer'
    }).select('-password');
    
    if (!caterer) {
      return res.status(404).json({ message: 'Caterer not found' });
    }
    
    res.json(caterer);
  } catch (err) {
    console.error('Error fetching caterer:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Envoyer un message (pour tous les utilisateurs, même non connectés)
exports.sendMessage = async (req, res) => {
  console.log('sendMessage called with data:', req.body);
  try {
    const { recipientId, content, senderName, senderEmail, senderPhone } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Les ID du destinataire et le contenu du message sont requis' });
    }
    
    // Vérifier si le destinataire existe et est un traiteur
    const recipient = await User.findOne({ _id: recipientId, role: 'caterer' });
    if (!recipient) {
      return res.status(404).json({ message: 'Destinataire non trouvé ou n\'est pas un traiteur' });
    }
    
    // Données de base du message
    const messageData = {
      recipient: recipientId,
      content,
      senderName: senderName || 'Anonyme',
      senderEmail: senderEmail || 'anonyme@example.com',
      senderPhone: senderPhone || ''
    };
    
    // Si l'utilisateur est connecté
    if (req.user) {
      messageData.sender = req.user._id;
      messageData.senderType = req.user.role;
    } else {
      // Pour les visiteurs non enregistrés
      messageData.sender = senderEmail;
      messageData.senderType = 'visitor';
    }
    
    const message = new Message(messageData);
    await message.save();
    
    console.log('Message saved successfully:', message);
    res.status(201).json({ message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les messages reçus par un traiteur
exports.getCatererMessages = async (req, res) => {
  console.log('getCatererMessages called');
  try {
    // Vérifier que l'utilisateur est un traiteur
    if (!req.user || req.user.role !== 'caterer') {
      return res.status(403).json({ message: 'Accès refusé. Seuls les traiteurs peuvent voir leurs messages.' });
    }
    
    const messages = await Message.find({ recipient: req.user._id })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${messages.length} messages for caterer ${req.user.username}`);
    res.json(messages);
  } catch (error) {
    console.error('Error getting caterer messages:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer un message comme lu
exports.markMessageAsRead = async (req, res) => {
  console.log('markMessageAsRead called for message:', req.params.id);
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le destinataire
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    message.read = true;
    await message.save();
    
    console.log('Message marked as read:', message._id);
    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};