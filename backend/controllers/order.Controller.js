import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Initialize Stripe

// Deployed frontend URL
const FRONTEND_URL = "https://fooddel-frontend-svuk.onrender.com";

// Place Order
export const placeOrder = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    // 1️⃣ Create new order in DB
    const newOrder = new orderModel({
      userId: req.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();

    // 2️⃣ Clear user's cart
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    // 3️⃣ Stripe line items
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: item.price * 100, // amount in paise
      },
      quantity: item.quantity,
    }));

    // Add delivery fee (minimum ₹50 total for Stripe)
    const DELIVERY_FEE = 50; // ₹50 = 5000 paise
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: { name: "Delivery Charges" },
        unit_amount: DELIVERY_FEE * 100,
      },
      quantity: 1,
    });

    // 4️⃣ Calculate total amount in paise
    const totalAmountPaise = line_items.reduce(
      (sum, item) => sum + item.price_data.unit_amount * item.quantity,
      0
    );

    // Stripe requires minimum amount of 50 cents (~₹50)
    if (totalAmountPaise < 50) {
      return res.status(400).json({
        success: false,
        message: "Total order amount is too low for Stripe payment. Minimum ₹50 required.",
      });
    }

    // 5️⃣ Create Stripe checkout session
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

// Verify payment after redirect
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
    console.log(error);
    res.json({ success: false, message: "Error while verifying order" });
  }
};

// Get orders for logged-in user
export const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while fetching user orders" });
  }
};

// List all orders (admin)
export const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while fetching all orders" });
  }
};

// Update order status (admin)
export const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error while updating order status" });
  }
};
