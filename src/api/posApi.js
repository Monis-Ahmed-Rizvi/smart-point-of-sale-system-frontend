// src/api/posApi.js
import axios from 'axios';

// Add auth token to all requests
const authAxios = axios.create();
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const API_URL = 'http://localhost:8080/api';

const posApi = {
  // Products
  getAllProducts: async () => {
    try {
      const response = await authAxios.get(`${API_URL}/products`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getProductsByCategory: async (categoryId) => {
    try {
      const response = await authAxios.get(`${API_URL}/products/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Categories
  getAllCategories: async () => {
    try {
      const response = await authAxios.get(`${API_URL}/products/categories`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Customers
  getAllCustomers: async () => {
    try {
      const response = await authAxios.get(`${API_URL}/customers`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  searchCustomers: async (query) => {
    try {
      const response = await authAxios.get(`${API_URL}/customers/search?query=${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Orders
  createOrder: async (orderData) => {
    try {
      const response = await authAxios.post(`${API_URL}/orders`, orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default posApi;