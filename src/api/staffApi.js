import api from "./axios";

export const getAllStaff = async () => {
    const response = await api.get("/auth/staff");
    return response.data;
};

export const getStaffStats = async () => {
    const response = await api.get("/auth/stats");
    return response.data;
};

export const createStaff = async (staffData) => {
    const response = await api.post("/auth/create-staff", staffData);
    return response.data;
};

export const updateStaff = async (id, staffData) => {
    const response = await api.put(`/auth/staff/${id}`, staffData);
    return response.data;
};

export const deleteStaff = async (id) => {
    const response = await api.delete(`/auth/staff/${id}`);
    return response.data;
};

export const loginStaff = async (email, password, role) => {
    const response = await api.post(`/auth/login`, { email, password, role });
    return response.data;
};

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword
    });
    return response.data;
};

export default {
    getAllStaff,
    getStaffStats,
    createStaff,
    updateStaff,
    deleteStaff,
    loginStaff,
    changePassword
};
