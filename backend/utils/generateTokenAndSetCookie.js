import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_KEY, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};

export const generateSignupTokenAndSetCookie = (res, email) => {
    const signupToken = jwt.sign({ email }, process.env.JWT_KEY, {
        expiresIn: "2m",
    });

    res.cookie("signupToken", signupToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 60 * 1000,
    });

    return signupToken;
};
