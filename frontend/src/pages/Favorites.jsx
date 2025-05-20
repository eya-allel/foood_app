import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import { fetchFavorites, removeFavorite } from '../utils/favoriteApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFavorites = async () => {
      // Vérifier si l'utilisateur est connecté
      if (!currentUser) {
        setIsLoading(false);
        setError('Please sign in to view your favorites');
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetchFavorites();
        if (response && response.data && response.data.data) {
          setFavorites(response.data.data);
        } else if (response && response.data) {
          setFavorites(response.data);
        } else {
          setFavorites([]);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load favorite recipes:', err);
        
        if (err.response && err.response.status === 401) {
          // Si non autorisé, rediriger vers la connexion
          setError('Please sign in to view your favorites');
          setTimeout(() => {
            navigate('/signin');
          }, 2000);
        } else {
          setError('Failed to load favorite recipes. Please try again.');
        }
        
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [currentUser, navigate]);

  const handleRemoveFavorite = async (id) => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    
    try {
      await removeFavorite(id);
      setFavorites((prev) => prev.filter((recipe) => recipe._id !== id));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      if (err.response && err.response.status === 401) {
        alert('Your session has expired. Please sign in again.');
        navigate('/signin');
      } else {
        alert('Failed to remove favorite. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-6 rounded mb-4 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
          <p>Please sign in to view your favorite recipes.</p>
          <button 
            onClick={() => navigate('/signin')}
            className="mt-4 bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">My Favorite Recipes</h1>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onDelete={() => handleRemoveFavorite(recipe._id)}
              isMyRecipesPage={false}
              isFavoritePage={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 text-xl">You have no favorite recipes yet.</p>
          <button 
            onClick={() => navigate('/recipes')}
            className="mt-4 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
          >
            Browse Recipes
          </button>
        </div>
      )}
    </div>
  );
}