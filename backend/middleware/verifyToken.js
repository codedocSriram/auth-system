import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Unautherized!" });
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid Token!" });
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("Error occured in verifyToken middleware:", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error!",
        });
    }
};
