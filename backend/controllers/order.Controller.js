import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";


// Replace with your deployed frontend URL
const FRONTEND_URL = "https://fooddel-frontend-svuk.onrender.com";

export const placeOrder = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    // Validate required data
    const { items, amount, address } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in the order" });
    }
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Invalid total amount" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }

    // Create new order in DB
    const newOrder = new orderModel({
      userId: req.userId,
      items,
      amount,
      address,
    });
    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    // Prepare Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.round(Number(item.price) * 100), // convert to paise
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
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        line_items,
        mode: "payment",
        success_url: `${FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
        cancel_url: `${FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
      });
    } catch (err) {
      console.error("Stripe session error:", err);
      return res.status(500).json({ success: false, message: "Stripe session failed" });
    }

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Order placement failed:", error);
    res.status(500).json({ success: false, message: "Error while placing order" });
  }
};
