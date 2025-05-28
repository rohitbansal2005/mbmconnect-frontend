import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import Feed from '../components/Feed';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CreatePost from '../components/CreatePost';
import FloatingActions from '../components/FloatingActions';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import MuiAlert from '@mui/material/Alert';
import FocusedPostModal from '../components/FocusedPostModal';
import { useLocation, useMatch } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, onlineUsers, socket } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [users, setUsers] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const location = useLocation();
  const match = useMatch('/post/:id');
  const state = location.state;
  const background = state && state.background;

  useEffect(() => {
    fetchPosts();
    const fetchUsers = async () => {
      try {
        console.log('Attempting to fetch users...');
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        console.log('Users fetched successfully:', response.data);
        setUsers(response.data);
        console.log('Users state updated:', response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user && user.token) {
      fetchUsers();
    }

    // Add socket event listener for online users
    if (socket) {
      socket.on('onlineUsers', (users) => {
        console.log('Received online users:', users);
      });
    }

    return () => {
      if (socket) {
        socket.off('onlineUsers');
      }
    };
  }, [user, onlineUsers, socket]);

  useEffect(() => {
    const fetchSavedPostIds = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await axios.get('http://localhost:5000/api/posts/saved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedPosts(response.data.map(post => post._id));
      } catch (error) {
        console.error('Error fetching saved post IDs:', error);
      }
    };
    fetchSavedPostIds();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts');
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      console.log('Creating post with data:', postData);
      const response = await axios.post('http://localhost:5000/api/posts', postData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post created successfully:', response.data);
      setPosts((prevPosts) => [response.data, ...prevPosts]);
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLikePost = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleComment = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/posts/${editingPost._id}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === editingPost._id ? response.data : post
        )
      );
      setEditingPost(null);
    } catch (err) {
      alert('Failed to update post');
    }
  };

  const handleFloatingPostClick = () => {
    setShowCreatePost(true);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (savedPosts.includes(postId)) {
        await axios.post(`http://localhost:5000/api/posts/${postId}/unsave`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setSavedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await axios.post(`http://localhost:5000/api/posts/${postId}/save`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setSavedPosts(prev => [...prev, postId]);
      }
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          pt: { xs: '64px', md: '64px' },
          px: { xs: 2, sm: 2 },
          gap: { xs: 0, md: 2 },
          minHeight: '0', // allow children to use 100% height
        }}
      >
        {/* Left Sidebar */}
        {!isMobile && <LeftSidebar />}

        {/* Main Content - Outer Box for Flex Layout */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            px: { xs: 0, md: 0 },
            ml: { md: 10, xs: 0 },
            mr: { md: 0, xs: 0 },
            display: 'flex',
            flexDirection: 'column',
            height: { md: 'calc(100vh - 64px)' },
            minHeight: 0,
            background: 'transparent',
            maxWidth: { md: '800px', xs: '100%' },
            bgcolor: theme.palette.background.default,
            boxShadow: { md: 3, xs: 0 },
            borderRadius: { md: 3, xs: 0 },
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {/* Inner Box to control content width and centering within the main flex item */}
          <Box sx={{
            flex: 1,
            overflowY: { md: 'auto', xs: 'visible' },
            minHeight: 0,
            pb: 2,
            width: '100%',
            alignSelf: 'center',
            maxWidth: { md: '900px', xs: '100%' },
          }}>
            <Box sx={{ mt: { xs: 2, md: 0 } }}>
              <CreatePost onPost={handleCreatePost} user={user} />
            </Box>
            <Feed
              posts={posts}
              onLike={handleLikePost}
              onComment={handleComment}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
              onSave={handleSavePost}
              savedPosts={savedPosts}
              showSnackbar={showSnackbar}
            />
          </Box>
          {editingPost && (
            <Box sx={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
            }}>
              <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, minWidth: 300 }}>
                <h3>Edit Post</h3>
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={4}
                  style={{ width: '100%' }}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button onClick={() => setEditingPost(null)}>Cancel</Button>
                  <Button variant="contained" onClick={handleSaveEdit}>Save</Button>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Sidebar - Wrapped in fixed Box */}
        {/* Apply maxHeight and overflowY for scrolling */}
        {!isMobile && (
          <Box sx={{
            width: '250px',
            flexShrink: 0,
            position: 'fixed', // Keep fixed position
            right: theme.spacing(2),
            top: '64px', // Position below the fixed navbar
            height: 'calc(100vh - 64px)', // Calculate height to fit within the viewport below the navbar
            overflowY: 'auto', // Enable vertical scrolling for content that exceeds height
          }}>
            <RightSidebar
              contacts={[
                {
                  _id: '1',
                  username: 'John Doe',
                  avatar: '/avatars/john.jpg',
                  status: 'Online',
                },
                {
                  _id: '2',
                  username: 'Jane Smith',
                  avatar: '/avatars/jane.jpg',
                  status: 'Last seen 5m ago',
                },
              ]}
              groupConversations={[
                {
                  _id: '1',
                  name: 'Class of 2024',
                  avatar: '/groups/class2024.jpg',
                  members: ['1', '2', '3'],
                },
                {
                  _id: '2',
                  name: 'Study Group',
                  avatar: '/groups/study.jpg',
                  members: ['1', '2', '3', '4'],
                },
              ]}
              users={users}
              onlineUsers={onlineUsers}
            />
          </Box>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
      {/* Render FocusedPostModal if /post/:id route is active */}
      {match && (
        <FocusedPostModal
          onLike={handleLikePost}
          onComment={handleComment}
          onDelete={handleDeletePost}
          onEdit={handleEditPost}
          onSave={handleSavePost}
          savedPosts={savedPosts}
          showSnackbar={showSnackbar}
        />
      )}
    </Box>
  );
};

export default Home; 