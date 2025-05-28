import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import axios from 'axios';

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [error, setError] = useState('');

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('content', content);
      if (mediaFile) {
        data.append('media', mediaFile);
      }

      await axios.post('http://localhost:5000/api/posts', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Create a New Post
        </Typography>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Content"
            name="content"
            value={content}
            onChange={e => setContent(e.target.value)}
            margin="normal"
            required
            multiline
            rows={4}
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            style={{ marginTop: 16, marginBottom: 16 }}
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Create Post
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePost; 