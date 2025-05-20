import React, { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../utils/api";
import { toast } from "react-toastify";
import api from "../utils/api";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    setCartItems,
    delivery_fee,
    recipes,
  } = useContext(CartContext);

  const [method, setMethod] = useState("cod");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const [fetchedRecipes, setFetchedRecipes] = useState({});
  const cartIsEmpty = Object.keys(cartItems).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getRecipeById = (id) =>
    recipes.find((r) => r._id === id) || fetchedRecipes[id];

  // Fetch missing recipes
  useEffect(() => {
    const fetchMissing = async () => {
      for (const id of Object.keys(cartItems)) {
        const alreadyLoaded = recipes.find((r) => r._id === id) || fetchedRecipes[id];
        if (!alreadyLoaded) {
          try {
            const res = await api.get(`/recipes/${id}`);
            setFetchedRecipes((prev) => ({
              ...prev,
              [id]: res.data.data,
            }));
          } catch (e) {
            console.error(`Could not fetch recipe with ID ${id}:`, e);
          }
        }
      }
    };
    fetchMissing();
  }, [cartItems, recipes, fetchedRecipes]);

  const allRecipes = [...recipes, ...Object.values(fetchedRecipes)];

  const subtotal = Object.entries(cartItems).reduce((total, [id, quantity]) => {
    const recipe = allRecipes.find((r) => r._id === id);
    if (!recipe) return total;
    const price = Number(recipe.price);
    const qty = Number(quantity);
    return total + price * qty;
  }, 0);

  const deliveryFee = cartIsEmpty ? 0 : delivery_fee;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderItems = Object.entries(cartItems).map(([id, qty]) => ({
      recipeId: id,
      quantity: qty,
    }));

    const orderData = {
      address: formData,
      method,
      items: orderItems,
      totalAmount: total,
    };

    console.log("Order data to be sent:", orderData);

    try {
      const res = await placeOrder(orderData);

      if (res.data.success) {
        // Show an alert when the order is placed
        alert('Commande faite!');
        setCartItems({});
        // Redirect to recipes page instead of orders
        navigate("/recipes");
      } else {
        toast.error(res.data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col lg:flex-row gap-8 p-8 max-w-6xl mx-auto"
    >
      {/* Left: Delivery Form */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">Delivery Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required className="border p-2 rounded" />
          <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required className="border p-2 rounded" />
        </div>

        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" required className="border p-2 rounded w-full mt-4" />
        <input name="street" value={formData.street} onChange={handleChange} placeholder="Street" required className="border p-2 rounded w-full mt-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <input name="city" value={formData.city} onChange={handleChange} placeholder="City" required className="border p-2 rounded" />
          <input name="state" value={formData.state} onChange={handleChange} placeholder="State" required className="border p-2 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <input name="zipcode" value={formData.zipcode} onChange={handleChange} placeholder="Zip Code" type="number" required className="border p-2 rounded" />
          <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" required className="border p-2 rounded" />
        </div>

        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" type="tel" required className="border p-2 rounded w-full mt-4" />

        {/* Payment Method */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="cod"
              value="cod"
              checked={method === "cod"}
              onChange={() => setMethod("cod")}
              className="accent-orange-500"
            />
            <label htmlFor="cod" className="text-gray-700">Cash on Delivery</label>
          </div>
        </div>

        <button type="submit" className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded w-full">
          Place Order
        </button>
      </div>

      {/* Right: Order Summary */}
      <div className="w-full lg:w-96 bg-gray-50 p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        {cartIsEmpty ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(cartItems).map(([id, quantity]) => {
              const recipe = getRecipeById(id);
              if (!recipe) return null;

              return (
                <div key={id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{recipe.name}</p>
                    <p className="text-sm text-gray-500">{quantity} × {recipe.price} TD</p>
                  </div>
                  <div className="text-sm font-semibold">
                    {(recipe.price * quantity).toFixed(2)} TD
                  </div>
                </div>
              );
            })}
            <hr />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} TD</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{deliveryFee.toFixed(2)} TD</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span>{total.toFixed(2)} TD</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}