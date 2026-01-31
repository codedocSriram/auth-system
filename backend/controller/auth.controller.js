import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
    sendVerificationEmail,
    sendWelcomeMail,
    sendPasswordResetEmail,
    sendResetSuccessEmail,
} from "../mailtrap/email.js";
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
            message: "User created, verify email to continue",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    // const {email,code} = req.body;
    const { code } = req.body;
    try {
        const user = await User.findOne({
            // email: email,
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid/expired verification code",
            });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeMail(user.email, user.fullName);
        res.status(201).json({
            success: true,
            user: {
                ...user._doc,
                password: undefined,
            },
            message: "User signup successful!",
        });
    } catch (error) {
        console.log("Error in code verification:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }
        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            message: "Logged in Successfully!",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    } catch (error) {
        console.log("Error in login function:", error.message);
        res.status(500).json({
            success: false,
            message: "internal server error",
        });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfuly!" });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No acount with mentioned Email exists",
            });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");
        const expiresAt = Date.now() + 1 * 60 * 60 * 1000; //1hour
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = expiresAt;
        await user.save();
        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
        );
        return res.status(200).json({
            success: true,
            message: "Reset password OTP sent to registered email",
        });
    } catch (error) {
        console.log("Error in forgotPassword function:", error.message);
        res.status(500).json({
            success: false,
            message: "internal server error",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid reset token" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        user.password = hashPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        await sendResetSuccessEmail(user.email);
        res.status(200).json({
            success: true,
            message: "Password reset successful!",
        });
    } catch (error) {
        console.log("Error in resetPassword function:", error.message);
        res.status(500).json({
            success: false,
            message: "Error resetting password",
        });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res
                .status(400)
                .json({ success: true, message: "user not found!" });
        }
        res.status(200).json({
            success: true,
            user: {
                ...user._doc,
            },
        });
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
