'use client'

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar } from '@mui/material';
import { firestore, auth } from '@/app/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { signUp, login, logout } from '@/app/auth';
import AddIcon from '@mui/icons-material/Add';

// Define styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#ffffff',
  borderRadius: '8px',
  boxShadow: 24,
  p: 4,
};

const containerStyle = {
  display: 'flex',
  height: '100vh',
  backgroundColor: '#f4f6f8',
  fontFamily: 'Arial, sans-serif',
};

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#81c784', // Light green
  color: '#ffffff',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const mainContentStyle = {
  flexGrow: 1,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const tableStyle = {
  marginTop: '20px',
  borderRadius: '8px',
  overflow: 'hidden',
};

const tableHeaderStyle = {
  backgroundColor: '#66bb6a', // Darker light green
  color: '#ffffff',
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [userId, setUserId] = useState('');

  const updateInventory = async () => {
    if (!userId) return; // No user logged in
    const snapshot = query(collection(firestore, 'users', userId, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    if (isLoggedIn) {
      updateInventory();
    }
  }, [isLoggedIn, userId]);

  const addItem = async (item) => {
    if (!item) return; // Prevent adding empty items
    const docRef = doc(collection(firestore, 'users', userId, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory(); // Refresh inventory after adding
    setItemName(''); // Clear input field after adding
    handleClose(); // Close the modal after adding
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'users', userId, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAuth = async () => {
    try {
      let userCredential;
      if (authMode === 'signup') {
        userCredential = await signUp(email, password);
      } else {
        userCredential = await login(email, password);
      }
      setUserId(userCredential.user.uid);
      setIsLoggedIn(true);
      setSnackbarMessage(`${authMode === 'signup' ? 'Sign up' : 'Login'} successful!`);
    } catch (error) {
      setSnackbarMessage(`Error: ${error.message}`);
    }
    setSnackbarOpen(true);
    setEmail('');
    setPassword('');
  };

  const handleLogout = async () => {
    await logout();
    setIsLoggedIn(false);
    setUserId('');
    setSnackbarMessage('Logged out successfully!');
    setSnackbarOpen(true);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={containerStyle}>
      <Box sx={sidebarStyle}>
        <Typography variant="h4">SmartStock</Typography>
        {isLoggedIn ? (
          <>
            <Button variant="text" color="inherit" onClick={handleOpen} startIcon={<AddIcon />}>
              Add Item
            </Button>
            <Button variant="text" color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="text" color="inherit" onClick={handleOpen}>
            Login / Sign Up
          </Button>
        )}
      </Box>

      <Box sx={mainContentStyle}>
        <Typography variant="h4" color="#333">
          Items
        </Typography>

        {/* Search Bar */}
        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ marginBottom: '20px' }}
        />

        {/* Login/Signup Modal */}
        <Modal
          open={!isLoggedIn}
          onClose={() => setOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h5" component="h2" color="#66bb6a">
              {authMode === 'signup' ? 'Sign Up' : 'Login'}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button variant="contained" onClick={handleAuth}>
                {authMode === 'signup' ? 'Sign Up' : 'Login'}
              </Button>
              <Button onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}>
                Switch to {authMode === 'signup' ? 'Login' : 'Sign Up'}
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Inventory Table */}
        {isLoggedIn && (
          <>
            <TableContainer component={Paper} sx={tableStyle}>
              <Table>
                <TableHead>
                  <TableRow sx={tableHeaderStyle}>
                    <TableCell align="left" sx={{ color: '#ffffff' }}>Item Name</TableCell>
                    <TableCell align="center" sx={{ color: '#ffffff' }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ color: '#ffffff' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map(({ name, quantity }) => (
                    <TableRow key={name}>
                      <TableCell align="left">{name.charAt(0).toUpperCase() + name.slice(1)}</TableCell>
                      <TableCell align="center">{quantity}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          onClick={() => removeItem(name)}
                          color="error"
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Add Item Modal */}
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h5" component="h2" color="#66bb6a">
                  Add Item
                </Typography>
                <Stack width="100%" direction={'row'} spacing={2}>
                  <TextField
                    id="outlined-basic"
                    label="Item"
                    variant="outlined"
                    fullWidth
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    sx={{ bgcolor: '#66bb6a', '&:hover': { bgcolor: '#388e3c' } }} // Darker green on hover
                    onClick={() => addItem(itemName)}
                  >
                    Add
                  </Button>
                </Stack>
              </Box>
            </Modal>
          </>
        )}

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Box>
  );
}