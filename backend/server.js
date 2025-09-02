import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import foodRouter from './routes/food.route.js';
import userRouter from './routes/user.route.js';
import cartRouter from './routes/cart.route.js';
import orderRouter from './routes/order.route.js';

// console.log("Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY ? "✅ Yes" : "❌ No");
dotenv.config();

// console.log("Raw Stripe Key:", process.env.STRIPE_SECRET_KEY);


//app config

const app = express();
const port = 5000;


//middleware
app.use(express.json());
app.use(cors());

//db connection
connectDB();

//api endpoints
// Serve uploaded images
app.use('/images', express.static('uploads'));
app.use('/api/food',foodRouter);
app.use('/api/user',userRouter);
app.use('/api/cart',cartRouter);
app.use('/api/order',orderRouter);

app.get('/',(req,res)=>{
    res.send("App is working")
})

app.listen(port,(req,res)=>{
    console.log(`Server is running on port ${port}`);
    
})