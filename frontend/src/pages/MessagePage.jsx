import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MessagePage = () => {
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simuler l'envoi d'un message (sans appel API réel)
    console.log('Message envoyé:', {
      name,
      email,
      phone,
      message
    });
    
    // Simuler un succès
    setMessageSent(true);
    
    // Réinitialiser le formulaire
    setMessage('');
    setName('');
    setEmail('');
    setPhone('');
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Contacter un traiteur</h1>
        
        {messageSent ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Votre message a été envoyé avec succès! Le traiteur vous contactera bientôt.
            <div className="mt-4">
              <button
                onClick={() => setMessageSent(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Envoyer un autre message
              </button>
              <button
                onClick={() => navigate('/caterers')}
                className="ml-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Retour à la liste des traiteurs
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                Votre nom
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Votre email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
                Votre téléphone (optionnel)
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-gray-700 font-medium mb-1">
                Votre message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="5"
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              ></textarea>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
              >
                Envoyer le message
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/caterers')}
                className="text-blue-500 hover:underline"
              >
                Retour à la liste des traiteurs
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MessagePage;