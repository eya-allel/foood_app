import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';

const CatererRecipes = () => {
  const { id } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get('/recipes/caterer/' + id);
        setRecipes(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch recipes');
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [id]);

  if (loading) return <div className="p-4">Loading recipes...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recipes by Caterer</h1>
      {recipes.length === 0 ? (
        <p>No recipes found for this caterer.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isMyRecipesPage={false}
              onAddFavorite={(id) => console.log("Add to favorites:", id)}
              onRemoveFavorite={(id) => console.log("Remove favorite:", id)}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatererRecipes;
