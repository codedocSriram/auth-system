import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,

    signup: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                email,
                password,
                fullName,
            });
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response.data.message || "Error signing up",
                isLoading: false,
            });
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        const email = localStorage.getItem("email");
        try {
            const response = await axios.post(`${API_URL}/verify-email`, {
                email,
                code,
            });
            console.log(response);
            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });
            localStorage.removeItem("email");
            return response;
        } catch (error) {
            set({
                error: error.response?.data.message || error.message,
                isLoading: false,
            });
            throw error;
        }
    },
    checkAuth: async () => {
        console.log("Function called");
        set({ isCheckingAuth: true, error: null });
        try {
            const response = await axios.get(`${API_URL}/check-auth`);
            console.log(response);
            set({
                user: response.data.user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });
        } catch (error) {
            set({ error: null, isCheckingAuth: false, isAuthenticated: false });
        }
    },
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error logging in",
                isLoading: false,
            });
            throw error;
        }
    },
    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, {
                email,
            });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error.response.data.message ||
                    "Error sending reset password email",
            });
            throw error;
        }
    },
    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(
                `${API_URL}/reset-password/${token}`,
                { password },
            );
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error:
                    error.response.data.message || "Error resetting password",
            });
            throw error;
        }
    },
    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            set({
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },
}));
