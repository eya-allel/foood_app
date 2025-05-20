import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReceivedMessages, markMessageAsRead } from '../utils/api';

const MessagesList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est un traiteur
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'caterer') {
      navigate('/');
      return;
    }

    fetchMessages();
  }, [currentUser, navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await getReceivedMessages();
      console.log('Messages récupérés:', response.data);
      setMessages(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des messages:', err);
      setError('Impossible de charger vos messages pour le moment. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);

    // Marquer comme lu s'il ne l'est pas déjà
    if (!message.read) {
      try {
        await markMessageAsRead(message._id);
        
        // Mettre à jour l'état des messages
        setMessages(messages.map(msg => 
          msg._id === message._id ? { ...msg, read: true } : msg
        ));
      } catch (err) {
        console.error('Erreur lors du marquage du message comme lu:', err);
      }
    }
  };

  // Si en cours de chargement
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Chargement de vos messages...</div>
      </div>
    );
  }

  // Si une erreur s'est produite
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchMessages}
          className="text-blue-500 hover:underline"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Centre de messages</h1>
      
      {messages.length === 0 ? (
        <div className="bg-gray-100 text-center py-8 rounded">
          <p className="text-gray-600">Vous n'avez pas encore de messages.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Liste des messages */}
          <div className="md:w-1/3">
            <h2 className="text-xl font-semibold mb-3">Boîte de réception</h2>
            <div className="bg-white rounded shadow-sm divide-y overflow-hidden">
              {messages.map(message => (
                <div 
                  key={message._id}
                  onClick={() => handleSelectMessage(message)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50
                            ${selectedMessage?._id === message._id ? 'bg-amber-50' : ''}
                            ${!message.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between mb-1">
                    <div className="font-medium">
                      {message.senderName}
                    </div>
                    {!message.read && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Nouveau
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 text-gray-700 truncate">
                    {message.content.substring(0, 60)}
                    {message.content.length > 60 ? '...' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Détail du message */}
          <div className="md:w-2/3">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <h2 className="text-xl font-semibold">
                      De: {selectedMessage.senderName}
                    </h2>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col text-sm text-gray-600 mb-4">
                    <div>Email: {selectedMessage.senderEmail}</div>
                    {selectedMessage.senderPhone && <div>Téléphone: {selectedMessage.senderPhone}</div>}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap my-4">
                    {selectedMessage.content}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <p className="text-gray-600">Sélectionnez un message pour afficher les détails</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesList;