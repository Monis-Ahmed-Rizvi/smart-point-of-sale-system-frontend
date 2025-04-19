import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Implement token validation
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);
  
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);
      const { token, id, email: userEmail, role } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ id, email: userEmail, role }));
      
      setUser({ id, email: userEmail, role });
      setIsAuthenticated(true);
      setIsLoading(false);
      
      navigate('/dashboard');
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};