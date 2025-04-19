// src/pages/Dashboard.js
// Update the imports to include Link and Inventory
import React, { useContext, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Box, Typography, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Menu as MenuIcon, Dashboard as DashboardIcon, Inventory as InventoryIcon, Receipt as ReceiptIcon, People as PeopleIcon, InsertChart as ChartIcon, ExitToApp as LogoutIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import Inventory from './Inventory';
import POSTerminal from './POSTerminal'; 
import AnalyticsDashboard from './AnalyticsDashboard';

const drawerWidth = 240;

const DashboardContent = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Welcome to the Smart POS System
      </Typography>
      <Typography paragraph>
        This is your central hub for managing your business. Use the navigation menu to access different features.
      </Typography>
      <Typography paragraph>
        Here you can manage inventory, process orders, track sales, and analyze business performance.
      </Typography>
    </Box>
  );
};

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Smart POS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/dashboard/inventory">
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="Inventory" />
        </ListItem>
        <ListItem button component={Link} to="/dashboard/orders">
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Orders" />
        </ListItem>
        <ListItem button component={Link} to="/dashboard/customers">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Customers" />
        </ListItem>
        <ListItem button component={Link} to="/dashboard/analytics">
          <ListItemIcon>
            <ChartIcon />
          </ListItemIcon>
          <ListItemText primary="Analytics" />
        </ListItem>
        <ListItem button component={Link} to="/dashboard/pos">
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="POS Terminal" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={logout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Smart POS System
          </Typography>
          <Typography variant="body1">
            Welcome, {user?.email}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/pos" element={<POSTerminal />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          {/* Add more routes for other features */}
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;