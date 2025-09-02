// controllers/order.controller.js
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Initialize Stripe with your secret key

// Replace with your deployed frontend URL on Render
const FRONTEND_URL = "https://fooddel-frontend-svuk.onrender.com";

// 1️⃣ Place Order
export const placeOrder = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    // Create new order in DB
    const newOrder = new orderModel({
      userId: req.userId, // comes from authMiddleware
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    // Stripe line items
    const line_items = req.body.items.map(item => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: item.price * 100, // amount in paise
      },
      quantity: item.quantity,
    }));

    // Add delivery fee
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200, // ₹2 in paise
      },
      quantity: 1,
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Order placement failed:", error);
    res.status(500).json({ success: false, message: "Error while placing order" });
  }
};

// 2️⃣ Verify Payment
export const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.json({ success: true, message: "Payment Successful" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while verifying order" });
  }
};

// 3️⃣ Get Orders for Logged-in User
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while fetching user orders" });
  }
};

// 4️⃣ List All Orders (Admin)
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while fetching all orders" });
  }
};

// 5️⃣ Update Order Status (Admin)
export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while updating order status" });
  }
};
