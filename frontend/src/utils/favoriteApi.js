import api from './api';

// Get all favorite recipes for the current user
export const fetchFavorites = () => api.get('/favorites');

// Add a recipe to favorites
export const addFavorite = (recipeId) => api.post(`/favorites/${recipeId}`);

// Remove a recipe from favorites
export const removeFavorite = (recipeId) => api.delete(`/favorites/${recipeId}`);
