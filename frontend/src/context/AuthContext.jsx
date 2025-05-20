import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // Le token sera automatiquement attaché par api.js
      const response = await api.get('/auth/me');
      setCurrentUser(response.data);
      setAuthError(null);
    } catch (error) {
      console.error('Échec de la vérification d\'authentification:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        // Ne pas effacer le panier en cas d'échec d'authentification
        // localStorage.removeItem('cart'); 
        setCurrentUser(null);
        setAuthError('Session expirée. Veuillez vous reconnecter.');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      const response = await api.post('/auth/login', { phone, password });

      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      setCurrentUser(user);
      setAuthError(null);
      return user;
    } catch (error) {
      console.error('Échec de connexion:', error);
      setAuthError(
        error.response?.data?.message || 'Échec de connexion. Veuillez vérifier vos identifiants.'
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Échec de l\'appel API de déconnexion:', error);
    } finally {
      localStorage.removeItem('authToken');
      // Ne pas effacer le panier lors de la déconnexion
      // localStorage.removeItem('cart');
      setCurrentUser(null);
    }
  };

  const register = async (userData, role) => {
    try {
      // Inclure le rôle dans les données utilisateur
      const dataToSend = { ...userData, role };
      
      console.log('Envoi des données d\'inscription:', dataToSend);
      
      const response = await api.post('/auth/register', dataToSend);
      
      console.log('Réponse d\'inscription:', response.data);
      
      // Extraire l'utilisateur et le token de la réponse
      const { user, token } = response.data;
      
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      setCurrentUser(user);
      setAuthError(null);
      return user;
    } catch (error) {
      console.error('Échec d\'inscription:', error);
      setAuthError(
        error.response?.data?.message || 'Échec d\'inscription. Veuillez réessayer.'
      );
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    login,
    logout,
    register,
    checkAuthStatus,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isCaterer: currentUser?.role === 'caterer'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;