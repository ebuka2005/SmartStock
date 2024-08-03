'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import { firestore } from '@/app/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'
import AddIcon from '@mui/icons-material/Add'

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
}

const containerStyle = {
  display: 'flex',
  height: '100vh',
  backgroundColor: '#f4f6f8',
  fontFamily: 'Arial, sans-serif',
}

const sidebarStyle = {
  width: '250px',
  backgroundColor: '#81c784', // Light green
  color: '#ffffff',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}

const mainContentStyle = {
  flexGrow: 1,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '10px',
}

const tableStyle = {
  marginTop: '20px',
  borderRadius: '8px',
  overflow: 'hidden',
}

const tableHeaderStyle = {
  backgroundColor: '#66bb6a', // Darker light green
  color: '#ffffff',
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box sx={containerStyle}>
      <Box sx={sidebarStyle}>
        <Typography variant="h5">Inventory Manager</Typography>
        <Button variant="text" color="inherit" onClick={handleOpen} startIcon={<AddIcon />}>
          Add Item
        </Button>
      </Box>

      <Box sx={mainContentStyle}>
        <Typography variant="h4" color="#333">
          Inventory Items
        </Typography>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2" color="#66bb6a">
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
                onClick={() => {
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

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
              {inventory.map(({ name, quantity }) => (
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
      </Box>
    </Box>
  )
}