import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import validator from "validator";



//login user

const loginUser = async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter all fields"
            })
        }
        const token = createToken(user._id);
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in login"
        });

    }
}


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
}
//register user

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        //check if user already exists
        const userExists = await userModel.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }

        // validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            })
        }

        // validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "please enter a password"
            })
        }
        //hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //creae the user
        const newUser = await userModel.create({
            name: name,
            email: email,
            password: hashedPassword
        })

        const user = await newUser.save();
        //generate token

        const token = createToken(user._id)
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in registration",
        });

    }
}

export { loginUser, registerUser }