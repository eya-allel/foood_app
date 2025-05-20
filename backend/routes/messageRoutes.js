
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Route de contournement simplifiée pour les messages
router.post('/fallback-send', async (req, res) => {
  try {
    console.log('Using fallback route for sending message');
    console.log('Received data:', req.body);
    
    const { recipientId, content, senderName, senderEmail, senderPhone } = req.body;
    
    // Validations minimes
    if (!recipientId) {
      return res.status(400).json({ message: 'recipientId is required' });
    }
    
    if (!content) {
      return res.status(400).json({ message: 'content is required' });
    }
    
    // Vérifier rapidement si le destinataire existe
    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Créer un message avec le strict minimum
    const message = new Message({
      recipient: recipientId,
      sender: 'fallback-user',
      senderType: 'user',
      senderName: senderName || 'Fallback User',
      senderEmail: senderEmail || 'fallback@example.com',
      senderPhone: senderPhone || '',
      content
    });
    
    console.log('Saving message with data:', {
      recipient: message.recipient,
      sender: message.sender,
      senderType: message.senderType,
      senderName: message.senderName,
      senderEmail: message.senderEmail,
      content: message.content
    });
    
    await message.save();
    console.log('Message saved successfully');
    
    res.status(201).json({ message: 'Message sent successfully via fallback route' });
  } catch (error) {
    console.error('FALLBACK ROUTE ERROR:', error);
    console.error('Stack:', error.stack);
    
    // Renvoyer une réponse d'erreur détaillée
    res.status(500).json({ 
      message: 'Server error in fallback route', 
      error: error.message,
      stack: error.stack,
      details: error.toString()
    });
  }
});

// Route spécifique pour les visiteurs - pas besoin d'authentification
router.post('/visitor-send', async (req, res) => {
  try {
    console.log('Received visitor message data:', req.body);
    
    const { recipientId, content, senderName, senderEmail, senderPhone } = req.body;
    
    if (!recipientId || !content || !senderName || !senderEmail) {
      return res.status(400).json({ 
        message: 'Recipient ID, content, sender name and email are required' 
      });
    }
    
    // Check if recipient exists and is a caterer
    const recipient = await User.findOne({ _id: recipientId, role: 'caterer' });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found or is not a caterer' });
    }
    
    // Create message for visitor
    const message = new Message({
      recipient: recipientId,
      sender: senderEmail,
      senderType: 'visitor',
      senderName,
      senderEmail,
      senderPhone: senderPhone || '',
      content
    });
    
    await message.save();
    
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error in visitor-send:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Send a message (for authenticated users)
router.post('/send', auth, async (req, res) => {
  try {
    console.log('Authenticated user sending message:', req.user ? req.user.id : 'no user');
    console.log('User object properties:', Object.keys(req.user._doc || req.user));
    console.log('Received message data:', req.body);
    
    const { recipientId, content, senderName, senderEmail, senderPhone } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient ID and message content are required' });
    }
    
    // Check if recipient exists and is a caterer
    const recipient = await User.findOne({ _id: recipientId });
    console.log('Recipient found:', recipient ? 'Yes' : 'No');
    
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Vérifier si l'utilisateur est connecté et a les propriétés nécessaires
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Créer un message avec des valeurs par défaut pour les propriétés manquantes
    const messageData = {
      recipient: recipientId,
      sender: req.user.id,
      senderType: req.user.role || 'user',
      // Essayer différentes propriétés potentielles pour le nom d'utilisateur
      senderName: req.user.username || req.user.name || senderName || 'User',
      // Utiliser senderEmail du corps de la requête si l'utilisateur n'a pas d'email
      senderEmail: req.user.email || senderEmail || 'no-email@example.com',
      senderPhone: req.user.phone || senderPhone || '',
      content
    };
    
    console.log('Creating message with data:', messageData);
    
    const message = new Message(messageData);
    await message.save();
    
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('DETAILED ERROR in /send route:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all messages received by a caterer (requires auth)
router.get('/received', auth, async (req, res) => {
  try {
    console.log('Getting received messages for:', req.user ? req.user.id : 'no user');
    
    // Only caterers can access their received messages
    if (!req.user || req.user.role !== 'caterer') {
      return res.status(403).json({ message: 'Access denied. Only caterers can view received messages.' });
    }
    
    const messages = await Message.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting received messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a message as read
router.put('/read/:id', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only the recipient can mark a message as read
    if (message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    message.read = true;
    await message.save();
    
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to a message
router.post('/reply/:id', auth, async (req, res) => {
  try {
    console.log('Replying to message:', req.params.id);
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }
    
    const originalMessage = await Message.findById(req.params.id);
    
    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }
    
    // Only the recipient can reply to a message
    if (originalMessage.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Vérifier si le message provient d'un visiteur
    if (originalMessage.senderType === 'visitor') {
      return res.status(403).json({ 
        message: 'Cannot reply to visitor messages. Only registered users can receive replies.',
        visitorMessage: true
      });
    }
    
    // For registered users as sender
    let receiverId = originalMessage.sender;
    
    // Create the reply message
    const reply = new Message({
      sender: req.user.id,
      senderType: 'caterer',
      senderName: req.user.username || req.user.name || 'Caterer',
      senderEmail: req.user.email || 'no-email@example.com',
      senderPhone: req.user.phone || '',
      recipient: receiverId,
      content,
      originalMessage: originalMessage._id
    });
    
    await reply.save();
    
    res.status(201).json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route de débogage pour vérifier les propriétés de l'utilisateur
router.get('/debug-user', auth, (req, res) => {
  try {
    const userObj = req.user._doc || req.user;
    
    res.json({
      message: 'User info',
      id: req.user.id,
      properties: Object.keys(userObj),
      userData: {
        role: req.user.role,
        username: req.user.username,
        name: req.user.name,
        email: req.user.email
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;