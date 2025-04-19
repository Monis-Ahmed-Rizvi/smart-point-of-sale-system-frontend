import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';

// Add auth token to all requests
const authAxios = axios.create();
authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const API_URL = 'http://localhost:8080/api/analytics';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsDashboard = () => {
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // day, week, month, year
  
  useEffect(() => {
    fetchData();
  }, [timeRange]);
  
  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Calculate dates based on time range
      const endDate = new Date().toISOString().split('T')[0];
      let startDate;
      
      switch (timeRange) {
        case 'day':
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'week':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'month':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        case 'year':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
      
      // Fetch sales analytics
      const salesResponse = await authAxios.get(`${API_URL}/sales?startDate=${startDate}&endDate=${endDate}`);
      setSalesData(salesResponse.data);
      
      // Fetch inventory analytics
      const inventoryResponse = await authAxios.get(`${API_URL}/inventory?startDate=${startDate}&endDate=${endDate}`);
      setInventoryData(inventoryResponse.data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
      
      // Mock data for testing when API fails
      setSalesData({
        totalSales: 12458.75,
        totalOrders: 327,
        averageOrderValue: 38.10,
        topProducts: [
          { productName: 'Beef Stroganoff', revenue: 3795.00, quantity: 200 },
          { productName: 'Chicken Caesar Salad', revenue: 2590.00, quantity: 180 },
          { productName: 'Chocolate Cake', revenue: 1390.00, quantity: 150 },
          { productName: 'Iced Tea', revenue: 1185.00, quantity: 300 },
          { productName: 'Cheesecake', revenue: 1192.50, quantity: 130 }
        ],
        salesByCategory: {
          'Main Course': 6385.00,
          'Appetizers': 1790.00,
          'Desserts': 2582.50,
          'Beverages': 1701.25
        },
        dailySales: [
          { date: '2025-04-01', totalSales: 427.50, orderCount: 12 },
          { date: '2025-04-02', totalSales: 375.25, orderCount: 10 },
          { date: '2025-04-03', totalSales: 512.00, orderCount: 15 },
          { date: '2025-04-04', totalSales: 625.50, orderCount: 18 },
          { date: '2025-04-05', totalSales: 725.00, orderCount: 20 },
          { date: '2025-04-06', totalSales: 489.75, orderCount: 14 },
          { date: '2025-04-07', totalSales: 398.25, orderCount: 11 }
        ]
      });
      
      setInventoryData({
        totalIngredients: 42,
        lowStockIngredients: 5,
        mostUsedIngredients: [
          { ingredientName: 'Beef', usageQuantity: 25.5, currentStock: 10.2 },
          { ingredientName: 'Chicken', usageQuantity: 22.7, currentStock: 15.3 },
          { ingredientName: 'Flour', usageQuantity: 18.5, currentStock: 8.7 },
          { ingredientName: 'Chocolate', usageQuantity: 15.2, currentStock: 5.5 },
          { ingredientName: 'Lettuce', usageQuantity: 12.8, currentStock: 4.2 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };
  
  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Prepare data for category pie chart
  const categoryData = salesData?.salesByCategory ? 
    Object.entries(salesData.salesByCategory).map(([name, value]) => ({ name, value })) : [];
  
  // Prepare data for daily sales chart
  const dailyData = salesData?.dailySales ? 
    salesData.dailySales.map(item => ({
      ...item,
      date: format(new Date(item.date), 'MMM dd')
    })) : [];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Analytics Dashboard
        </Typography>
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="day">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
            <MenuItem value="year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* KPI Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Sales
              </Typography>
              <Typography variant="h4">
                {salesData ? formatCurrency(salesData.totalSales) : '$0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {salesData ? salesData.totalOrders : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Avg. Order Value
              </Typography>
              <Typography variant="h4">
                {salesData ? formatCurrency(salesData.averageOrderValue) : '$0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4">
                {inventoryData ? inventoryData.lowStockIngredients : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales Trend
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={dailyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Sales" />
                <Line type="monotone" dataKey="orderCount" stroke="#82ca9d" name="Orders" yAxisId="right" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Revenue by Category */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={salesData?.topProducts || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                <Bar dataKey="quantity" fill="#82ca9d" name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Inventory Usage */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Most Used Ingredients
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={inventoryData?.mostUsedIngredients || []}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="ingredientName" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="usageQuantity" fill="#8884d8" name="Usage" />
                <Bar dataKey="currentStock" fill="#82ca9d" name="Current Stock" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;