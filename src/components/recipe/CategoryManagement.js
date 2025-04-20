// src/components/recipe/CategoryManagement.js
import React, { useState } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
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

const CategoryManagement = ({ categories, setCategories }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAddCategory = () => {
    setCurrentCategory({ name: '', description: '' });
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await authAxios.delete(`${API_URL}/products/categories/${categoryId}`);
        setCategories(categories.filter(cat => cat.id !== categoryId));
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category');
        
        // For development, remove it anyway
        setCategories(categories.filter(cat => cat.id !== categoryId));
      }
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({
      ...currentCategory,
      [name]: value
    });
  };

  const handleSaveCategory = async () => {
    if (!currentCategory.name) {
      setError('Category name is required');
      return;
    }

    try {
      let response;
      
      if (isEditing) {
        // Update existing category
        response = await authAxios.put(`${API_URL}/products/categories/${currentCategory.id}`, currentCategory);
        
        // Update the categories list
        setCategories(categories.map(cat => 
          cat.id === currentCategory.id ? response.data : cat
        ));
      } else {
        // Create new category
        response = await authAxios.post(`${API_URL}/products/categories`, currentCategory);
        
        // Add to the categories list
        setCategories([...categories, response.data]);
      }
      
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category');
      
      // For development, update the categories list anyway
      if (isEditing) {
        setCategories(categories.map(cat => 
          cat.id === currentCategory.id ? currentCategory : cat
        ));
      } else {
        const newCategory = {
          ...currentCategory,
          id: Math.max(...categories.map(c => c.id), 0) + 1
        };
        setCategories([...categories, newCategory]);
      }
      setDialogOpen(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddCategory}
        >
          Add Category
        </Button>
      </Box>
      
      <Paper>
        <List>
          {categories.length > 0 ? (
            categories.map((category) => (
              <React.Fragment key={category.id}>
                <ListItem>
                  <ListItemText
                    primary={category.name}
                    secondary={category.description || 'No description'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleEditCategory(category)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteCategory(category.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No categories available"
                secondary="Click 'Add Category' to create a new category"
              />
            </ListItem>
          )}
        </List>
      </Paper>
      
      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {isEditing ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              name="name"
              label="Category Name"
              value={currentCategory.name}
              onChange={handleInputChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              name="description"
              label="Description"
              value={currentCategory.description}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSaveCategory} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;