import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Tabs,
    Tab,
    List,
    ListItem,
    Avatar,
    Typography,
    Box,
    IconButton,
    Alert,
    CircularProgress,
    Button,
    TextField,
    InputAdornment,
    Divider,
    Tooltip,
    Badge
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import { fallbackImage } from '../utils/imageUtils';
import config from '../config'; // Import config

const FollowersList = ({ open, onClose, userId }) => {
    const { token, user: currentUser, socket, onlineUsers } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFollowers, setFilteredFollowers] = useState([]);
    const [filteredFollowing, setFilteredFollowing] = useState([]);

    // Define fetchData here, before useEffects that use it
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching data for user:', userId);
            
            const endpoint = tab === 0 
                ? `${config.backendUrl}/api/follows/followers/${userId}` 
                : `${config.backendUrl}/api/follows/following/${userId}`;
            console.log('Using endpoint:', endpoint);
            
            const response = await axios.get(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Raw API response:', response.data);
            
            // Process the data based on the selected tab
            const processedData = tab === 0 
                ? response.data.map(item => ({
                    ...item.follower,
                    followId: item._id,
                    followStatus: item.status
                }))
                : response.data.map(item => ({
                    ...item.following,
                    followId: item._id,
                    // For the following list, assume status is 'accepted' unless explicitly 'pending'
                    followStatus: item.status === 'pending' ? 'pending' : 'accepted' 
                }));
            
            console.log('Processed data:', processedData);
            
            if (tab === 0) {
                setFollowers(processedData);
                setFilteredFollowers(processedData);
            } else {
                setFollowing(processedData);
                setFilteredFollowing(processedData);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    }, [userId, tab, token]);

    useEffect(() => {
        if (open && userId) {
            fetchData();
        }
    }, [open, userId, tab, fetchData]);

    useEffect(() => {
        // Filter users based on search query
        const filterUsers = (users) => {
            return users.filter(item => {
                // Access user details correctly based on tab
                const userProfile = tab === 0 ? item.follower : item.following;
                if (!userProfile) return false;
                const searchLower = searchQuery.toLowerCase();
                return (
                    userProfile.username?.toLowerCase().includes(searchLower) ||
                    userProfile.email?.toLowerCase().includes(searchLower)
                );
            });
        };

        // Apply filtering to the correct list based on the current tab
        if (tab === 0) {
            setFilteredFollowers(filterUsers(followers));
        } else {
            setFilteredFollowing(filterUsers(following));
        }
    }, [searchQuery, followers, following, tab]);

    // Socket.IO listener for follow status updates
    useEffect(() => {
        if (!socket || !userId) return; // Ensure socket and userId are available

        const handleFollowStatusUpdate = (data) => {
            console.log('Follow status updated via socket:', data);
            // Check if the update is relevant to the current user's lists
            // Also check if the current component is actually open
            if (open && (data.followerId === userId || data.followingId === userId)) {
                console.log('Relevant update, fetching data...');
                fetchData(); // Refresh data
            }
        };

        socket.on('followStatusUpdated', handleFollowStatusUpdate);

        // Clean up the listener on component unmount or userId/socket change
        return () => {
            socket.off('followStatusUpdated', handleFollowStatusUpdate);
        };
    }, [socket, userId, open, fetchData]);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
        setSearchQuery(''); // Reset search when changing tabs
    };

    const handleMessageClick = (targetUserId) => {
        navigate(`/messages/${targetUserId}`);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleFollow = async (userId) => {
        try {
            const response = await axios.post(`${config.backendUrl}/api/follows/${userId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Follow response:', response.data);
            // Data will be refreshed via socket event
        } catch (error) {
            console.error('Error following user:', error);
            setError(error.response?.data?.message || 'Error following user');
        }
    };

    const renderList = (items) => {
        // Filter out the current user and only show accepted follows
        const filtered = items.filter(item => {
            let user = tab === 0 ? item.follower || item : item.following || item;
            return user && 
                   String(user._id) !== String(currentUser?._id) && 
                   (tab === 0 ? item.followStatus === 'accepted' : true);
        });

        if (filtered.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                        {searchQuery ? 'No users found' : `No ${tab === 0 ? 'followers' : 'following'} yet`}
                    </Typography>
                </Box>
            );
        }

        return (
            <List>
                {filtered.map((item) => {
                    let user = tab === 0 ? item.follower || item : item.following || item;
                    if (!user) return null;

                    const profilePicture = user.profilePicture || user.avatar || fallbackImage;
                    const imageUrl = profilePicture?.startsWith('http') 
                        ? profilePicture 
                        : `${config.backendUrl}/${profilePicture}`;

                    const isOnline = onlineUsers[user._id];
                    const isCurrentUser = String(user._id) === String(currentUser?._id);

                    return (
                        <ListItem
                            key={user._id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                py: 1
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    variant="dot"
                                    color={isOnline ? "success" : "default"}
                                    sx={{
                                        '& .MuiBadge-badge': {
                                            backgroundColor: isOnline ? '#44b700' : '#bdbdbd',
                                            boxShadow: '0 0 0 2px #fff'
                                        }
                                    }}
                                >
                                    <Avatar
                                        src={imageUrl}
                                        alt={user.username}
                                        sx={{ width: 40, height: 40, mr: 2 }}
                                    />
                                </Badge>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        {user.username}
                                    </Typography>
                                </Box>
                            </Box>
                            {!isCurrentUser && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Message">
                                        <IconButton
                                            onClick={() => handleMessageClick(user._id)}
                                            size="small"
                                        >
                                            <MessageIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {tab === 0 && item.followStatus === 'pending' && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disabled
                                            startIcon={<PersonAddDisabledIcon />}
                                        >
                                            Pending
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </ListItem>
                    );
                })}
            </List>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="followers-dialog-title"
            aria-describedby="followers-dialog-description"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: '80vh',
                    minHeight: '300px' // Prevent layout shift
                }
            }}
        >
            <DialogTitle 
                id="followers-dialog-title"
                sx={{ m: 0, p: 2 }}
            >
                {tab === 0 ? 'Followers' : 'Following'}
                <IconButton
                    aria-label="close dialog"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Tabs 
                value={tab} 
                onChange={handleTabChange} 
                aria-label="followers following tabs" 
                centered
                sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab 
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>Followers</Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.75rem'
                                }}
                            >
                                {followers.length}
                            </Typography>
                        </Box>
                    }
                    id="tab-followers"
                    aria-controls="tabpanel-followers"
                />
                <Tab 
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>Following</Typography>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.75rem'
                                }}
                            >
                                {following.length}
                            </Typography>
                        </Box>
                    }
                    id="tab-following"
                    aria-controls="tabpanel-following"
                />
            </Tabs>

            <DialogContent 
                id="followers-dialog-description"
                dividers 
                sx={{ 
                    p: 0,
                    minHeight: '200px', // Prevent layout shift
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Box sx={{ p: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder={`Search ${tab === 0 ? 'followers' : 'following'}...`}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                        aria-label={`Search ${tab === 0 ? 'followers' : 'following'}`}
                    />
                </Box>

                <Divider />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4, flex: 1 }}>
                        <CircularProgress aria-label="Loading users" />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ m: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                        {renderList(tab === 0 ? filteredFollowers : filteredFollowing)}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default FollowersList; 