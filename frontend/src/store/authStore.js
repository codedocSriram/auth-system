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
}));
