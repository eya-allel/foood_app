import React, { useState, useEffect } from 'react';
import { FiPlus, FiFilter } from 'react-icons/fi';
import RecipeCard from '../components/RecipeCard';
import RecipeForm from '../components/RecipeForm';
import { fetchMyRecipes, fetchRecipesByCategory, fetchRecipesByCaterer, deleteRecipe, createRecipe, updateRecipe } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const { currentUser } = useAuth();

  // Catégories de recettes disponibles
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

  useEffect(() => {
    // Ne récupérer les recettes que si l'utilisateur est un traiteur
    if (currentUser && currentUser.role === 'caterer') {
      if (categoryFilter === 'All') {
        loadCatererRecipes();
      } else {
        loadRecipesByCategory(categoryFilter);
      }
    } else {
      setIsLoading(false);
    }
  }, [currentUser, categoryFilter]);

  const loadCatererRecipes = async () => {
    try {
      setIsLoading(true);
      console.log('Getting caterer recipes for user:', currentUser?.id);
      const response = await fetchRecipesByCaterer(currentUser?._id);
      console.log('API response for caterer recipes:', response);
      
      if (response && response.data) {
        setRecipes(response.data);
      } else {
        setRecipes([]);
      }
      setError(null);
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Error loading caterer recipes:', err.response.data);
        setError(err.response.data.message || 'Error loading caterer recipes. Try again.');
      } else {
        console.error('Error loading caterer recipes:', err);
        setError('Error loading caterer recipes. Try again.');
      }
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setIsLoading(true);
      console.log('Getting all recipes for user:', currentUser?.id);
      const response = await fetchMyRecipes();
      console.log('API response for all recipes:', response);
      
      // Définir les recettes directement à partir des données de réponse
      if (response && response.data) {
        setRecipes(response.data);
      } else {
        setRecipes([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError('Error loading recipes. Try again.');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction améliorée pour charger les recettes par catégorie
  const loadRecipesByCategory = async (category) => {
    try {
      setIsLoading(true);
      console.log(`Getting recipes for category: ${category}`);
      
      // Vérifier l'URL avant la requête
      console.log(`Category url: /recipes/category/${encodeURIComponent(category)}`);
      
      const response = await fetchRecipesByCategory(category);
      console.log('API response for category recipes:', response);
      
      // Définir les recettes directement à partir des données de réponse
      if (response && response.data) {
        setRecipes(response.data);
      } else {
        setRecipes([]);
      }
      setError(null);
    } catch (err) {
      console.error(`Error loading recipes for category ${category}:`, err);
      setError('Error loading recipes by category. Try again.');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
    // L'useEffect gérera le chargement en fonction de la catégorie
  };

  const handleAddRecipe = async (recipeData) => {
    try {
      console.log('Recipe data submission:', recipeData);
      const response = await createRecipe(recipeData);
      console.log('Recipe creation response:', response);
      
      // Actualiser la liste des recettes en fonction du filtre de catégorie actuel
      if (categoryFilter === 'All') {
        await loadRecipes();
      } else if (categoryFilter === recipeData.category) {
        await loadRecipesByCategory(categoryFilter);
      } else {
        // Si la recette est d'une catégorie différente, passer à toutes les recettes
        setCategoryFilter('All');
        // loadRecipes sera appelé via useEffect en raison du changement de categoryFilter
      }
      
      setIsAddFormOpen(false);
    } catch (err) {
      console.error('Error while adding recipe details:', err);
      setError('Error adding recipe. Try again.');
    }
  };

  const handleEditClick = (recipe) => {
    setCurrentRecipe(recipe);
    setIsEditFormOpen(true);
  };

  const handleUpdateRecipe = async (updatedData) => {
    try {
      console.log('Recipe details update:', updatedData);
      const response = await updateRecipe(currentRecipe._id, updatedData);
      console.log('Recipe details update response:', response);
      
      // Actualiser la liste des recettes en fonction du filtre de catégorie actuel
      if (categoryFilter === 'All') {
        await loadRecipes();
      } else if (categoryFilter === updatedData.category) {
        await loadRecipesByCategory(categoryFilter);
      } else {
        // Si la catégorie a changé et ne correspond plus au filtre actuel
        setCategoryFilter('All');
        // loadRecipes sera appelé via useEffect en raison du changement de categoryFilter
      }
      
      setIsEditFormOpen(false);
      setCurrentRecipe(null);
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError('Error updating recipe. Try again.');
    }
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm('ÊAre you sure you want to delete this recipe ?')) {
      try {
        await deleteRecipe(id);
        
        // Actualiser la liste des recettes en fonction du filtre de catégorie actuel
        if (categoryFilter === 'All') {
          await loadRecipes();
        } else {
          await loadRecipesByCategory(categoryFilter);
        }
      } catch (err) {
        setError('Error deleting recipe. Try again.');
        console.error('Error deleting recipe:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse text-xl text-gray-600">Loading recipes...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'caterer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-amber-100 border border-amber-400 text-amber-700 px-4 py-3 rounded mb-4">
          Only caterers can access and control recipes.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">My recipes</h1>
        {currentUser.role === 'caterer' && (
          <button
            onClick={() => setIsAddFormOpen(true)}
            className="flex items-center bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-300"
          >
            <FiPlus className="mr-2" /> Add a recipe
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtre de catégorie */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <FiFilter className="mr-2 text-amber-600" />
          <span className="font-medium text-gray-700">Filtrer by category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
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

      {/* Afficher les recettes ou l'état vide */}
      {Array.isArray(recipes) && recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <RecipeCard 
              key={recipe._id} 
              recipe={recipe} 
              onDelete={handleDeleteRecipe}
              onEdit={() => handleEditClick(recipe)}
              isMyRecipesPage={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {categoryFilter !== 'All' ? (
            <p className="text-gray-600 mb-4">No recipe found for this category "{categoryFilter}".</p>
          ) : (
            <p className="text-gray-600 mb-4">You still have not added recipes.</p>
          )}
          <button
            onClick={() => setIsAddFormOpen(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors duration-300"
          >
            Add your first recipe
          </button>
        </div>
      )}

      {isAddFormOpen && (
        <RecipeForm 
          onSubmit={handleAddRecipe} 
          onCancel={() => setIsAddFormOpen(false)} 
        />
      )}

      {isEditFormOpen && currentRecipe && (
        <RecipeForm 
          initialData={currentRecipe}
          onSubmit={handleUpdateRecipe} 
          onCancel={() => {
            setIsEditFormOpen(false);
            setCurrentRecipe(null);
          }}
        />
      )}
    </div>
  );
}