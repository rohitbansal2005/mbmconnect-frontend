import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '' });
  const { socket, user } = useAuth();

  useEffect(() => {
    console.log('Updates component mounted');
    fetchUpdates();
    checkAdminStatus();

    if (socket) {
      console.log('Socket connected, setting up listeners');
      socket.on('newUpdate', (newUpdate) => {
        console.log('Received new update:', newUpdate);
        setUpdates((prevUpdates) => [newUpdate, ...prevUpdates]);
      });

      socket.on('updateReaction', (updatedUpdate) => {
        console.log('Received reaction update:', updatedUpdate);
        setUpdates((prevUpdates) =>
          prevUpdates.map((update) =>
            update._id === updatedUpdate._id ? updatedUpdate : update
          )
        );
      });
    } else {
      console.log('Socket not available');
    }

    return () => {
      if (socket) {
        socket.off('newUpdate');
        socket.off('updateReaction');
      }
    };
  }, [socket]);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, user not logged in');
        return;
      }
      
      console.log('Checking admin status...');
      const res = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Admin status response:', res.data);
      setIsAdmin(res.data.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchUpdates = async () => {
    try {
      console.log('Fetching updates...');
      const res = await axios.get('http://localhost:5000/api/events');
      console.log('Updates response:', res.data);
      setUpdates(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching updates:', error);
      setError(error.response?.data?.message || 'Failed to fetch updates');
      setLoading(false);
    }
  };

  const handleCreateUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create updates');
        return;
      }

      console.log('Creating new update:', newUpdate);
      await axios.post('http://localhost:5000/api/events', newUpdate, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNewUpdate({ title: '', description: '' });
      setOpenDialog(false);
      fetchUpdates();
    } catch (error) {
      console.error('Error creating update:', error);
      setError(error.response?.data?.message || 'Failed to create update');
    }
  };

  const handleReaction = async (updateId, reactionType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to react to updates');
        return;
      }
      console.log('Reacting to update:', updateId, reactionType);
      await axios.post(`http://localhost:5000/api/events/${updateId}/react`, 
        { reactionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error reacting to update:', error);
      setError(error.response?.data?.message || 'Failed to react to update');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Updates</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Update
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {updates.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">No updates yet.</Typography>
        </Paper>
      ) : (
        <List>
          {updates.map((update) => (
            <Paper key={update._id} sx={{ mb: 2, p: 2 }}>
              <ListItem>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6">{update.title}</Typography>
                    <Typography variant="body1" color="text.secondary">
                      {update.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <IconButton
                        onClick={() => handleReaction(update._id, 'like')}
                        color={update.userReaction === 'like' ? 'primary' : 'default'}
                      >
                        <ThumbUpIcon />
                      </IconButton>
                      <Chip label={update.likes || 0} size="small" />
                      <IconButton
                        onClick={() => handleReaction(update._id, 'dislike')}
                        color={update.userReaction === 'dislike' ? 'error' : 'default'}
                      >
                        <ThumbDownIcon />
                      </IconButton>
                      <Chip label={update.dislikes || 0} size="small" />
                    </Box>
                  </Grid>
                </Grid>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Update</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newUpdate.title}
            onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newUpdate.description}
            onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUpdate} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Updates; 