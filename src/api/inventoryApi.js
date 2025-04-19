// src/api/inventoryApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/inventory';

// Add auth token to all requests
const authAxios = axios.create();
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const inventoryApi = {
  // Ingredients
  getAllIngredients: async () => {
    try {
      const response = await authAxios.get(`${API_URL}/ingredients`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getIngredientById: async (id) => {
    try {
      const response = await authAxios.get(`${API_URL}/ingredients/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getLowStockIngredients: async () => {
    try {
      const response = await authAxios.get(`${API_URL}/ingredients/low-stock`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateStock: async (ingredientId, quantity, transactionType, notes) => {
    try {
      const response = await authAxios.post(`${API_URL}/update-stock`, {
        ingredientId,
        quantity,
        transactionType,
        notes
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  saveIngredient: async (ingredient) => {
    try {
      const response = await authAxios.post(`${API_URL}/ingredients`, ingredient);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteIngredient: async (id) => {
    try {
      await authAxios.delete(`${API_URL}/ingredients/${id}`);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

export default inventoryApi;