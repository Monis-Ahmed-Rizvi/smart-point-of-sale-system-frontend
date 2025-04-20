import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

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

const OrdersManagement = () => {
  // State variables
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');
  
  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Filter orders when search query or filters change
  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, statusFilter, dateFilter]);
  
  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authAxios.get(`${API_URL}/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders. Please try again.');
      
      // Mock data for development
      setOrders([
        {
          id: 1,
          customer: { id: 1, name: 'John Smith', email: 'john@example.com', phone: '555-1234' },
          employee: { id: 1, firstName: 'Emma', lastName: 'Johnson' },
          orderDate: '2025-04-16T14:35:22',
          status: 'completed',
          subtotal: 32.85,
          tax: 2.63,
          discount: 0,
          total: 35.48,
          paymentMethod: 'credit',
          orderItems: [
            { id: 1, product: { id: 1, name: 'Beef Stroganoff' }, quantity: 1, unitPrice: 18.95 },
            { id: 2, product: { id: 6, name: 'Coffee' }, quantity: 2, unitPrice: 2.95 },
            { id: 3, product: { id: 8, name: 'Garlic Bread' }, quantity: 1, unitPrice: 4.95 }
          ]
        },
        {
          id: 2,
          customer: { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-5678' },
          employee: { id: 1, firstName: 'Emma', lastName: 'Johnson' },
          orderDate: '2025-04-16T16:42:05',
          status: 'pending',
          subtotal: 27.85,
          tax: 2.23,
          discount: 0,
          total: 30.08,
          paymentMethod: 'cash',
          orderItems: [
            { id: 4, product: { id: 2, name: 'Chicken Caesar Salad' }, quantity: 1, unitPrice: 12.95 },
            { id: 5, product: { id: 3, name: 'Chocolate Cake' }, quantity: 1, unitPrice: 6.95 },
            { id: 6, product: { id: 5, name: 'Iced Tea' }, quantity: 2, unitPrice: 3.95 }
          ]
        },
        {
          id: 3,
          customer: { id: 3, name: 'Guest', email: '', phone: '' },
          employee: { id: 2, firstName: 'Michael', lastName: 'Brown' },
          orderDate: '2025-04-17T10:15:33',
          status: 'cancelled',
          subtotal: 15.90,
          tax: 1.27,
          discount: 0,
          total: 17.17,
          paymentMethod: 'debit',
          orderItems: [
            { id: 7, product: { id: 4, name: 'Mozzarella Sticks' }, quantity: 1, unitPrice: 8.95 },
            { id: 8, product: { id: 5, name: 'Iced Tea' }, quantity: 1, unitPrice: 3.95 },
            { id: 9, product: { id: 6, name: 'Coffee' }, quantity: 1, unitPrice: 2.95 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...orders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        (order.customer?.name?.toLowerCase().includes(query)) ||
        (order.id.toString().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      let filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(today.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(order => 
        new Date(order.orderDate) >= filterDate
      );
    }
    
    setFilteredOrders(filtered);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setCurrentStatus(order.status);
    setOrderDetailsOpen(true);
  };
  
  const handleUpdateStatus = async () => {
    if (!selectedOrder || currentStatus === selectedOrder.status) {
      return;
    }
    
    try {
      await authAxios.patch(`${API_URL}/orders/${selectedOrder.id}/status/${currentStatus}`);
      
      // Update local state after successful update
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id
          ? { ...order, status: currentStatus }
          : order
      );
      
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: currentStatus });
      
      // Show success message or notification
    } catch (err) {
      console.error('Failed to update order status:', err);
      // Show error message
      
      // For development, update the state anyway
      const updatedOrders = orders.map(order => 
        order.id === selectedOrder.id
          ? { ...order, status: currentStatus }
          : order
      );
      
      setOrders(updatedOrders);
      setSelectedOrder({ ...selectedOrder, status: currentStatus });
    }
  };
  
  const handlePrintReceipt = (orderId) => {
    // In a real implementation, this would open a print dialog with receipt
    window.print();
  };
  
  const handleEmailReceipt = (order) => {
    // In a real implementation, this would send email receipt
    alert(`Receipt sent to ${order.customer.email}`);
  };
  
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };
  
  const formatDateTime = (dateTimeStr) => {
    try {
      return format(new Date(dateTimeStr), 'MMM dd, yyyy hh:mm a');
    } catch (err) {
      return dateTimeStr;
    }
  };
  
  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'pending':
        color = 'warning';
        break;
      case 'completed':
        color = 'success';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color} 
        size="small" 
      />
    );
  };
  
  if (loading && !orders.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Orders Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by order # or customer"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Date</InputLabel>
              <Select
                value={dateFilter}
                label="Date"
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />} 
              onClick={fetchOrders}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Date & Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                    <TableCell>{order.customer?.name || 'Guest'}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                    </TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewOrder(order)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handlePrintReceipt(order.id)}
                        title="Print Receipt"
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                      {order.customer?.email && (
                        <IconButton
                          size="small"
                          onClick={() => handleEmailReceipt(order)}
                          title="Email Receipt"
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              Order #{selectedOrder.id} Details
              <Typography variant="subtitle2" color="text.secondary">
                {formatDateTime(selectedOrder.orderDate)}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Customer Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customer Information
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.customer?.name || 'Guest'}
                  </Typography>
                  {selectedOrder.customer?.email && (
                    <Typography variant="body2" color="text.secondary">
                      Email: {selectedOrder.customer.email}
                    </Typography>
                  )}
                  {selectedOrder.customer?.phone && (
                    <Typography variant="body2" color="text.secondary">
                      Phone: {selectedOrder.customer.phone}
                    </Typography>
                  )}
                </Grid>
                
                {/* Employee Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Employee Information
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.employee?.firstName} {selectedOrder.employee?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment: {selectedOrder.paymentMethod.charAt(0).toUpperCase() + selectedOrder.paymentMethod.slice(1)}
                  </Typography>
                </Grid>
                
                {/* Status Update */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      Status:
                    </Typography>
                    <FormControl sx={{ minWidth: 200 }}>
                      <Select
                        value={currentStatus}
                        onChange={(e) => setCurrentStatus(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                    <Button 
                      variant="contained" 
                      sx={{ ml: 2 }}
                      onClick={handleUpdateStatus}
                      disabled={currentStatus === selectedOrder.status}
                    >
                      Update Status
                    </Button>
                  </Box>
                </Grid>
                
                {/* Order Items */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Order Items
                  </Typography>
                  <List>
                    {selectedOrder.orderItems.map((item) => (
                      <ListItem key={item.id} divider>
                        <ListItemText
                          primary={`${item.quantity}x ${item.product.name}`}
                          secondary={`${formatCurrency(item.unitPrice)} each`}
                        />
                        <Typography variant="body2">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                {/* Order Summary */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200, mb: 1 }}>
                      <Typography variant="body1">Subtotal:</Typography>
                      <Typography variant="body1">{formatCurrency(selectedOrder.subtotal)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200, mb: 1 }}>
                      <Typography variant="body1">Tax:</Typography>
                      <Typography variant="body1">{formatCurrency(selectedOrder.tax)}</Typography>
                    </Box>
                    {selectedOrder.discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200, mb: 1 }}>
                        <Typography variant="body1">Discount:</Typography>
                        <Typography variant="body1">{formatCurrency(selectedOrder.discount)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ width: 200, my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: 200, mb: 1 }}>
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6">{formatCurrency(selectedOrder.total)}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => handlePrintReceipt(selectedOrder.id)} startIcon={<PrintIcon />}>
                Print Receipt
              </Button>
              {selectedOrder.customer?.email && (
                <Button 
                  onClick={() => handleEmailReceipt(selectedOrder)} 
                  startIcon={<EmailIcon />}
                >
                  Email Receipt
                </Button>
              )}
              <Button onClick={() => setOrderDetailsOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default OrdersManagement;