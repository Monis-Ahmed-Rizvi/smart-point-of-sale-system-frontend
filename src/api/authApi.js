import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const authApi = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/signin`, { 
        username, 
        password 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authApi;