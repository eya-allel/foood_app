const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Send a message (works for both logged in users and visitors)
router.post('/send', async (req, res) => {
  try {
    const { recipientId, content, senderName, senderEmail, senderPhone } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient ID and message content are required' });
    }
    
    // Check if recipient exists and is a caterer
    const recipient = await User.findOne({ _id: recipientId, role: 'caterer' });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found or is not a caterer' });
    }
    
    // Set up the message object
    const messageData = {
      recipient: recipientId,
      content,
      senderName: senderName || 'Anonymous',
      senderEmail: senderEmail || 'anonymous@example.com',
      senderPhone: senderPhone || ''
    };
    
    // If user is logged in (has token)
    if (req.user) {
      messageData.sender = req.user.id;
      messageData.senderType = req.user.role;
    } else {
      // For non-registered users
      messageData.sender = senderEmail;
      messageData.senderType = 'visitor';
    }
    
    const message = new Message(messageData);
    await message.save();
    
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all messages received by a caterer (requires auth)
router.get('/received', auth, async (req, res) => {
  try {
    // Only caterers can access their received messages
    if (req.user.role !== 'caterer') {
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
    
    // For registered users as sender
    let receiverId = originalMessage.sender;
    let receiverType = originalMessage.senderType;
    
    // Create the reply message
    const reply = new Message({
      sender: req.user.id,
      senderType: 'caterer',
      senderName: req.user.username,
      senderEmail: req.user.email,
      senderPhone: req.user.phone || '',
      recipient: receiverId,
      content,
      // Reference to original message
      originalMessage: originalMessage._id
    });
    
    await reply.save();
    
    res.status(201).json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;