import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../utils/api';
import MessageForm from '../components/MessageForm';

const CatererProfile = () => {
  const { id } = useParams();
  const [caterer, setCaterer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaterer = async () => {
      try {
        console.log("Récupération de l'utilisateur avec l'ID:", id);
        const response = await getUserById(id);
        console.log("Données utilisateur:", response.data);
        setCaterer(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération du traiteur:', err);
        setError('Impossible de charger les informations du traiteur');
        setLoading(false);
      }
    };

    fetchCaterer();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Chargement des informations du traiteur...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/caterers')}
          className="text-blue-500 hover:underline"
        >
          Retour à la liste des traiteurs
        </button>
      </div>
    );
  }

  if (!caterer) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Traiteur non trouvé
        </div>
        <button 
          onClick={() => navigate('/caterers')}
          className="text-blue-500 hover:underline"
        >
          Retour à la liste des traiteurs
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-2">{caterer.username}</h1>
        {caterer.businessName && (
          <h2 className="text-xl text-amber-600 mb-4">{caterer.businessName}</h2>
        )}
        
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Contacter {caterer.username}</h3>
          <MessageForm recipientId={id} recipientName={caterer.username} />
        </div>
      </div>
    </div>
  );
};

export default CatererProfile;