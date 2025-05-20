import axios from 'axios';

// Make sure this URL matches your server configuration
const API_URL = 'http://localhost:3000/api';

// Base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Add a timeout to avoid suspended requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to each request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Debug log (in development only)
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Log detailed error information
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Simple functions
export const fetchRecipes = () => api.get('/recipes');
export const fetchMyRecipes = () => api.get('/recipes/my');
export const fetchRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post('/recipes', data);
export const updateRecipe = (id, data) => api.put(`/recipes/${id}`, data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

// Enhanced cart functions for persistence
export const getCart = () => {
  // First try to get from localStorage
  const localCart = localStorage.getItem('cart');
  const localCartData = localCart ? JSON.parse(localCart) : {};
  
  // If user is logged in, also try to get from server and merge
  const token = localStorage.getItem('authToken');
  if (token) {
    return api.get('/cart/get')
      .then(response => {
        const serverCart = response.data.cartData || {};
        const mergedCart = { ...localCartData, ...serverCart };
        
        // Save merged cart back to localStorage
        localStorage.setItem('cart', JSON.stringify(mergedCart));
        
        return mergedCart;
      })
      .catch(error => {
        console.error("Failed to get cart from server:", error);
        return localCartData;
      });
  } else {
    // If not logged in, just return the local cart
    return Promise.resolve(localCartData);
  }
};

export const addToCart = (itemId) => {
  // Get current cart from localStorage
  let cart = {};
  try {
    const localCart = localStorage.getItem('cart');
    cart = localCart ? JSON.parse(localCart) : {};
  } catch (e) {
    console.error("Error parsing local cart:", e);
  }
  
  // Update cart locally
  cart[itemId] = (cart[itemId] || 0) + 1;
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // If logged in, also update on server
  const token = localStorage.getItem('authToken');
  if (token) {
    return api.post('/cart/add', { itemId });
  } else {
    return Promise.resolve({ success: true });
  }
};

export const updateCart = (itemId, quantity) => {
  // Get current cart from localStorage
  let cart = {};
  try {
    const localCart = localStorage.getItem('cart');
    cart = localCart ? JSON.parse(localCart) : {};
  } catch (e) {
    console.error("Error parsing local cart:", e);
  }
  
  // Update or remove item
  if (quantity <= 0) {
    delete cart[itemId];
  } else {
    cart[itemId] = quantity;
  }
  
  // Save back to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // If logged in, also update on server
  const token = localStorage.getItem('authToken');
  if (token) {
    return api.post('/cart/update', { itemId, quantity });
  } else {
    return Promise.resolve({ success: true });
  }
};

export const placeOrder = (orderData) => api.post('/orders/place', orderData);

// Order management functions
export const getCatererOrders = () => api.get('/orders/caterer');
export const getUserOrders = () => api.get('/orders/user');
export const acceptOrder = (orderId, items) => api.post('/orders/accept', { orderId, items });
export const rejectOrder = (orderId, items) => api.post('/orders/reject', { orderId, items });

// Category and caterer functions
export const fetchRecipesByCategory = (category) => {
  console.log(`API Request for category: /recipes/category/${encodeURIComponent(category)}`);
  return api.get(`/recipes/category/${encodeURIComponent(category)}`);
};

export const fetchRecipesByCaterer = (catererId) => {
  console.log(`API Request for caterer: /recipes/caterer/${catererId}`);
  return api.get(`/recipes/caterer/${catererId}`);
};

// Fonction originale qui rencontre des erreurs 404
export const getCatererById = (id) => api.get(`/auth/caterer/${id}`);

// NOUVELLE FONCTION ALTERNATIVE: obtenir un utilisateur par ID sans vérifier le rôle
export const getUserById = (id) => api.get(`/auth/user/${id}`);

// Message system API functions - MISE À JOUR avec les nouveaux chemins
export const sendMessage = (messageData) => api.post('/auth/send-message', messageData);
export const getReceivedMessages = () => api.get('/auth/messages');
export const markMessageAsRead = (messageId) => api.put(`/auth/messages/${messageId}/read`);

export default api;