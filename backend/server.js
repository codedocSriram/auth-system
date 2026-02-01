import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
import authRouter from "./routes/auth.router.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
    console.log("Server is running in port: ", PORT);
    connectDB();
});
