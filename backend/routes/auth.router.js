import express from "express";
import {
    signup,
    login,
    logout,
    verifyEmail,
} from "../controller/auth.controller.js";
const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.get("/login", login);
authRouter.get("/logout", logout);
authRouter.post("/verify-email", verifyEmail);
export default authRouter;
