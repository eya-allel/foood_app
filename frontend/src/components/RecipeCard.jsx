import React from "react";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiTag,
  FiHeart,
  FiShoppingCart,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const RecipeCard = ({
  recipe,
  onDelete,
  onEdit,
  isMyRecipesPage,
  onAddFavorite,
  onRemoveFavorite,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  const handleViewDetails = () => {
    navigate(`/my-recipes/${recipe._id}`);
  };

  const handleAddToCart = () => {
    addToCart(recipe._id);
  };

  const creatorName =
    recipe.createdBy?.businessName ||
    recipe.createdBy?.username ||
    currentUser?.username ||
    "Unknown";

  const isOwner =
    currentUser &&
    recipe.createdBy &&
    (recipe.createdBy._id || recipe.createdBy) === currentUser._id;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        <img
          src={recipe.image || "https://placehold.co/300x200?text=No+Image"}
          alt={recipe.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/300x200?text=No+Image";
          }}
        />
        {recipe.category && recipe.category !== "Uncategorized" && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <FiTag className="mr-1" size={12} />
            {recipe.category}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{recipe.name}</h3>
          <h3 className="text-xl font-semibold text-gray-800">
            {recipe.price} TD
          </h3>
        </div>
        <p className="text-gray-600 mb-1 italic text-sm text-gray-500">
          Created by: {creatorName}
        </p>
        <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>

        <div className="flex justify-between items-center">
          <button
            onClick={handleViewDetails}
            className="flex items-center text-amber-600 hover:text-amber-800 transition-colors duration-300"
          >
            <FiEye className="mr-1" /> Détails
          </button>
          <div className="flex space-x-3">
            {isMyRecipesPage || isOwner ? (
              <>
                <button
                  onClick={onEdit}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                  title="Modifier cette recette"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(recipe._id)}
                  className="text-red-600 hover:text-red-800 transition-colors duration-300"
                  title="Supprimer cette recette"
                >
                  <FiTrash2 size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="text-pink-600 hover:text-pink-800 transition-colors duration-300"
                  title="Ajouter aux favoris"
                  onClick={() => onAddFavorite && onAddFavorite(recipe._id)}
                >
                  <FiHeart size={18} />
                </button>
                <button
                  className="text-green-600 hover:text-green-800 transition-colors duration-300"
                  title="Commander"
                  onClick={handleAddToCart}
                >
                  <FiShoppingCart size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
