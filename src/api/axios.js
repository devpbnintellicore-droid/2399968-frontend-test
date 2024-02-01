import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ⭐ Axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// ⭐ attach token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Login errors belong to the login form. Do not treat a bad password,
        // role mismatch, or inactive account as an expired existing session.
        const isLoginRequest = error.config?.url?.endsWith("/auth/login");
        const status = error.response?.status;
        const message = String(error.response?.data?.message || "").toLowerCase();
        const isDeactivated = status === 403 &&
            (message.includes("inactive") || message.includes("deactivated"));
        const isAuthFailure = status === 401 || isDeactivated;

        // A 403 can simply mean the signed-in role is not allowed to use a
        // feature (for example, a CRA opening a manager-only endpoint). Only
        // an explicit inactive-account response should clear authentication.
        if (!isLoginRequest && isAuthFailure) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("ck_auth");
            localStorage.removeItem("ck_auth_email");
            localStorage.removeItem("ck_role");
            window.location.href = `/login?error=${isDeactivated ? "deactivated" : "expired"}`;
        }
        return Promise.reject(error);
    }
);
export default api;
