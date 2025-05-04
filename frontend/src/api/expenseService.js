import API from './axios';

// Fetch all expenses
export const getExpenses = async () => {
  const response = await API.get('/expenses');
  return response.data;
};

// Add a new expense
export const addExpense = async (expenseData) => {
  const response = await API.post('/expenses', expenseData);
  return response.data;
};

// Update an expense
export const updateExpense = async (id, data) => {
  const response = await API.put(`/expenses/${id}`, data);
  return response.data;
};

// Delete an expense
export const deleteExpense = async (id) => {
  const response = await API.delete(`/expenses/${id}`);
  return response.data;
};
