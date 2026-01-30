import axios from "axios";
import dotenv from "dotenv";
import {
    VERIFICATION_EMAIL_TEMPLATE,
    WELCOME_USER_TEMPLATE,
} from "./emailTemplate.js";
dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_URL = process.env.BREVO_URL;

export const sendVerificationEmail = async (email, verificationToken) => {
    const emailData = {
        sender: {
            name: "Pingify Admin",
            email: "mailsriram98@gmail.com",
        },
        to: [
            {
                email: email,
            },
        ],
        subject: "Verify your email",
        htmlContent: VERIFICATION_EMAIL_TEMPLATE.replace(
            "{verificationCode}",
            verificationToken,
        ),
        category: "Email Verification",
    };
    try {
        const response = await axios.post(BREVO_URL, emailData, {
            headers: {
                "Content-Type": "application/json",
                "api-key": BREVO_API_KEY,
            },
        });
        console.log("Email sent successfully", response);
    } catch (error) {
        console.log(`Error sending verification email: ${error}`);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

export const sendWelcomeMail = async (email, userName) => {
    const emailData = {
        sender: {
            name: "Pingify Admin",
            email: "mailsriram98@gmail.com",
        },
        to: [
            {
                email: email,
            },
        ],
        subject: "Welcome email",
        htmlContent: WELCOME_USER_TEMPLATE.replace("{username}", userName),
        category: "Welcome email",
    };
    try {
        const response = await axios.post(BREVO_URL, emailData, {
            headers: {
                "Content-Type": "application/json",
                "api-key": BREVO_API_KEY,
            },
        });
        console.log("Email sent successfully", response);
    } catch (error) {
        console.log(`Error sending verification email: ${error}`);
        throw new Error(`Error sending verification email: ${error}`);
    }
};
