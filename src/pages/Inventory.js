// src/pages/Inventory.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  CircularProgress, 
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import inventoryApi from '../api/inventoryApi';

const Inventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    description: '',
    currentStock: 0,
    unitOfMeasure: 'kg',
    minimumStock: 0,
    costPerUnit: 0
  });
  const [isEdit, setIsEdit] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [stockUpdate, setStockUpdate] = useState({
    ingredientId: null,
    quantity: 0,
    transactionType: 'purchase',
    notes: ''
  });

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAllIngredients();
      setIngredients(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch ingredients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleOpen = (ingredient = null) => {
    if (ingredient) {
      setCurrentIngredient(ingredient);
      setIsEdit(true);
    } else {
      setCurrentIngredient({
        name: '',
        description: '',
        currentStock: 0,
        unitOfMeasure: 'kg',
        minimumStock: 0,
        costPerUnit: 0
      });
      setIsEdit(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleStockDialogOpen = (ingredient) => {
    setStockUpdate({
      ingredientId: ingredient.id,
      quantity: 0,
      transactionType: 'purchase',
      notes: ''
    });
    setStockDialogOpen(true);
  };

  const handleStockDialogClose = () => {
    setStockDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentIngredient({
      ...currentIngredient,
      [name]: name === 'currentStock' || name === 'minimumStock' || name === 'costPerUnit' 
        ? parseFloat(value) 
        : value
    });
  };

  const handleStockInputChange = (e) => {
    const { name, value } = e.target;
    setStockUpdate({
      ...stockUpdate,
      [name]: name === 'quantity' ? parseFloat(value) : value
    });
  };

  const handleSave = async () => {
    try {
      await inventoryApi.saveIngredient(currentIngredient);
      handleClose();
      fetchIngredients();
    } catch (err) {
      setError('Failed to save ingredient');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await inventoryApi.deleteIngredient(id);
        fetchIngredients();
      } catch (err) {
        setError('Failed to delete ingredient');
        console.error(err);
      }
    }
  };

  const handleUpdateStock = async () => {
    try {
      await inventoryApi.updateStock(
        stockUpdate.ingredientId,
        stockUpdate.quantity,
        stockUpdate.transactionType,
        stockUpdate.notes
      );
      handleStockDialogClose();
      fetchIngredients();
    } catch (err) {
      setError('Failed to update stock');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" component="h1">
          Inventory Management
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={fetchIngredients}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
          >
            Add Ingredient
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Current Stock</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Minimum Stock</TableCell>
              <TableCell>Cost Per Unit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <TableRow 
                  key={ingredient.id}
                  sx={{ 
                    backgroundColor: ingredient.currentStock <= ingredient.minimumStock 
                      ? 'rgba(255, 0, 0, 0.1)' 
                      : 'inherit' 
                  }}
                >
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>{ingredient.description}</TableCell>
                  <TableCell>{ingredient.currentStock}</TableCell>
                  <TableCell>{ingredient.unitOfMeasure}</TableCell>
                  <TableCell>{ingredient.minimumStock}</TableCell>
                  <TableCell>${ingredient.costPerUnit.toFixed(2)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleStockDialogOpen(ingredient)} color="primary" size="small">
                      <RefreshIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpen(ingredient)} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(ingredient.id)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">No ingredients found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Ingredient Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Ingredient' : 'Add Ingredient'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Name"
                fullWidth
                value={currentIngredient.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={currentIngredient.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="currentStock"
                label="Current Stock"
                type="number"
                fullWidth
                value={currentIngredient.currentStock}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Unit of Measure</InputLabel>
                <Select
                  name="unitOfMeasure"
                  value={currentIngredient.unitOfMeasure}
                  label="Unit of Measure"
                  onChange={handleInputChange}
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="g">g</MenuItem>
                  <MenuItem value="l">l</MenuItem>
                  <MenuItem value="ml">ml</MenuItem>
                  <MenuItem value="each">each</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="minimumStock"
                label="Minimum Stock"
                type="number"
                fullWidth
                value={currentIngredient.minimumStock}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="costPerUnit"
                label="Cost Per Unit"
                type="number"
                fullWidth
                value={currentIngredient.costPerUnit}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Update Stock Dialog */}
      <Dialog open={stockDialogOpen} onClose={handleStockDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                fullWidth
                value={stockUpdate.quantity}
                onChange={handleStockInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  name="transactionType"
                  value={stockUpdate.transactionType}
                  label="Transaction Type"
                  onChange={handleStockInputChange}
                >
                  <MenuItem value="purchase">Purchase</MenuItem>
                  <MenuItem value="usage">Usage</MenuItem>
                  <MenuItem value="adjustment">Adjustment</MenuItem>
                  <MenuItem value="waste">Waste</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={2}
                value={stockUpdate.notes}
                onChange={handleStockInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStockDialogClose}>Cancel</Button>
          <Button onClick={handleUpdateStock} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;