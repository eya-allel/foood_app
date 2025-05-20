import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

export default function RecipeForm({ onSubmit, onCancel, initialData = {} }) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    ingredients: initialData.ingredients || [''],
    category: initialData.category || 'Uncategorized',
    image: initialData.image || '',
    price: initialData.price || 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(initialData.image || '');

  // Available recipe categories
  const categories = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Compress the image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Set maximum dimensions
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const compressedImage = canvas.toDataURL('image/jpeg', 0.6); // Lower quality for smaller size
        console.log('Original image size:', reader.result.length);
        console.log('Compressed image size:', compressedImage.length);
        
        setPreviewImage(compressedImage);
        setFormData(prev => ({ ...prev, image: compressedImage }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Filter out empty ingredients
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== '')
      };
      
      // Log size of the payload for debugging
      console.log('Payload size:', JSON.stringify(cleanedData).length, 'bytes');
      
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {initialData._id ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
            <button 
              type="button"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">Recipe Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter recipe name"
            />
          </div>
          
          {/* Category Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Describe your recipe"
            ></textarea>
          </div>
          
          {/* Ingredients Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Ingredients</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter ingredient"
                />
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 text-amber-600 hover:text-amber-700 flex items-center"
            >
              + Add Another Ingredient
            </button>
          </div>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Recipe Image</label>
            <div className="text-sm text-gray-500 mb-2">
              Please select a small image (under 5MB). Large images will be automatically compressed.
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            {previewImage && (
              <div className="mt-2">
                <img 
                  src={previewImage} 
                  alt="Recipe preview" 
                  className="w-full max-h-40 object-cover rounded-md"
                />
              </div>
            )}
          </div>
          {/* Price Input */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">Recipe Price</label>
            <input
              id="price"
              name="price"
              type="text"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter recipe name"
            />
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Saving...' : initialData._id ? 'Update Recipe' : 'Save Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}