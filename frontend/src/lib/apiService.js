import api from './api';

// Income
export const getIncome = async (params = {}) => (await api.get('/income', { params })).data;
export const createIncome = async (data) => (await api.post('/income', data)).data;
export const deleteIncome = async (id) => (await api.delete(`/income/${id}`)).data;

// Savings Cards
export const getSavings = async () => (await api.get('/savings')).data;
export const createSaving = async (data) => (await api.post('/savings', data)).data;
export const updateSaving = async (id, data) => (await api.put(`/savings/${id}`, data)).data;
export const deleteSaving = async (id) => (await api.delete(`/savings/${id}`)).data;

// Budgets
export const getBudgets = async (params = {}) => (await api.get('/budgets', { params })).data;
export const saveBudget = async (data) => (await api.post('/budgets', data)).data;
export const deleteBudget = async (id) => (await api.delete(`/budgets/${id}`)).data;

// Goals
export const getGoals = async () => (await api.get('/goals')).data;
export const createGoal = async (data) => (await api.post('/goals', data)).data;
export const updateGoal = async (id, data) => (await api.put(`/goals/${id}`, data)).data;
export const deleteGoal = async (id) => (await api.delete(`/goals/${id}`)).data;

// Analytics
export const getAnalyticsSummary = async (params = {}) => (await api.get('/analytics/summary', { params })).data;
