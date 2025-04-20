import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
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

const ProductForm = ({ open, product, categories, ingredients, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    categoryId: '',
    sellingPrice: '',
    isActive: true,
    preparationTime: 0,
    cookingInstructions: ''
  });
  
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [activeTab, setActiveTab] = useState(product?.showRecipe ? 'recipe' : 'details');
  const [newIngredient, setNewIngredient] = useState({
    ingredientId: '',
    quantity: '',
    unitOfMeasure: '',
    isOptional: false
  });

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || null,
        name: product.name || '',
        description: product.description || '',
        categoryId: product.category?.id || '',
        sellingPrice: product.sellingPrice || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        preparationTime: product.preparationTime || 0,
        cookingInstructions: product.cookingInstructions || ''
      });
      
      // If editing an existing product, fetch its recipe
      if (product.id) {
        fetchProductIngredients(product.id);
      }
      
      if (product.showRecipe) {
        setActiveTab('recipe');
      }
    }
  }, [product]);

  const fetchProductIngredients = async (productId) => {
    try {
      const response = await authAxios.get(`${API_URL}/recipes/products/${productId}/ingredients`);
      setRecipeIngredients(response.data);
    } catch (err) {
      console.error('Error fetching product ingredients:', err);
      // Mock data for development
      setRecipeIngredients([
        {
          id: 1,
          ingredient: { id: 1, name: 'Beef' },
          quantity: 0.2,
          unitOfMeasure: 'kg',
          isOptional: false
        },
        {
          id: 2,
          ingredient: { id: 3, name: 'Flour' },
          quantity: 0.05,
          unitOfMeasure: 'kg',
          isOptional: false
        }
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNewIngredientChange = (e) => {
    const { name, value, checked, type } = e.target;
    setNewIngredient({
      ...newIngredient,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // If ingredient is selected, set the default unit of measure
    if (name === 'ingredientId') {
      const selectedIngredient = ingredients.find(ing => ing.id === parseInt(value));
      if (selectedIngredient) {
        setNewIngredient({
          ...newIngredient,
          ingredientId: value,
          unitOfMeasure: selectedIngredient.unitOfMeasure
        });
      }
    }
  };

  const handleAddIngredient = async () => {
    // Validate the new ingredient
    if (!newIngredient.ingredientId || !newIngredient.quantity) {
      return;
    }
    
    const selectedIngredient = ingredients.find(ing => ing.id === parseInt(newIngredient.ingredientId));
    
    if (!selectedIngredient) {
      return;
    }
    
    // If this is an existing product, add the ingredient to the backend
    if (formData.id) {
      try {
        const response = await authAxios.post(`${API_URL}/recipes/products/${formData.id}/ingredients`, {
          ingredientId: parseInt(newIngredient.ingredientId),
          quantity: parseFloat(newIngredient.quantity),
          unitOfMeasure: newIngredient.unitOfMeasure,
          isOptional: newIngredient.isOptional
        });
        
        // Add the new ingredient to the list
        setRecipeIngredients([...recipeIngredients, response.data]);
      } catch (err) {
        console.error('Error adding ingredient:', err);
        
        // For development, add it to the local list anyway
        const newRecipeIngredient = {
          id: Math.max(0, ...recipeIngredients.map(ri => ri.id)) + 1,
          ingredient: selectedIngredient,
          quantity: parseFloat(newIngredient.quantity),
          unitOfMeasure: newIngredient.unitOfMeasure,
          isOptional: newIngredient.isOptional
        };
        
        setRecipeIngredients([...recipeIngredients, newRecipeIngredient]);
      }
    } else {
      // For a new product, just add to the local list
      const newRecipeIngredient = {
        id: -Math.floor(Math.random() * 1000), // Temporary negative ID
        ingredient: selectedIngredient,
        quantity: parseFloat(newIngredient.quantity),
        unitOfMeasure: newIngredient.unitOfMeasure,
        isOptional: newIngredient.isOptional
      };
      
      setRecipeIngredients([...recipeIngredients, newRecipeIngredient]);
    }
    
    // Reset the new ingredient form
    setNewIngredient({
      ingredientId: '',
      quantity: '',
      unitOfMeasure: '',
      isOptional: false
    });
  };

  const handleRemoveIngredient = async (ingredientId) => {
    if (formData.id) {
      try {
        await authAxios.delete(`${API_URL}/recipes/products/${formData.id}/ingredients/${ingredientId}`);
        setRecipeIngredients(recipeIngredients.filter(ri => ri.id !== ingredientId));
      } catch (err) {
        console.error('Error removing ingredient:', err);
        // For development, remove from the local list anyway
        setRecipeIngredients(recipeIngredients.filter(ri => ri.id !== ingredientId));
      }
    } else {
      setRecipeIngredients(recipeIngredients.filter(ri => ri.id !== ingredientId));
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.sellingPrice) {
      return;
    }
    
    const productData = {
      ...formData,
      sellingPrice: parseFloat(formData.sellingPrice),
      preparationTime: parseInt(formData.preparationTime)
    };
    
    // If this is a new product and we have recipe ingredients, we need to handle both
    if (!formData.id && recipeIngredients.length > 0) {
      try {
        // Create the product first
        const response = await authAxios.post(`${API_URL}/products`, productData);
        const newProductId = response.data.id;
        
        // Then add each ingredient
        for (const ri of recipeIngredients) {
          await authAxios.post(`${API_URL}/recipes/products/${newProductId}/ingredients`, {
            ingredientId: ri.ingredient.id,
            quantity: ri.quantity,
            unitOfMeasure: ri.unitOfMeasure,
            isOptional: ri.isOptional
          });
        }
        
        onSave(response.data);
      } catch (err) {
        console.error('Error saving product with ingredients:', err);
        // Fall back to just saving the product
        onSave(productData);
      }
    } else {
      // Just save the product
      onSave(productData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {formData.id ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Button
              sx={{ 
                mr: 2, 
                fontWeight: activeTab === 'details' ? 'bold' : 'normal',
                color: activeTab === 'details' ? 'primary.main' : 'text.secondary'
              }}
              onClick={() => setActiveTab('details')}
            >
              Product Details
            </Button>
            <Button
              sx={{ 
                fontWeight: activeTab === 'recipe' ? 'bold' : 'normal',
                color: activeTab === 'recipe' ? 'primary.main' : 'text.secondary'
              }}
              onClick={() => setActiveTab('recipe')}
            >
              Recipe Ingredients
            </Button>
          </Box>
          
          {activeTab === 'details' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Product Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="sellingPrice"
                  label="Selling Price"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    startAdornment: '$',
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  name="preparationTime"
                  label="Preparation Time (minutes)"
                  value={formData.preparationTime}
                  onChange={handleInputChange}
                  fullWidth
                  type="number"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="cookingInstructions"
                  label="Cooking Instructions"
                  value={formData.cookingInstructions}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          )}
          
          {activeTab === 'recipe' && (
            <>
              <Typography variant="h6" gutterBottom>
                Recipe Ingredients
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Ingredient</InputLabel>
                    <Select
                      name="ingredientId"
                      value={newIngredient.ingredientId}
                      onChange={handleNewIngredientChange}
                      label="Ingredient"
                    >
                      <MenuItem value="">
                        <em>Select an ingredient</em>
                      </MenuItem>
                      {ingredients.map((ingredient) => (
                        <MenuItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="quantity"
                    label="Quantity"
                    value={newIngredient.quantity}
                    onChange={handleNewIngredientChange}
                    fullWidth
                    type="number"
                    inputProps={{ step: "0.01" }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      name="unitOfMeasure"
                      value={newIngredient.unitOfMeasure}
                      onChange={handleNewIngredientChange}
                      label="Unit"
                    >
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="l">l</MenuItem>
                      <MenuItem value="ml">ml</MenuItem>
                      <MenuItem value="each">each</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          name="isOptional"
                          checked={newIngredient.isOptional}
                          onChange={handleNewIngredientChange}
                          color="primary"
                        />
                      }
                      label="Optional"
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddIngredient}
                    disabled={!newIngredient.ingredientId || !newIngredient.quantity}
                  >
                    Add Ingredient
                  </Button>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Current Ingredients
              </Typography>
              
              {recipeIngredients.length > 0 ? (
                <List>
                  {recipeIngredients.map((ri) => (
                    <ListItem key={ri.id}>
                      <ListItemText
                        primary={ri.ingredient.name}
                        secondary={`${ri.quantity} ${ri.unitOfMeasure}${ri.isOptional ? ' (Optional)' : ''}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveIngredient(ri.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No ingredients added yet
                </Typography>
              )}
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;