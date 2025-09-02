import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const FRONTEND_URL = "https://fooddel-frontend-svuk.onrender.com";

export const placeOrder = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { items, amount, address } = req.body;
    if (!items?.length || !amount || !address) return res.status(400).json({ success: false, message: "Invalid order data" });

    const newOrder = new orderModel({ userId: req.userId, items, amount, address });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    const line_items = items.map(item => ({
      price_data: { currency: "inr", product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
      quantity: item.quantity,
    }));

    // Minimum ₹50 Stripe check
    const DELIVERY_FEE = 50;
    line_items.push({ price_data: { currency: "inr", product_data: { name: "Delivery Charges" }, unit_amount: DELIVERY_FEE * 100 }, quantity: 1 });

    const totalAmountPaise = line_items.reduce((sum, i) => sum + i.price_data.unit_amount * i.quantity, 0);
    if (totalAmountPaise < 50) return res.status(400).json({ success: false, message: "Total order amount too low for Stripe" });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error while placing order" });
  }
};

export const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") await orderModel.findByIdAndUpdate(orderId, { payment: true });
    else await orderModel.findByIdAndDelete(orderId);
    res.json({ success: success === "true", message: success === "true" ? "Payment Successful" : "Payment Failed" });
  } catch (err) { res.json({ success: false, message: "Error while verifying order" }); }
};

export const userOrders = async (req, res) => {
  try { const orders = await orderModel.find({ userId: req.userId }); res.json({ success: true, data: orders }); }
  catch (err) { res.json({ success: false, message: "Error fetching user orders" }); }
};

export const listOrders = async (req, res) => {
  try { const orders = await orderModel.find({}); res.json({ success: true, data: orders }); }
  catch (err) { res.json({ success: false, message: "Error fetching all orders" }); }
};

export const updateStatus = async (req, res) => {
  try { await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status }); res.json({ success: true, message: "Order status updated" }); }
  catch (err) { res.json({ success: false, message: "Error updating order status" }); }
};
