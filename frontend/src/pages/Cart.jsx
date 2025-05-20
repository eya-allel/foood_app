import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

function CartContent() {
  const { isAuthenticated } = useAuth();
  const { cartItems, recipes = [], getCartAmount, updateItemQuantity, clearCart, isCartEmpty } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    updateItemQuantity(itemId, newQuantity);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">Please log in to view your cart.</p>
        <Link to="/signin" className="text-blue-500 hover:underline">Sign In</Link>
      </div>
    );
  }

  if (isCartEmpty) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">Your cart is empty</p>
        <Link to="/recipes" className="text-blue-500 hover:underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {Object.entries(cartItems).map(([itemId, quantity]) => {
          const item = recipes.find(r => r._id === itemId);
          if (!item) {
            console.warn(`Recipe not found for itemId: ${itemId}`);
            return null;
          }
          return (
            <div key={itemId} className="flex border rounded p-4 items-center">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded mr-4" />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
                <div className="flex items-center mt-2">
                  <label htmlFor={`quantity-${itemId}`} className="mr-2">Quantity:</label>
                  <input
                    id={`quantity-${itemId}`}
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value, 10);
                      if (newQuantity > 0) {
                        handleQuantityChange(itemId, newQuantity);
                      }
                    }}
                    className="w-16 border rounded px-2 py-1"
                  />
                </div>
              </div>
              <button
                onClick={() => handleQuantityChange(itemId, 0)}
                className="ml-4 text-red-600 hover:text-red-800"
                title="Remove item"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between mb-4">
          <span className="font-bold">Total:</span>
          <span className="font-bold">${getCartAmount().toFixed(2)}</span>
        </div>

        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  return (
    <ErrorBoundary>
      <CartContent />
    </ErrorBoundary>
  );
}
