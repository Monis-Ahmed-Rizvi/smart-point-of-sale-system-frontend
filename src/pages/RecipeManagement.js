// src/pages/RecipeManagement.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProductList from '../components/recipe/ProductList';
import ProductForm from '../components/recipe/ProductForm';
import CategoryManagement from '../components/recipe/CategoryManagement';
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

const RecipeManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch products
        const productsResponse = await authAxios.get(`${API_URL}/products`);
        setProducts(productsResponse.data);

        // Fetch categories
        const categoriesResponse = await authAxios.get(`${API_URL}/products/categories`);
        setCategories(categoriesResponse.data);

        // Fetch ingredients
        const ingredientsResponse = await authAxios.get(`${API_URL}/inventory/ingredients`);
        setIngredients(ingredientsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
        
        // Mock data for development
        setProducts([
          { id: 1, name: 'Beef Stroganoff', sellingPrice: 18.95, category: { id: 1, name: 'Main Course' }, isActive: true },
          { id: 2, name: 'Chicken Caesar Salad', sellingPrice: 12.95, category: { id: 1, name: 'Main Course' }, isActive: true },
          { id: 3, name: 'Chocolate Cake', sellingPrice: 6.95, category: { id: 3, name: 'Desserts' }, isActive: true },
          { id: 4, name: 'Mozzarella Sticks', sellingPrice: 8.95, category: { id: 2, name: 'Appetizers' }, isActive: true },
        ]);
        
        setCategories([
          { id: 1, name: 'Main Course' },
          { id: 2, name: 'Appetizers' },
          { id: 3, name: 'Desserts' },
          { id: 4, name: 'Beverages' }
        ]);
        
        setIngredients([
          { id: 1, name: 'Beef', currentStock: 10.5, unitOfMeasure: 'kg' },
          { id: 2, name: 'Chicken', currentStock: 15.2, unitOfMeasure: 'kg' },
          { id: 3, name: 'Flour', currentStock: 25.0, unitOfMeasure: 'kg' },
          { id: 4, name: 'Sugar', currentStock: 20.0, unitOfMeasure: 'kg' },
          { id: 5, name: 'Mozzarella Cheese', currentStock: 5.0, unitOfMeasure: 'kg' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSaveProduct = async (productData) => {
    try {
      let response;
      
      if (productData.id) {
        // Update existing product
        response = await authAxios.put(`${API_URL}/products/${productData.id}`, productData);
      } else {
        // Create new product
        response = await authAxios.post(`${API_URL}/products`, productData);
      }
      
      // Refresh products list
      const updatedProducts = await authAxios.get(`${API_URL}/products`);
      setProducts(updatedProducts.data);
      
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product');
      
      // For development, update the products list anyway
      if (productData.id) {
        setProducts(products.map(p => p.id === productData.id ? productData : p));
      } else {
        const newProduct = {
          ...productData,
          id: Math.max(...products.map(p => p.id)) + 1
        };
        setProducts([...products, newProduct]);
      }
      setIsFormOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Recipe Management
        </Typography>
        {tabValue === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Products" />
          <Tab label="Categories" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <ProductList 
          products={products} 
          categories={categories}
          onEdit={handleEditProduct}
        />
      )}

      {tabValue === 1 && (
        <CategoryManagement 
          categories={categories} 
          setCategories={setCategories}
        />
      )}

      {isFormOpen && (
        <ProductForm
          open={isFormOpen}
          product={selectedProduct}
          categories={categories}
          ingredients={ingredients}
          onClose={handleCloseForm}
          onSave={handleSaveProduct}
        />
      )}
    </Box>
  );
};

export default RecipeManagement;