
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiMaximize,
  FiX,
  FiClock,
  FiList,
  FiTag,
} from "react-icons/fi";
import { fetchRecipe, deleteRecipe } from "../utils/api";
import { useCart } from "../context/CartContext";

export default function RecipeDetail() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        setLoading(true);
        const response = await fetchRecipe(id);
        setRecipe(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load recipe details.");
        console.error("Error loading recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteRecipe(id);
        navigate("/my-recipes");
      } catch (err) {
        setError("Failed to delete recipe. Please try again.");
        console.error("Error deleting recipe:", err);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/my-recipes/edit/${id}`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  console.log(recipe);

  const handleAddToCart = () => {
    addToCart(recipe._id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-pulse text-xl text-gray-600">
          Loading recipe...
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Recipe not found"}
        </div>
        <button
          onClick={() => navigate("/my-recipes")}
          className="mt-4 flex items-center text-amber-600 hover:text-amber-800"
        >
          <FiArrowLeft className="mr-2" /> Back to My Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate("/my-recipes")}
        className="mb-6 flex items-center text-amber-600 hover:text-amber-800 transition-colors duration-300"
      >
        <FiArrowLeft className="mr-2" /> Back to My Recipes
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
        {/* Image container with loading skeleton */}
        <div className="relative w-full h-96 bg-gray-100 overflow-hidden">
          {!imageLoaded && recipe.image && (
            <div className="absolute inset-0 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {recipe.image ? (
            <>
              <img
                src={recipe.image}
                alt={recipe.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={handleImageLoad}
              />
              <button
                onClick={() => setShowFullImage(true)}
                className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-300 flex items-center"
                title="View full image"
              >
                <FiMaximize size={20} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-lg">No image available</span>
            </div>
          )}
        </div>

        {/* Recipe content */}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 transition-colors duration-300">
                {recipe.name}
              </h1>
              <h4 className="text-2xl font-bold text-gray-800 transition-colors duration-300">
                {recipe.price} TD
              </h4>
              {recipe.category && (
                <div className="mt-2 flex items-center">
                  <FiTag className="text-amber-500 mr-1" />
                  <span className="text-amber-600 font-medium">
                    {recipe.category}
                  </span>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-all duration-300"
                title="Edit recipe"
              >
                <FiEdit2 size={22} />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-all duration-300"
                title="Delete recipe"
              >
                <FiTrash2 size={22} />
              </button>
            </div>
          </div>

          {/* Description section with styled heading */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-amber-500 rounded-full mr-2"></div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Description
              </h2>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-400">
              <p className="text-gray-700 leading-relaxed">
                {recipe.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Ingredients section with styled heading */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-amber-500 rounded-full mr-2"></div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Ingredients
              </h2>
              <FiList className="ml-2 text-amber-500" size={20} />
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mt-2 mr-2 flex-shrink-0"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No ingredients listed.</p>
              )}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleAddToCart}
                className="px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-300 bg-amber-500 hover:bg-amber-600 cursor-pointer">
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full screen image modal */}
      {showFullImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={() => setShowFullImage(false)}
          ></div>
          <div className="relative max-w-5xl max-h-[90vh] w-full z-10 animate-fadeIn">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="max-w-full max-h-[90vh] object-contain mx-auto rounded-lg shadow-2xl transform scale-100 hover:scale-105 transition-transform duration-300"
            />
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-2 right-2 bg-white text-black rounded-full p-3 shadow-lg hover:bg-gray-200 transition-colors duration-300"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
