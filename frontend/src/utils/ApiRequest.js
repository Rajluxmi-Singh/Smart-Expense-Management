import axios from 'axios';

// Create an Axios instance using the base URL from environment variables
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Include cookies if needed for auth
});

// Authentication APIs
export const registerAPI = (data) => API.post('/auth/register', data);
export const loginAPI = (data) => API.post('/auth/login', data);

// Transaction APIs
export const addTransactionAPI = (data) => API.post('/v1/addTransaction', data);
export const getTransactionAPI = (data) => API.post('/v1/getTransaction', data);
export const updateTransactionAPI = (data) => API.post('/v1/updateTransaction', data);
export const deleteTransactionAPI = (data) => API.post('/v1/deleteTransaction', data);

// Aliases for TableData.js compatibility
export const editTransactions = updateTransactionAPI;
export const deleteTransactions = deleteTransactionAPI;
