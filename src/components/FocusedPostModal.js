import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import PostCard from './Feed'; // Import PostCard from Feed.js

const FocusedPostModal = ({ onLike, onComment, onDelete, onEdit, onSave, savedPosts, showSnackbar }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        setPost(null);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Modal
      open
      onClose={handleClose}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.7)', zIndex: 2000 }}
    >
      <Box sx={{ position: 'relative', width: { xs: '98vw', sm: 600 }, maxWidth: '98vw', maxHeight: '98vh', overflowY: 'auto', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 6, p: 2 }}>
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}
          aria-label="Close"
        >
          <CloseIcon fontSize="large" />
        </IconButton>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : post ? (
          <PostCard
            post={post}
            onLike={onLike}
            onComment={onComment}
            onDelete={onDelete}
            onEdit={onEdit}
            onSave={onSave}
            savedPosts={savedPosts}
            showSnackbar={showSnackbar}
            // Add any other props your PostCard needs
          />
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>Post not found.</Box>
        )}
      </Box>
    </Modal>
  );
};

export default FocusedPostModal; 