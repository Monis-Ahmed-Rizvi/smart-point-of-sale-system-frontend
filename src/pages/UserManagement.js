import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
    isActive: true
  });
  const [newPassword, setNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authAxios.get(`${API_URL}/auth/users`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
      
      // Mock data for development
      setUsers([
        { id: 1, firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'admin', isActive: true },
        { id: 2, firstName: 'John', lastName: 'Manager', email: 'manager@example.com', role: 'manager', isActive: true },
        { id: 3, firstName: 'Jane', lastName: 'Cashier', email: 'cashier@example.com', role: 'cashier', isActive: true },
        { id: 4, firstName: 'Bob', lastName: 'Chef', email: 'chef@example.com', role: 'chef', isActive: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setCurrentUser({ ...user, password: '' });
      setIsEditing(true);
    } else {
      setCurrentUser({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        password: '',
        isActive: true
      });
      setIsEditing(false);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenChangePasswordDialog = (user) => {
    setCurrentUser(user);
    setNewPassword('');
    setChangePasswordDialogOpen(true);
  };

  const handleCloseChangePasswordDialog = () => {
    setChangePasswordDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setCurrentUser({
      ...currentUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveUser = async () => {
    // Validate fields
    if (!currentUser.firstName || !currentUser.lastName || !currentUser.email || !currentUser.role) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!isEditing && !currentUser.password) {
      setError('Password is required for new users');
      return;
    }
    
    try {
      let response;
      
      if (isEditing) {
        // Update existing user
        response = await authAxios.put(`${API_URL}/auth/users/${currentUser.id}`, currentUser);
      } else {
        // Create new user
        response = await authAxios.post(`${API_URL}/auth/users`, currentUser);
      }
      
      // Refresh user list
      fetchUsers();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Failed to save user');
      
      // For development, update the users list anyway
      if (isEditing) {
        setUsers(users.map(u => u.id === currentUser.id ? currentUser : u));
      } else {
        const newUser = {
          ...currentUser,
          id: Math.max(...users.map(u => u.id)) + 1
        };
        setUsers([...users, newUser]);
      }
      setDialogOpen(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    
    try {
      await authAxios.post(`${API_URL}/auth/users/${currentUser.id}/change-password`, {
        newPassword: newPassword
      });
      
      setChangePasswordDialogOpen(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password');
      setChangePasswordDialogOpen(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await authAxios.delete(`${API_URL}/auth/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user');
        
        // For development, remove from the list anyway
        setUsers(users.filter(u => u.id !== userId));
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      await authAxios.patch(`${API_URL}/auth/users/${user.id}/toggle-status`);
      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError('Failed to update user status');
      
      // For development, update the status anyway
      setUsers(users.map(u => {
        if (u.id === user.id) {
          return { ...u, isActive: !u.isActive };
        }
        return u;
      }));
    }
  };

  if (loading && users.length === 0) {
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
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      color={
                        user.role === 'admin' ? 'error' :
                        user.role === 'manager' ? 'warning' :
                        'primary'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                      onClick={() => handleToggleUserStatus(user)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(user)}
                      title="Edit User"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleOpenChangePasswordDialog(user)}
                      title="Change Password"
                    >
                      <LockIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={currentUser.firstName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={currentUser.lastName}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={currentUser.email}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={currentUser.role}
                  onChange={handleInputChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="cashier">Cashier</MenuItem>
                  <MenuItem value="chef">Chef</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="isActive"
                  value={currentUser.isActive}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {!isEditing && (
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={currentUser.password}
                  onChange={handleInputChange}
                  fullWidth
                  required
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onClose={handleCloseChangePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Changing password for: {currentUser?.firstName} {currentUser?.lastName}
          </Typography>
          <TextField
            name="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChangePasswordDialog}>Cancel</Button>
          <Button onClick={handleChangePassword} variant="contained" color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;