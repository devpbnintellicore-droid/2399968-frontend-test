import api from "./axios";

export const getAllExperiments = async (params = {}) => {
  const response = await api.get("/experiment", { params });
  return response.data;
};

export const createExperiment = async (data) => {
  const response = await api.post("/experiment", data);
  return response.data;
};

export const getNextVersion = async (name, bump = false) => {
  const response = await api.get(`/experiment/version`, {
    params: {
      name,
      bump
    }
  });

  return response.data;
};

export const getRecipeHistory = async (name, params = {}) => {
  const response = await api.get(`/experiment/history`, {
    params: { name, ...params }
  });
  return response.data;
};

export const getDashboard = async (params = {}) => {
  const response = await api.get("/experiment/dashboard", { params });
  return response.data;
};

export const getReviewerDashboard = async (params = {}) => {
  const response = await api.get("/experiment/reviewer-dashboard", { params });
  return response.data;
};

export const getManagerDashboard = async (params = {}) => {
  const response = await api.get("/experiment/manager-dashboard", { params });
  return response.data;
};
export const getAllReviews = async (params = {}) => {
  const response = await api.get("/experiment/reviews", { params });
  return response.data;
};

export const getAllRecipes = async (params = {}) => {
  const response = await api.get("/experiment/all-recipes", { params });
  return response.data;
};

export const approveExperiment = async (id) => {
  const response = await api.post(`/experiment/${id}/approve`);
  return response.data;
};

export const rejectExperiment = async (id, reason = "") => {
  const response = await api.post(`/experiment/${id}/reject`, { reason });
  return response.data;
};

export const completeExperiment = async (id) => {
  const response = await api.post(`/experiment/${id}/complete`);
  return response.data;
};

export const updateRemarks = async (id, remarks, reason) => {
  const response = await api.put(`/experiment/${id}/remarks`, { remarks, reason });
  return response.data;
};

export const getRecipeSuggestions = async (query, limit = 5) => {
  const response = await api.get("/experiment/recipe-suggestions", {
    params: { search: query, limit },
  });
  return response.data;
};

export const getIngredientSuggestions = async (query, limit = 5) => {
  const response = await api.get("/experiment/ingredient-suggestions", {
    params: { search: query, limit },
  });
  return response.data;
};

export const addIngredient = async (name, unit = "g") => {
  const response = await api.post("/experiment/ingredients", {
    name,
    unit,
  });
  return response.data;
};

export const deleteIngredient = async (id) => {
  const response = await api.delete(`/experiment/ingredients/${id}`);
  return response.data;
};

export const getAllIngredients = async () => {
  const response = await api.get("/experiment/ingredients");
  return response.data;
};

export default {
  getAllExperiments,
  createExperiment,
  getNextVersion,
  getRecipeHistory,
  getDashboard,
  getReviewerDashboard,
  getManagerDashboard,
  getAllReviews,
  getRecipeSuggestions,
  getIngredientSuggestions,
  deleteIngredient,
  getAllIngredients,
  getAllRecipes,
  approveExperiment,
  rejectExperiment,
  completeExperiment,
  updateRemarks,
};
