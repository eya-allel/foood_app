
const Order = require("../models/Order");
const Recipe = require("../models/Recipe");

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { items, address, method, totalAmount } = req.body;

    if (!items?.length) return res.status(400).json({ success: false, message: "Cart is empty." });

    const formattedItems = await Promise.all(
      items.map(async (item) => {
        const recipe = await Recipe.findById(item.recipeId);
        return {
          recipeId: item.recipeId,
          name: recipe?.name || "Unknown",
          image: recipe?.image || "",
          price: recipe?.price || 0,
          quantity: item.quantity,
          status: "pending", // Add status field for each item
          createdBy: recipe?.createdBy // Store the caterer ID
        };
      })
    );

    const newOrder = new Order({
      user: userId,
      items: formattedItems,
      address,
      method,
      totalAmount,
    });

    await newOrder.save();
    return res.status(201).json({ success: true, message: "Order placed successfully." });
  } catch (error) {
    console.error("Order placement failed:", error);
    return res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

exports.getOrdersForCaterer = async (req, res) => {
  try {
    const catererId = req.user.id;
    const userRole = req.user.role;
    console.log("getOrdersForCaterer called with catererId:", catererId, "role:", userRole);

    // Find all recipe IDs by this caterer
    const recipes = await Recipe.find({ createdBy: catererId }).select('_id');
    console.log("Found recipes:", recipes);
    const recipeIds = recipes.map(r => r._id);

    // Find orders that have items with recipeId in recipeIds
    const orders = await Order.find({ 'items.recipeId': { $in: recipeIds } })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();
    console.log("Found orders:", orders);

    // For each order, filter items to only those belonging to this caterer's recipes
    const filteredOrders = orders.map(order => {
      const filteredItems = order.items.filter(item => 
        recipeIds.some(id => id.toString() === item.recipeId.toString())
      );
      return {
        ...order,
        items: filteredItems,
      };
    });

    return res.status(200).json({ success: true, data: filteredOrders });
  } catch (error) {
    console.error("Failed to get orders for caterer:", error);
    return res.status(500).json({ success: false, message: "Failed to get orders." });
  }
};

exports.getOrdersForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean();

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Failed to get orders for user:", error);
    return res.status(500).json({ success: false, message: "Failed to get orders." });
  }
};

exports.acceptOrderItems = async (req, res) => {
  try {
    const catererId = req.user.id;
    const { orderId, items } = req.body;

    if (!orderId || !items?.length) {
      return res.status(400).json({ success: false, message: "Order ID and items are required" });
    }

    // Verify caterer owns these recipes
    const recipes = await Recipe.find({ 
      _id: { $in: items },
      createdBy: catererId 
    });
    
    const recipeIds = recipes.map(r => r._id.toString());
    const invalidItems = items.filter(itemId => !recipeIds.includes(itemId.toString()));
    
    if (invalidItems.length > 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update all these items" 
      });
    }

    // Update order items status
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let updated = false;
    order.items.forEach(item => {
      if (recipeIds.includes(item.recipeId.toString())) {
        item.status = "accepted";
        updated = true;
      }
    });

    if (updated) {
      await order.save();
      return res.status(200).json({ success: true, message: "Order items accepted successfully" });
    } else {
      return res.status(400).json({ success: false, message: "No items were updated" });
    }
  } catch (error) {
    console.error("Failed to accept order items:", error);
    return res.status(500).json({ success: false, message: "Failed to accept order items" });
  }
};

exports.rejectOrderItems = async (req, res) => {
  try {
    const catererId = req.user.id;
    const { orderId, items } = req.body;

    if (!orderId || !items?.length) {
      return res.status(400).json({ success: false, message: "Order ID and items are required" });
    }

    // Verify caterer owns these recipes
    const recipes = await Recipe.find({ 
      _id: { $in: items },
      createdBy: catererId 
    });
    
    const recipeIds = recipes.map(r => r._id.toString());
    const invalidItems = items.filter(itemId => !recipeIds.includes(itemId.toString()));
    
    if (invalidItems.length > 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to update all these items" 
      });
    }

    // Update order items status
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let updated = false;
    order.items.forEach(item => {
      if (recipeIds.includes(item.recipeId.toString())) {
        item.status = "rejected";
        updated = true;
      }
    });

    if (updated) {
      await order.save();
      return res.status(200).json({ success: true, message: "Order items rejected successfully" });
    } else {
      return res.status(400).json({ success: false, message: "No items were updated" });
    }
  } catch (error) {
    console.error("Failed to reject order items:", error);
    return res.status(500).json({ success: false, message: "Failed to reject order items" });
  }
};