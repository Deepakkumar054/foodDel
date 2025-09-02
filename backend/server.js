import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import foodRouter from './routes/food.route.js';
import userRouter from './routes/user.route.js';
import cartRouter from './routes/cart.route.js';
import orderRouter from './routes/order.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173", // local frontend
    "https://fooddel-frontend-svuk.onrender.com" // deployed frontend
  ],
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

// Connect DB
connectDB();

// Serve uploaded images
app.use('/images', express.static('uploads'));

// Routes
app.use('/api/food', foodRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

// Test endpoint
app.get('/', (req,res) => res.send("Backend is working"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
