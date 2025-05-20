import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/RecipeCard';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'All',
    'Uncategorized',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Appetizers',
    'Soups',
    'Salads',
    'Main Dishes',
    'Side Dishes',
    'Desserts',
    'Snacks',
    'Drinks'
  ];

  // Fonction pour charger les recettes
  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // URL de base de l'API
      const baseUrl = 'http://localhost:3000/api'; // Assurez-vous que le port est correct
      let url = `${baseUrl}/recipes`;
      
      if (categoryFilter !== 'All') {
        url = `${baseUrl}/recipes/category/${categoryFilter}`;
      }
      
      console.log('Fetching recipes from:', url);
      
      const response = await axios.get(url);
      console.log('API Response:', response);
      
      // Traiter les données de réponse selon leur format
      if (Array.isArray(response.data)) {
        setRecipes(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setRecipes(response.data.data);
      } else {
        console.warn('Format de réponse inattendu:', response.data);
        setRecipes([]);
      }
    } catch (err) {
      console.error('Failed to load recipes:', err);
      
      const errorMessage = err.response 
        ? `Error ${err.response.status}: ${err.response.data?.message || 'Unknown error'}`
        : 'Network error: Failed to connect to the server';
      
      console.error(errorMessage);
      setError('Failed to load recipes. Please try again.');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les recettes quand categoryFilter change
  useEffect(() => {
    loadRecipes();
  }, [categoryFilter]);

  // Gérer l'ajout aux favoris
  const handleAddFavorite = async (id) => {
    if (!currentUser) {
      alert('Please sign in to add recipes to your favorites');
      navigate('/signin');
      return;
    }
    
    try {
      const baseUrl = 'http://localhost:3000/api';
      const url = `${baseUrl}/favorites/add`;
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please sign in to add recipes to your favorites');
        navigate('/signin');
        return;
      }
      
      await axios.post(url, { recipeId: id }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Recipe added to favorites');
    } catch (error) {
      console.error('Failed to add favorite:', error);
      if (error.response && error.response.status === 401) {
        alert('Please sign in to add recipes to your favorites');
        navigate('/signin');
      } else {
        alert('Failed to add favorite. Please try again.');
      }
    }
  };

  // Fonction pour réessayer de charger les recettes
  const handleRetry = () => {
    loadRecipes();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading delicious recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">All Recipes</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center mb-2">
          <span className="font-medium text-gray-700">Filter by category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                categoryFilter === category 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              // Disable edit and delete for non-caterers or non-owners
              onEdit={currentUser?.role === 'caterer' ? () => navigate(`/edit-recipe/${recipe._id}`) : undefined}
              onDelete={currentUser?.role === 'caterer' ? () => {} : undefined}
              isMyRecipesPage={false}
              onAddFavorite={() => handleAddFavorite(recipe._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600 text-xl">No recipes found for this category.</p>
          {categoryFilter !== 'All' && (
            <button 
              onClick={() => setCategoryFilter('All')}
              className="mt-4 bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
            >
              View All Recipes
            </button>
          )}
        </div>
      )}
    </div>
  );
}