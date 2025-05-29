import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { getProfileImageUrl } from '../utils/imageUtils';
import Feed from '../components/Feed';
import PageLayout from '../components/PageLayout';
import config from '../config';

const Saved = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const fetchSavedPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${config.backendUrl}/api/posts/saved`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedPosts(response.data);
      setSavedPostIds(response.data.map(post => post._id));
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (savedPostIds.includes(postId)) {
        // Unsave post
        await axios.post(
          `${config.backendUrl}/api/posts/${postId}/unsave`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedPostIds(prev => prev.filter(id => id !== postId));
        setSavedPosts(prev => prev.filter(post => post._id !== postId));
      } else {
        // Save post (should not happen in saved page, but for completeness)
        await axios.post(
          `${config.backendUrl}/api/posts/${postId}/save`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedPostIds(prev => [...prev, postId]);
        // Optionally refetch or add post to savedPosts
      }
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
    }
  };

  return (
    <PageLayout title="Saved">
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, pb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Saved Posts
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        ) : savedPosts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <BookmarkBorderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Saved Posts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Posts you save will appear here
            </Typography>
          </Box>
        ) : (
          <Feed
            posts={savedPosts}
            savedPosts={savedPostIds}
            onSave={handleSavePost}
          />
        )}
      </Box>
    </PageLayout>
  );
};

export default Saved; 