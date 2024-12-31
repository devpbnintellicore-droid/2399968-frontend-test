import api from "./axios";

export const analyzeExperiment = async (experimentId) => {
  const response = await api.post("/ai/analyze", { experimentId });
  return response.data;
};

export const analyzeRecipe = async (recipeName) => {
  const response = await api.post("/ai/analyze-recipe", { recipeName });
  return response.data;
};

export const compareVersions = async (recipeName) => {
  const response = await api.post("/ai/compare-versions", { recipeName });
  return response.data;
};

export const generateRecipeReport = async (recipeName) => {
  const response = await api.get(`/ai/generate-report/${recipeName}`);
  return response.data;
};

export const getPortfolioReport = async () => {
  const response = await api.get("/ai/portfolio-report");
  return response.data;
};

export default {
  analyzeExperiment,
  analyzeRecipe,
  compareVersions,
  generateRecipeReport,
  getPortfolioReport,
};
