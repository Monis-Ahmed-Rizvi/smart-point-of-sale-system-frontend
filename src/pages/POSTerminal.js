import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  TextField, 
  Divider, 
  Card, 
  CardContent, 
  CardActionArea,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Remove as RemoveIcon, 
  Delete as DeleteIcon, 
  ShoppingCart as CartIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import axios from 'axios';

// Create API service
const API_URL = 'http://localhost:8080/api';

// Add auth token to all requests
const authAxios = axios.create();
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const POSTerminal = () => {
  // State variables
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0); // 0 means all
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Default to null, will set to guest later
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        let categoriesData;
        try {
          const categoriesResponse = await authAxios.get(`${API_URL}/products/categories`);
          categoriesData = categoriesResponse.data;
        } catch (err) {
          console.error('Failed to fetch categories, using mock data', err);
          categoriesData = [
            { id: 1, name: 'Main Course' },
            { id: 2, name: 'Appetizers' },
            { id: 3, name: 'Desserts' },
            { id: 4, name: 'Beverages' }
          ];
        }
        setCategories(categoriesData);
        
        // Fetch products
        let productsData;
        try {
          const productsResponse = await authAxios.get(`${API_URL}/products`);
          productsData = productsResponse.data;
        } catch (err) {
          console.error('Failed to fetch products, using mock data', err);
          productsData = [
            { id: 1, name: 'Beef Stroganoff', price: 18.95, category_id: 1, image_url: '/api/placeholder/80/80' },
            { id: 2, name: 'Chicken Caesar Salad', price: 12.95, category_id: 1, image_url: '/api/placeholder/80/80' },
            { id: 3, name: 'Chocolate Cake', price: 6.95, category_id: 3, image_url: '/api/placeholder/80/80' },
            { id: 4, name: 'Mozzarella Sticks', price: 8.95, category_id: 2, image_url: '/api/placeholder/80/80' },
            { id: 5, name: 'Iced Tea', price: 3.95, category_id: 4, image_url: '/api/placeholder/80/80' },
            { id: 6, name: 'Coffee', price: 2.95, category_id: 4, image_url: '/api/placeholder/80/80' },
            { id: 7, name: 'Cheesecake', price: 7.95, category_id: 3, image_url: '/api/placeholder/80/80' },
            { id: 8, name: 'Garlic Bread', price: 4.95, category_id: 2, image_url: '/api/placeholder/80/80' }
          ];
        }
        setProducts(productsData);
        
        // Fetch customers
        let customersData;
        try {
          const customersResponse = await authAxios.get(`${API_URL}/customers`);
          customersData = customersResponse.data;
        } catch (err) {
          console.error('Failed to fetch customers, using mock data', err);
          customersData = [
            { id: 1, name: 'John Smith', email: 'john@example.com', phone: '555-1234', loyalty_points: 150 },
            { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-5678', loyalty_points: 75 },
            { id: 3, name: 'Guest', email: '', phone: '', loyalty_points: 0 }
          ];
        }
        setCustomers(customersData);
        
        // Set default selected customer to Guest
        const guestCustomer = customersData.find(c => c.name === 'Guest') || customersData[0];
        setSelectedCustomer(guestCustomer);
      } catch (err) {
        setDataError('Failed to load data. Please refresh the page.');
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Search customers when query changes
  useEffect(() => {
    if (!customerSearchQuery) return;
    
    const searchCustomers = async () => {
      try {
        const response = await authAxios.get(`${API_URL}/customers/search?query=${customerSearchQuery}`);
        setCustomers(response.data);
      } catch (err) {
        console.error('Error searching customers:', err);
        // Don't update customers state on error
      }
    };
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchCustomers();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [customerSearchQuery]);
  
  // Filter products based on selected category and search query
  const filteredProducts = products.filter(product => 
    (selectedCategory === 0 || product.category_id === selectedCategory) &&
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Increase quantity if already in cart
      const updatedCart = cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, { product, quantity: 1 }]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (productId) => {
    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      // Decrease quantity
      const updatedCart = cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      );
      setCart(updatedCart);
    } else {
      // Remove item completely
      setCart(cart.filter(item => item.product.id !== productId));
    }
  };

  // Delete item from cart
  const deleteFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };
  
  // Calculate cart subtotal
  const subtotal = cart.reduce(
    (total, item) => total + (item.product.price * item.quantity), 
    0
  );
  
  // Calculate tax (let's assume 8%)
  const tax = subtotal * 0.08;
  
  // Calculate total
  const total = subtotal + tax;
  
  // Handle checkout
  const handleCheckout = () => {
    setIsCheckoutDialogOpen(true);
  };
  
  // Process order - now with real API call
  const processOrder = async () => {
    if (!selectedCustomer) {
      setOrderError('Please select a customer');
      return;
    }
    
    if (cart.length === 0) {
      setOrderError('Cart is empty');
      return;
    }
    
    setLoading(true);
    setOrderError('');

    try {
      const orderData = {
        customer_id: selectedCustomer.id,
        status: 'completed',
        subtotal: subtotal,
        tax: tax,
        discount: 0,
        total: total,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price
        }))
      };
      
      // Call the API
      await authAxios.post(`${API_URL}/orders`, orderData);
      
      setOrderSuccess(true);
      
      // Reset after a short delay
      setTimeout(() => {
        setCart([]);
        setIsCheckoutDialogOpen(false);
        setOrderSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error processing order:', err);
      setOrderError('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open customer selection dialog
  const openCustomerDialog = () => {
    setCustomerSearchQuery('');
    setCustomerDialogOpen(true);
  };

  // Select customer and close dialog
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDialogOpen(false);
  };
  
  // Handle customer search
  const handleCustomerSearch = (e) => {
    setCustomerSearchQuery(e.target.value);
  };
  
  if (loading && !products.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        POS Terminal
      </Typography>
      
      {dataError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {dataError}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left panel - Product selection */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Search and category filter */}
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                  ),
                }}
                size="small"
                sx={{ mr: 2 }}
              />
            </Box>
            
            {/* Category tabs */}
            <Box sx={{ display: 'flex', mb: 2, overflowX: 'auto' }}>
              <Button 
                variant={selectedCategory === 0 ? "contained" : "outlined"} 
                onClick={() => setSelectedCategory(0)}
                startIcon={<CategoryIcon />}
                sx={{ mr: 1, whiteSpace: 'nowrap' }}
              >
                All
              </Button>
              
              {categories.map(category => (
                <Button 
                  key={category.id} 
                  variant={selectedCategory === category.id ? "contained" : "outlined"}
                  onClick={() => setSelectedCategory(category.id)}
                  sx={{ mr: 1, whiteSpace: 'nowrap' }}
                >
                  {category.name}
                </Button>
              ))}
            </Box>
            
            {/* Products grid */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Grid container spacing={2}>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <Grid item xs={6} sm={4} md={3} key={product.id}>
                      <Card onClick={() => addToCart(product)}>
                        <CardActionArea>
                          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
                            <img 
                              src={product.image_url || '/api/placeholder/80/80'} 
                              alt={product.name} 
                              onError={(e) => {
                                e.target.src = '/api/placeholder/80/80';
                              }}
                            />
                          </Box>
                          <CardContent sx={{ p: 1, pb: '12px !important' }}>
                            <Typography variant="subtitle2" noWrap>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${product.price.toFixed(2)}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Box sx={{ width: '100%', textAlign: 'center', py: 10 }}>
                    <Typography variant="body1" color="text.secondary">
                      No products found
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right panel - Cart and checkout */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Customer info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                {selectedCustomer?.name || 'Select Customer'} {selectedCustomer?.loyalty_points > 0 && (
                  <Chip 
                    label={`${selectedCustomer.loyalty_points} pts`} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Button variant="outlined" size="small" onClick={openCustomerDialog}>
                Change
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {/* Cart header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Badge 
                badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} 
                color="primary"
              >
                <CartIcon />
              </Badge>
              <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                Cart
              </Typography>
              {cart.length > 0 && (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small" 
                  onClick={() => setCart([])}
                >
                  Clear
                </Button>
              )}
            </Box>
            
            {/* Cart items */}
            <List sx={{ overflow: 'auto', flexGrow: 1 }}>
              {cart.length > 0 ? (
                cart.map((item, index) => (
                  <ListItem key={index} divider={index < cart.length - 1}>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`$${item.product.price.toFixed(2)} x ${item.quantity}`}
                    />
                    <Typography variant="body2" sx={{ minWidth: '70px', textAlign: 'right', mr: 1 }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                    <ListItemSecondaryAction>
                      <IconButton size="small" onClick={() => removeFromCart(item.product.id)}>
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => addToCart(item.product)}>
                        <AddIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" edge="end" onClick={() => deleteFromCart(item.product.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cart is empty
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click on products to add them to the cart
                  </Typography>
                </Box>
              )}
            </List>
            
            {/* Totals */}
            <Box sx={{ mt: 'auto', pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax (8%):</Typography>
                <Typography variant="body1">${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${total.toFixed(2)}</Typography>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                size="large" 
                startIcon={<PaymentIcon />}
                onClick={handleCheckout}
                disabled={cart.length === 0 || !selectedCustomer}
              >
                Checkout
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Checkout Dialog */}
      <Dialog
        open={isCheckoutDialogOpen}
        onClose={() => !loading && !orderSuccess && setIsCheckoutDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Order</DialogTitle>
        <DialogContent>
          {orderError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {orderError}
            </Alert>
          )}
          
          {orderSuccess ? (
            <Alert severity="success" sx={{ my: 2 }}>
              Order processed successfully!
            </Alert>
          ) : (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Customer: {selectedCustomer?.name || 'N/A'}
              </Typography>
              
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Summary:
                </Typography>
                <List dense>
                  {cart.map((item, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`${item.quantity}x ${item.product.name}`}
                        secondary={`$${item.product.price.toFixed(2)} each`}
                      />
                      <Typography variant="body2">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal:</Typography>
                <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Tax (8%):</Typography>
                <Typography variant="body1">${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">${total.toFixed(2)}</Typography>
              </Box>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="credit">Credit Card</MenuItem>
                  <MenuItem value="debit">Debit Card</MenuItem>
                  <MenuItem value="mobile">Mobile Payment</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          {!orderSuccess && (
            <Button 
              onClick={() => setIsCheckoutDialogOpen(false)} 
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          {!orderSuccess ? (
            <Button 
              variant="contained" 
              onClick={processOrder} 
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Processing...' : 'Complete Payment'}
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={() => setIsCheckoutDialogOpen(false)}
            >
              Done
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Customer Selection Dialog */}
      <Dialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Customer</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search customers..."
            margin="normal"
            value={customerSearchQuery}
            onChange={handleCustomerSearch}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              ),
            }}
          />
          
          <List>
            {customers.map(customer => (
              <ListItem 
                button 
                key={customer.id} 
                onClick={() => selectCustomer(customer)}
                selected={selectedCustomer?.id === customer.id}
              >
                <ListItemText
                  primary={customer.name}
                  secondary={customer.email || 'No email'}
                />
                {customer.loyalty_points > 0 && (
                  <Chip 
                    label={`${customer.loyalty_points} pts`} 
                    size="small" 
                    color="primary" 
                  />
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POSTerminal;