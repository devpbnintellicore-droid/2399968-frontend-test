import api from "./axios";

export const getAllQuestions = async () => {
    const response = await api.get("/questions");
    return response.data;
};

export const submitAnswer = async (answerData) => {
    const response = await api.post("/questions/answer", answerData);
    return response.data;
};

export const submitBatchAnswers = async (answers) => {
    const response = await api.post("/questions/batch-answer", { answers });
    return response.data;
};

export const createQuestion = async (questionData) => {
    const response = await api.post("/questions", questionData);
    return response.data;
};

export const updateQuestion = async (id, questionData) => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
};

export const deleteQuestion = async (id) => {
    const response = await api.delete(`/questions/${id}`);
    return response.data;
};

export const snapshotQuestionnaire = async () => {
    const response = await api.post("/questions/questionnaires/snapshot");
    return response.data;
};

export const getQuestionnaireVersions = async () => {
    const response = await api.get("/questions/questionnaires/versions");
    return response.data;
};

export const getQuestionChangeLogs = async (id) => {
    const response = await api.get(`/questions/${id}/history`);
    return response.data;
};

export default {
    getAllQuestions,
    submitAnswer,
    submitBatchAnswers,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    snapshotQuestionnaire,
    getQuestionnaireVersions,
    getQuestionChangeLogs
};
