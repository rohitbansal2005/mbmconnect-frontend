import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Avatar,
  Badge,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Home as HomeIcon,
  Update as UpdateIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Bookmark as BookmarkIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getProfileImageUrl, getBestProfileImage, fallbackImage } from '../utils/imageUtils';
import axios from 'axios';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user, socket } = useAuth();
  const { unreadCount: unreadMessagesCount } = useAuth();
  const { unreadCount: unreadNotificationsCount } = useNotifications();
  const [newUpdatesCount, setNewUpdatesCount] = useState(0);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleMessageClick = () => {
    if (socket) {
      socket.emit('markMessagesAsRead');
    }
    navigate('/messages');
  };

  useEffect(() => {
    // Fetch updates and set newUpdatesCount based on new updates
    const fetchUpdates = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events');
        const newUpdates = res.data.filter(update => update.isNew); // Assuming 'isNew' is a property of updates
        setNewUpdatesCount(newUpdates.length);
      } catch (error) {
        console.error('Error fetching updates:', error);
      }
    };
    fetchUpdates();
  }, []);

  const mainMenuItems = [
    {
      icon: <HomeIcon />,
      text: 'Home',
      path: '/'
    },
    {
      icon: (
        <Badge badgeContent={newUpdatesCount} color="error">
          <UpdateIcon />
        </Badge>
      ),
      text: 'Updates',
      path: '/events'
    },
    {
      icon: <GroupIcon />,
      text: 'Groups',
      path: '/groups'
    },
    {
      icon: <BookmarkIcon />,
      text: 'Saved',
      path: '/saved'
    }
  ];

  const bottomMenuItems = [
    { icon: <HelpIcon />, text: 'Help Center', path: '/help-center' },
    { icon: <SettingsIcon />, text: 'Settings', path: '/settings' }
  ];

  return (
    <Box sx={{ width: 250, display: { xs: 'none', md: 'block' } }} role="presentation">
      <List>
        {mainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => item.onClick ? item.onClick() : handleNavigation(item.path)}
              sx={{ py: 1 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {user && (
          <ListItemButton onClick={() => handleNavigation(`/profile/${user._id}`)}>
            <ListItemIcon>
              <Avatar 
                src={getProfileImageUrl(user?.profilePicture || user?.avatar) || fallbackImage}
                alt={user?.username}
                sx={{ width: 24, height: 24 }}
                onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
              >
                {(user?.username || user?.name || 'U')[0]?.toUpperCase()}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary={user?.username} secondary="View Profile" />
          </ListItemButton>
        )}

        <Divider sx={{ my: 1 }} />

        {bottomMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {user?.role === 'admin' && (
          <ListItemButton onClick={() => handleNavigation('/admin-reports')}>
            <ListItemIcon>
              <Badge color="error" variant="dot">
                <HelpIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="User Reports" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );
};

export default LeftSidebar; 