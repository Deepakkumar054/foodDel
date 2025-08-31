import { log } from "console";
import foodModel from "../models/foodModel.js";

import fs from 'fs';

//add food item

const addFood = async(req,res)=>{
    // console.log("req.file:", req.file);
    // console.log("req.body:", req.body);

    let image_filename = req.file ? req.file.filename : null;

    const food = new foodModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename 
    })

    try {
        await food.save();
        res.status(200).json({
            success:true,
            message:"Food item added successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to add food item",
            error:error.message
        });
    }
}

// all food list

const listFood = async(req,res)=>{
    try {
        const foods = await foodModel.find({});
        res.json({
            success:true,
            data:foods
        })
    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:"Error"
        })
        
    }
}

//remove food

const removeFood = async(req,res)=>{
    try {
        const  food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{})

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({
            success:true,
            message:"Items removed"
        })
    } catch (error) {
        console.log(error);
        res.json({
            success:false,
            message:"failed to remove item"
        })
        
    }
}

export {addFood,listFood,removeFood};