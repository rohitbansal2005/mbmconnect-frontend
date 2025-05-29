import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton, Divider, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import { Link } from 'react-router-dom';
import { Person, Group, Event, Settings, Help, Notifications } from '@mui/icons-material';

const RightSidebar = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${config.backendUrl}/api/settings`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setSettings(response.data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        if (user) {
            fetchSettings();
        }
    }, [user]);

    const menuItems = [
        { text: 'Profile', icon: <Person />, path: `/profile/${user?._id}` },
        { text: 'Groups', icon: <Group />, path: '/groups' },
        { text: 'Events', icon: <Event />, path: '/events' },
        { text: 'Settings', icon: <Settings />, path: '/settings' },
        { text: 'Help Center', icon: <Help />, path: '/help-center' },
        { text: 'Notifications', icon: <Notifications />, path: '/notifications' }
    ];

    return (
        <Box sx={{ width: 280, p: 2 }}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Quick Links
                </Typography>
                <List>
                    {menuItems.map((item, index) => (
                        <React.Fragment key={item.text}>
                            <ListItem
                                button
                                component={Link}
                                to={item.path}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        {item.icon}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={item.text} />
                            </ListItem>
                            {index < menuItems.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            {settings && (
                <Paper elevation={3} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Settings
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemText
                                primary="Email Notifications"
                                secondary={settings.emailNotifications ? 'Enabled' : 'Disabled'}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemText
                                primary="Push Notifications"
                                secondary={settings.pushNotifications ? 'Enabled' : 'Disabled'}
                            />
                        </ListItem>
                    </List>
                </Paper>
            )}
        </Box>
    );
};

export default RightSidebar;