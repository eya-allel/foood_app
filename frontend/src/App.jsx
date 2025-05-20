import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import SignIn from "./pages/auth/SignIn";
import CatererSignUp from "./pages/auth/CatererSignUp";
import UserSignUp from "./pages/auth/UserSignUp";
import MyRecipes from "./pages/MyRecipes";
import RecipeDetail from "./pages/RecipeDetail";
import EditRecipe from "./pages/EditRecipe";
import Recipes from "./pages/Recipes";
import Favorites from "./pages/Favorites";
import Cart from "./pages/Cart.jsx";
import CheckOut from "./pages/CheckOut.jsx";
import Caterers from "./pages/Caterers";
import CatererRecipes from "./pages/CatererRecipes";
import CatererProfile from "./pages/CatererProfile"; // Modifié pour utiliser CatererProfile au lieu de MessagePage
import MessagesList from "./pages/MessagesList";
import CatererOrders from "./pages/CatererOrders";
import UserOrders from "./pages/UserOrders";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div>
          <Navbar />
          <Routes>
            {/* Redirect root to recipes page */}
            <Route path="/" element={<Navigate to="/recipes" replace />} />
            
            {/* Public routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup/caterer" element={<CatererSignUp />} />
            <Route path="/signup/user" element={<UserSignUp />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/caterers" element={<Caterers />} />
            
            {/* Anciennes routes */}
            <Route path="/caterers/:id/recipes" element={<CatererRecipes />} />
            
            {/* Route pour le profil traiteur avec formulaire de message */}
            <Route path="/caterers/:id" element={<CatererProfile />} />
            
            {/* Route pour la liste des messages des traiteurs */}
            <Route path="/messages" element={<MessagesList />} />
            
            {/* Cart is visible to all but checkout requires auth */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkOut" element={<CheckOut />} />
            
            {/* User protected routes */}
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/user-orders" element={<UserOrders />} />
            
            {/* Caterer protected routes */}
            <Route path="/my-recipes" element={<MyRecipes />} />
            <Route path="/my-recipes/edit/:id" element={<EditRecipe />} />
            <Route path="/my-recipes/:id" element={<RecipeDetail />} />
            <Route path="/caterer-orders" element={<CatererOrders />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;