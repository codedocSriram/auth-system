import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/email.js";
export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        if (!email || !password || !fullName) {
            res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();
        const user = new User({
            fullName: fullName,
            password: hashPassword,
            email: email,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });
        generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);
        await user.save();
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = (req, res) => {
    res.send("login page");
};

export const logout = (req, res) => {
    res.send("Logut");
};

export const forgotPassword = (req, res) => {
    res.send("forgot password");
};
