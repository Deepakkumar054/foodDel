import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Replace with your deployed frontend URL
const FRONTEND_URL = "https://fooddel-frontend-svuk.onrender.com";

export const placeOrder = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { items, amount, address } = req.body;

    // ✅ Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in the order" });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid total amount" });
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Address is required" });
    }

    // 1️⃣ Create order in DB
    const newOrder = new orderModel({
      userId: req.userId,
      items,
      amount,
      address,
    });
    await newOrder.save();

    // 2️⃣ Clear user's cart
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    // 3️⃣ Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.max(50, Math.round(Number(item.price) * 100)), // minimum 50 paise
      },
      quantity: item.quantity,
    }));

    // Add delivery fee
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: 200, // ₹2
      },
      quantity: 1,
    });

    // 4️⃣ Create Stripe checkout session
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
