import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Divider,
    Box,
    Button,
    ButtonGroup,
    Container,
    MenuList
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { getBestProfileImage, fallbackImage } from '../utils/imageUtils';
import { useNotifications } from '../context/NotificationContext';
import config from '../config';

const NotificationList = ({ isPage }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { notifications, unreadCount, setNotifications } = useNotifications();
    const [anchorEl, setAnchorEl] = useState(null);

    // Function to format time in a relative format
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark as read
            await axios.put(`http://localhost:5001/api/notifications/${notification._id}/read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Navigate based on notification type
            switch (notification.type) {
                case 'follow_accepted':
                    // Navigate to the sender's profile
                    navigate(`/profile/${notification.sender._id}`);
                    break;
                case 'post_like':
                case 'post_comment':
                    // Navigate to the post
                    navigate(`/post/${notification.relatedId}`);
                    break;
                case 'group_invite':
                    // Navigate to the group
                    navigate(`/group/${notification.relatedId}`);
                    break;
                default:
                    // Don't navigate for follow requests
                    break;
            }

            // Update local state
            setNotifications(prevNotifications => prevNotifications.map(n => 
                n._id === notification._id ? { ...n, read: true } : n
            ));
             if (isPage) {
                // No need to close menu on page view, as there is no menu
            } else {
                setAnchorEl(null);
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const handleAcceptRequest = async (notification, event) => {
        event.stopPropagation();
        console.log('Attempting to accept follow request:', notification);
        try {
            await axios.put(`${config.backendUrl}/api/follows/accept/${notification.relatedId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Follow request accepted successfully:', notification);
            // Remove the notification after accepting
            setNotifications(prevNotifications => prevNotifications.filter(n => n._id !== notification._id));
        } catch (error) {
            console.error('Error accepting follow request:', error.response?.data || error.message);
        }
    };

    const handleRejectRequest = async (notification, event) => {
        event.stopPropagation();
        console.log('Attempting to reject follow request:', notification);
        try {
            await axios.put(`${config.backendUrl}/api/follows/reject/${notification.relatedId}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Follow request rejected successfully:', notification);
            // Remove the notification after rejecting
            setNotifications(prevNotifications => prevNotifications.filter(n => n._id !== notification._id));
        } catch (error) {
            console.error('Error rejecting follow request:', error.response?.data || error.message);
        }
    };

    const handleDeleteNotification = async (notificationId, event) => {
        event.stopPropagation();
        try {
            await axios.delete(`http://localhost:5001/api/notifications/${notificationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prevNotifications => prevNotifications.filter(n => n._id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.put('http://localhost:5001/api/notifications/read-all', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prevNotifications => prevNotifications.map(n => ({ ...n, read: true })));
             if (!isPage) {
                 setAnchorEl(null);
             }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationContent = (notification) => {
        if (!notification.sender) {
            return 'Notification from deleted user';
        }

        switch (notification.type) {
            case 'follow_request':
                return `${notification.sender.username || 'Someone'} wants to follow you`;
            case 'follow_accepted':
                return `${notification.sender.username || 'Someone'} accepted your follow request`;
            case 'post_like':
                return `${notification.sender.username || 'Someone'} liked your post`;
            case 'post_comment':
                return `${notification.sender.username || 'Someone'} commented on your post`;
            case 'group_invite':
                return `${notification.sender.username || 'Someone'} invited you to join a group`;
            default:
                return notification.content || 'New notification';
        }
    };

    if (isPage) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 4 }}>
                    <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Notifications</Typography>
                        {notifications.length > 0 && (
                            <Button size="small" onClick={handleMarkAllRead}>
                                Mark all read
                            </Button>
                        )}
                    </Box>
                    <Divider />
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {notifications.length === 0 ? (
                            <ListItem>
                                <ListItemText primary="No notifications" />
                            </ListItem>
                        ) : (
                            notifications.map((notification) => (
                                <ListItem
                                    key={notification._id}
                                    alignItems="flex-start"
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        cursor: 'pointer',
                                        bgcolor: notification.read ? 'inherit' : 'action.hover',
                                        '&:hover': { bgcolor: 'action.selected' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={notification.sender ? getBestProfileImage(notification.sender) : fallbackImage}
                                            alt={notification.sender?.username || 'User'}
                                            onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                                        >
                                            {(!notification.sender?.profilePicture && !notification.sender?.avatar && notification.sender?.username)
                                                ? notification.sender.username[0].toUpperCase()
                                                : null}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={getNotificationContent(notification)}
                                        secondary={getRelativeTime(notification.createdAt)}
                                    />
                                    {notification.type === 'follow_request' ? (
                                        <ButtonGroup size="small">
                                            <Button
                                                startIcon={<CheckIcon />}
                                                onClick={(e) => handleAcceptRequest(notification, e)}
                                                color="primary"
                                                variant="contained"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                startIcon={<CloseOutlinedIcon />}
                                                onClick={(e) => handleRejectRequest(notification, e)}
                                                color="error"
                                                variant="contained"
                                            >
                                                Reject
                                            </Button>
                                        </ButtonGroup>
                                    ) : (
                                        <IconButton edge="end" aria-label="delete" onClick={(e) => handleDeleteNotification(notification._id, e)}>
                                            <CloseIcon />
                                        </IconButton>
                                    )}
                                </ListItem>
                            ))
                        )}
                    </List>
                </Box>
            </Container>
        );
    }

    // Default rendering for Navbar dropdown
    return (
        <>
            <IconButton
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ ml: 1 }}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 400
                    }
                }}
            >
                <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Notifications</Typography>
                    {notifications.length > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </Box>
                <Divider />
                <MenuList sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {notifications.length === 0 ? (
                        <MenuItem disabled>
                            <ListItemText primary="No notifications" />
                        </MenuItem>
                    ) : (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification._id}
                                alignItems="flex-start"
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                                    '&:hover': { bgcolor: 'action.selected' }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={notification.sender ? getBestProfileImage(notification.sender) : fallbackImage}
                                        alt={notification.sender?.username || 'User'}
                                        onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                                    >
                                        {(!notification.sender?.profilePicture && !notification.sender?.avatar && notification.sender?.username)
                                            ? notification.sender.username[0].toUpperCase()
                                            : null}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={getNotificationContent(notification)}
                                    secondary={getRelativeTime(notification.createdAt)}
                                />
                                {notification.type === 'follow_request' ? (
                                    <ButtonGroup size="small">
                                        <Button
                                            startIcon={<CheckIcon />}
                                            onClick={(e) => handleAcceptRequest(notification, e)}
                                            color="primary"
                                            variant="contained"
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            startIcon={<CloseOutlinedIcon />}
                                            onClick={(e) => handleRejectRequest(notification, e)}
                                            color="error"
                                            variant="contained"
                                        >
                                            Reject
                                        </Button>
                                    </ButtonGroup>
                                ) : (
                                    <IconButton edge="end" aria-label="delete" onClick={(e) => handleDeleteNotification(notification._id, e)}>
                                        <CloseIcon />
                                    </IconButton>
                                )}
                            </MenuItem>
                        ))
                    )}
                </MenuList>
            </Menu>
        </>
    );
};

export default NotificationList; 