import { Link, useNavigate } from 'react-router-dom';
import { FiPhone, FiLock } from 'react-icons/fi';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SignIn() {
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(formData.phone, formData.password);
      navigate('/recipes'); // Redirect to home page after successful login
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        <button 
          type="submit" 
          className="w-full bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-4 text-center space-y-2">
        <Link to="/signup/user" className="block text-blue-500 hover:underline">
          Create a User Account
        </Link>
        <Link to="/signup/caterer" className="block text-amber-600 hover:underline">
          Become a Caterer
        </Link>
      </div>
    </div>
  );
}