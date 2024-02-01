import api from "./axios";

export const createSensory = async (data) => {
    const response = await api.post("/sensory", data);
    return response.data;
};

export default {
    createSensory
};
