
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiPhone, FiLock, FiBriefcase, FiMapPin } from 'react-icons/fi';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CatererSignUp() {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    businessName: '',
    businessAddress: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // S'inscrire en tant que traiteur
      await register(formData, 'caterer');
      
      // Pas besoin de se connecter séparément, le token est retourné par register
      // Redirection vers la page d'accueil
      navigate('/');
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(err.response?.data?.message || 'Échec d\'inscription. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Caterer Registration</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center border rounded-lg p-3">
          <FiUser className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="flex-1 outline-none"
            required
          />
        </div>
        
        <div className="flex items-center border rounded-lg p-3">
          <FiPhone className="text-gray-400 mr-2" />
          <input
            type="tel"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="flex-1 outline-none"
            required
          />
        </div>
        
        <div className="flex items-center border rounded-lg p-3">
          <FiLock className="text-gray-400 mr-2" />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="flex-1 outline-none"
            required
          />
        </div>
        
        <div className="flex items-center border rounded-lg p-3">
          <FiBriefcase className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="flex-1 outline-none"
            required
          />
        </div>
        
        <div className="flex items-center border rounded-lg p-3">
          <FiMapPin className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Business Address"
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            className="flex-1 outline-none"
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Become a Caterer'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>Already registered? <Link to="/signin" className="text-amber-600 hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}