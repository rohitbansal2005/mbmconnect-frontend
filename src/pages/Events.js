import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import config from '../config';

const Updates = () => {
  const { user } = useAuth();
  const { isDarkMode } = useAppTheme();
  const theme = useTheme();
  const [updates, setUpdates] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'general', // general, academic, cultural, sports
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    console.log('Current user:', user); // Debug log
    fetchUpdates();
  }, [user]);

  const fetchUpdates = async () => {
    try {
      const res = await axios.get(`${config.backendUrl}/api/events`);
      setUpdates(res.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
      setError('Failed to fetch updates');
    }
  };

  const handleOpen = (update = null) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title: update.title,
        description: update.description,
        date: update.date,
        time: update.time,
        location: update.location,
        type: update.type,
        image: null
      });
      setPreviewImage(update.image || '');
    } else {
      setEditingUpdate(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'general',
        image: null
      });
      setPreviewImage('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUpdate(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'general',
      image: null
    });
    setPreviewImage('');
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Present' : 'Missing'); // Debug log
      console.log('User role:', user?.role); // Debug log
      
      if (!token) {
        setError('You must be logged in to create updates');
        return;
      }

      if (!isAdmin) {
        setError('Only admins can create updates');
        return;
      }

      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      console.log('Submitting update data:', {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        type: formData.type,
        hasImage: !!formData.image
      });

      if (editingUpdate) {
        const response = await axios.put(
          `${config.backendUrl}/api/events/${editingUpdate._id}`,
          formDataToSend,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('Update updated:', response.data);
      } else {
        const response = await axios.post(
          `${config.backendUrl}/api/events`,
          formDataToSend,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('Update created:', response.data);
      }
      
      fetchUpdates();
      handleClose();
    } catch (error) {
      console.error('Error saving update:', error);
      console.error('Error response:', error.response?.data); // Debug log
      setError(error.response?.data?.message || 'Failed to save update. Please try again.');
    }
  };

  const handleDelete = async (updateId) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.backendUrl}/api/events/${updateId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
      setError('Failed to delete update');
    }
  };

  const getUpdateTypeColor = (type) => {
    switch (type) {
      case 'academic':
        return 'primary';
      case 'cultural':
        return 'secondary';
      case 'sports':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <PageLayout title="Updates">
      <Box sx={{
        flexGrow: 1,
        px: { xs: 2, md: 3 },
        pb: 3
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: isDarkMode ? 'text.primary' : 'primary.main',
              fontWeight: 'bold'
            }}
          >
           Updates
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{
                bgcolor: isDarkMode ? 'primary.dark' : 'primary.main',
                '&:hover': {
                  bgcolor: isDarkMode ? 'primary.main' : 'primary.dark',
                }
              }}
            >
              Add Update
            </Button>
          )}
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3}>
          {updates.map((update) => (
            <Grid item xs={12} sm={6} md={4} key={update._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: isDarkMode ? 'background.paper' : 'white',
                  '&:hover': {
                    boxShadow: 3,
                  }
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={update.image ? (update.image.startsWith('http') ? update.image : `${config.backendUrl}/${update.image}`) : '/broken-image.png'}
                    alt={update.title}
                    width="300"
                    height="200"
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }}
                    onError={e => { e.target.onerror = null; e.target.src = '/broken-image.png'; }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                      {update.title}
                    </Typography>
                    <Chip 
                      label={update.type} 
                      color={getUpdateTypeColor(update.type)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {update.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {new Date(update.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {update.time && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="primary" />
                        <Typography variant="body2">{update.time}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="primary" />
                      <Typography variant="body2">{update.location}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                {isAdmin && (
                  <CardActions>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpen(update)}
                      sx={{ color: 'primary.main' }}
                      aria-label="Edit update"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(update._id)}
                      sx={{ color: 'error.main' }}
                      aria-label="Delete update"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Add/Edit Update Dialog */}
        <Dialog 
          open={open} 
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? 'background.paper' : 'white',
              borderRadius: 2
            }
          }}
        >
          <DialogTitle sx={{ 
            color: isDarkMode ? 'text.primary' : 'primary.main',
            fontWeight: 'bold'
          }}>
            {editingUpdate ? 'Edit Update' : 'Add New Update'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {/* Image Upload */}
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isDarkMode ? 'background.paper' : 'white',
                  '&:hover': {
                    borderColor: 'primary.dark',
                  },
                }}
                onClick={handleImageClick}
              >
                {previewImage ? (
                  <picture>
                    <source srcSet={previewImage.replace(/\.(jpg|jpeg|png)$/i, '.webp')} type="image/webp" />
                    <img
                      src={previewImage}
                      alt="Preview"
                      width="200"
                      height="200"
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </picture>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <ImageIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Click to upload update image
                    </Typography>
                  </Box>
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <TextField
                fullWidth
                label="Update Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                required
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                sx={{ mt: 2, mb: 2 }}
              />
              <TextField
                fullWidth
                select
                label="Update Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleClose}
              sx={{
                color: isDarkMode ? 'text.primary' : 'primary.main'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ 
                bgcolor: isDarkMode ? 'primary.dark' : 'primary.main',
                '&:hover': {
                  bgcolor: isDarkMode ? 'primary.main' : 'primary.dark',
                }
              }}
            >
              {editingUpdate ? 'Save Changes' : 'Add Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  );
};

export default Updates; 