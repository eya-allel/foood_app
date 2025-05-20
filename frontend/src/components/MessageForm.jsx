import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendMessage } from '../utils/api';

const MessageForm = ({ recipientId, recipientName }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    content: '',
    senderName: '',
    senderEmail: '',
    senderPhone: ''
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      console.log('Sending message to:', recipientId);
      
      // Préparer les données du message
      const messageData = {
        recipientId,
        content: formData.content,
        // Utiliser les informations de l'utilisateur connecté s'il existe
        senderName: currentUser ? currentUser.username : formData.senderName,
        senderEmail: currentUser ? currentUser.email : formData.senderEmail,
        senderPhone: formData.senderPhone || ''
      };
      
      console.log('Message data being sent:', messageData);
      
      // Envoyer le message (api.js s'occupera de router vers la bonne endpoint)
      await sendMessage(messageData);

      // Réinitialiser le formulaire après succès
      setSuccess(true);
      setFormData({
        content: '',
        senderName: '',
        senderEmail: '',
        senderPhone: ''
      });
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Afficher un message d'erreur détaillé si disponible
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Échec de l'envoi: ${err.response.data.message}`);
      } else {
        setError('Échec de l\'envoi du message. Veuillez réessayer plus tard.');
      }
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setError(null);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="text-green-700 mb-3">
          Votre message a été envoyé à {recipientName} avec succès!
        </div>
        <button
          onClick={resetForm}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded transition"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Champs pour visiteurs non connectés */}
      {!currentUser && (
        <>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Votre nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="senderName"
              value={formData.senderName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Votre email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="senderEmail"
              value={formData.senderEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Votre téléphone (optionnel)
            </label>
            <input
              type="tel"
              name="senderPhone"
              value={formData.senderPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </>
      )}

      {/* Champ de message (pour tous) */}
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">
          Votre message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows="5"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
          required
          placeholder={`Écrivez votre message à ${recipientName} ici...`}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={sending}
        className={`px-4 py-2 rounded font-medium text-white transition
                  ${sending 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-amber-500 hover:bg-amber-600'}`}
      >
        {sending ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  );
};

export default MessageForm;