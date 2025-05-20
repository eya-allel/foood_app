
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState({});
  const [recipes, setRecipes] = useState([]);
  const delivery_fee = 7;

  const { currentUser } = useAuth();

  // Initialize cart based on authentication status
  useEffect(() => {
    // Load cart from localStorage first
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      try {
        setCartItems(JSON.parse(localCart));
      } catch (e) {
        console.error("Error parsing local cart:", e);
        localStorage.removeItem('cart');
      }
    }
    
    // If user is logged in, fetch cart from server and merge with local
    if (currentUser) {
      fetchCart();
    }
  }, [currentUser]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(cartItems).length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchCart = async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.post("/cart/get");
      const serverCart = response.data.cartData || {};
      
      // Merge with existing local cart if needed
      const mergedCart = { ...cartItems, ...serverCart };
      setCartItems(mergedCart);
      
      // Sync the merged cart to the server
      if (Object.keys(cartItems).length > 0 && currentUser) {
        // Only sync if local cart had items
        syncCartToServer(mergedCart);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const syncCartToServer = async (cart) => {
    try {
      // For each item in the local cart, add it to the server
      for (const [itemId, quantity] of Object.entries(cart)) {
        await api.post("/cart/update", { itemId, quantity });
      }
    } catch (error) {
      console.error("Failed to sync cart to server:", error);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await api.get("/recipes/");
      console.log("Fetched recipes for cart:", response.data);
      setRecipes(response.data || []);
    } catch (error) {
      console.error("Error fetching recipes in cart context:", error);
      setRecipes([]);
    }
  };
  
  const addToCart = async (itemId) => {
    // Update local state optimistically
    const updated = {
      ...cartItems,
      [itemId]: (cartItems[itemId] || 0) + 1,
    };
    setCartItems(updated);
    
    // If user is logged in, sync with server
    if (currentUser) {
      try {
        await api.post("/cart/add", { itemId });
        return true;
      } catch (error) {
        console.error("Failed to add to cart on server:", error);
        return false;
      }
    }
    
    return true;
  };

  const updateItemQuantity = async (itemId, quantity) => {
    // Update local state optimistically
    const updated = { ...cartItems };
    if (quantity <= 0) {
      delete updated[itemId];
    } else {
      updated[itemId] = quantity;
    }
    setCartItems(updated);
    
    // If user is logged in, sync with server
    if (currentUser) {
      try {
        await api.post("/cart/update", { itemId, quantity });
        return true;
      } catch (error) {
        console.error("Failed to update cart on server:", error);
        return false;
      }
    }
    
    return true;
  };

  const clearCart = async () => {
    setCartItems({});
    localStorage.removeItem('cart');
    
    if (currentUser) {
      try {
        await api.post("/cart/clear");
      } catch (error) {
        console.error("Failed to clear cart on server:", error);
      }
    }
  };

  const getCartCount = () => {
    return Object.values(cartItems).reduce((acc, val) => acc + val, 0);
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = recipes.find((r) => r._id === itemId);
      if (!itemInfo) continue;
      totalAmount += itemInfo.price * cartItems[itemId];
    }
    return totalAmount;
  };

  const getCartDetails = () => {
    const items = [];
    for (const itemId in cartItems) {
      const recipe = recipes.find((r) => r._id === itemId);
      if (recipe) {
        items.push({
          id: itemId,
          name: recipe.name,
          price: recipe.price,
          quantity: cartItems[itemId],
          category: recipe.category,
          total: recipe.price * cartItems[itemId]
        });
      }
    }
    return items;
  };

  const value = {
    cartItems,
    setCartItems,
    addToCart,
    updateItemQuantity,
    getCartCount,
    getCartAmount,
    getCartDetails,
    recipes,
    delivery_fee,
    fetchCart,
    clearCart,
    isCartEmpty: Object.keys(cartItems).length === 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export default CartContext;