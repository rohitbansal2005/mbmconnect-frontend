import React, { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getBestProfileImage, fallbackImage } from '../utils/imageUtils';

const RightSidebar = ({ users, onlineUsers }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState(null);

  console.log('RightSidebar users:', users);
  console.log('RightSidebar onlineUsers:', onlineUsers);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/settings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setUserSettings(response.data);
      } catch (error) {
        console.error('Error fetching user settings:', error);
      }
    };

    fetchUserSettings();
  }, []);

  const shouldShowOnlineStatus = (userId) => {
    // If user is not logged in or settings not loaded, show default status
    if (!user || !userSettings) return true;

    // If viewing own profile, always show status
    if (userId === user._id) return true;

    // If user has disabled online status visibility, don't show
    if (!userSettings.showOnlineStatus) return false;

    return true;
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 300,
        p: 2,
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        display: { xs: 'none', md: 'block' },
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Users
      </Typography>
      <List>
        {onlineUsers && onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <ListItem key={user.id} disablePadding>
              <ListItemButton onClick={() => navigate(`/profile/${user.id}`)} sx={{ borderRadius: 1, mb: 0.5 }}>
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                    sx={{
                      '& .MuiBadge-dot': {
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        border: `2px solid ${theme.palette.background.paper}`,
                      },
                    }}
                  >
                    <Avatar
                      alt={user.username || 'User'}
                      src={user.profilePicture || user.avatar || fallbackImage}
                      onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    >
                      {(user.username || 'U')[0].toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.username || 'User'} 
                  secondary={'Online'}
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No users available.</Typography>
        )}
      </List>
    </Paper>
  );
};

export default RightSidebar;