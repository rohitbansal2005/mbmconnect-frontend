import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  AvatarGroup,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemAvatar,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Grid,
  useMediaQuery,
  Container,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl, fallbackImage, getBestProfileImage } from '../utils/imageUtils';
import BackButton from '../components/BackButton';
import PageLayout from '../components/PageLayout';
import config from '../config';

const Groups = () => {
  const { groupId } = useParams(); // Get group ID from URL
  const navigate = useNavigate();
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentGroup, setCurrentGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [groupMenuAnchor, setGroupMenuAnchor] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDescription, setEditGroupDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [adminImage, setAdminImage] = useState('');
  const [editAdminImage, setEditAdminImage] = useState('');
  const fileInputRef = useRef(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    isPrivate: false,
    rules: '',
    tags: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchGroups();
    fetchFriends();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        setError('Please login to view groups');
        return;
      }

      const res = await axios.get(`${config.backendUrl}/api/groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.data || !Array.isArray(res.data)) {
        throw new Error('Invalid response format');
      }
      
      setGroups(res.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError(error.response?.data?.message || 'Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setIsLoadingFriends(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.backendUrl}/api/users/friends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends');
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize socket connection
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No authentication token found');
        return;
    }

    const newSocket = io(config.socketUrl, {
      transports: ['websocket', 'polling'], // Add polling as fallback
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      if (groupId) {
        newSocket.emit('joinGroup', groupId);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to chat server. Please refresh the page.');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
}, [groupId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log('Received new message:', message);
      setMessages(prevMessages => {
        const exists = prevMessages.some(m => m._id === message._id);
        if (exists) return prevMessages;
        return [...prevMessages, message];
      });
    };

    const handleMessageUpdated = (message) => {
      console.log('Message updated:', message);
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === message._id ? message : msg
        )
      );
    };

    const handleMessageDeleted = (data) => {
      console.log('Message deleted:', data);
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== data.messageId)
      );
    };

    socket.on('receiveGroupMessage', handleReceiveMessage);
    socket.on('messageUpdated', handleMessageUpdated);
    socket.on('messageDeleted', handleMessageDeleted);

    return () => {
      socket.off('receiveGroupMessage', handleReceiveMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('messageDeleted', handleMessageDeleted);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleGroupUpdated = (data) => {
      console.log('Group updated:', data);
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group._id === data.groupId ? data.group : group
        )
      );
      if (currentGroup?._id === data.groupId) {
        setCurrentGroup(data.group);
      }
    };

    socket.on('groupUpdated', handleGroupUpdated);

    return () => {
      socket.off('groupUpdated', handleGroupUpdated);
    };
  }, [socket, currentGroup]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !socket || !groupId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending message:', {
        groupId,
        text: newMessage,
        userId: user._id
      });

      const res = await axios.post(
        `${config.backendUrl}/api/groups/${groupId}/messages`,
        { text: newMessage },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Add the new message to the messages array
      setMessages(prevMessages => [...prevMessages, res.data]);
      setNewMessage('');

      // Scroll to bottom after sending message
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show appropriate error message
      if (error.response) {
        setError(error.response.data.msg || 'Failed to send message. Please try again.');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(error.message || 'Failed to send message. Please try again.');
      }
    }
  };

  const handleGroupClick = (group) => {
    console.log('handleGroupClick called with group:', group);
    setCurrentGroup(group);
    console.log('setCurrentGroup called in handleGroupClick, currentGroup is now:', group);
    navigate(`/groups/${group._id}`);
    // The useEffect dependent on groupId will call fetchGroupMessages
    // fetchGroupMessages(group._id);
  };

  useEffect(() => {
    console.log('useEffect for groupId and groups triggered.');
    console.log('Current groupId from useParams:', groupId);
    console.log('Current groups state:', groups);
    if (groupId) {
      console.log('groupId is present, fetching group messages for ID:', groupId);
      
      // Find the group object based on groupId from the URL
      const groupFromParams = groups.find(group => group._id === groupId);
      console.log('Group found from params:', groupFromParams);
      if (groupFromParams) {
        setCurrentGroup(groupFromParams);
        console.log('setCurrentGroup called in useEffect with group from params:', groupFromParams);
      } else {
        // Handle case where group is not found (e.g., invalid URL)
        setCurrentGroup(null);
        setMessages([]); // Clear messages if group is not found
        console.warn('Group not found for ID:', groupId);
        // Optionally navigate away or show an error
      }

      fetchGroupMessages(groupId);
    } else {
      // Clear current group and messages if no groupId is in the URL
      console.log('No groupId in URL, clearing currentGroup and messages.');
      setCurrentGroup(null);
      setMessages([]);
    }
  }, [groupId, groups]); // Depend on groupId and groups

  const fetchGroupMessages = async (groupId) => {
    console.log('Attempting to fetch messages for group ID:', groupId);
    try {
      console.log('Fetching messages for group ID:', groupId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const res = await axios.get(`${config.backendUrl}/api/groups/${groupId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.data || !Array.isArray(res.data)) {
        throw new Error('Invalid response format');
      }
      
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching group messages:', error);
      setError(error.response?.data?.message || 'Failed to load group messages. Please try again.');
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const res = await axios.post(`${config.backendUrl}/api/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return res.data.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        setAdminImage(imageUrl);
      }
    }
  };

  const handleEditFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        setEditAdminImage(imageUrl);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.description) return;
    
    try {
      setIsCreating(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', newGroup.name);
      formData.append('description', newGroup.description);
      formData.append('isPrivate', newGroup.isPrivate);
      formData.append('rules', newGroup.rules);
      formData.append('tags', newGroup.tags);
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      if (selectedFriends.length > 0) {
        formData.append('selectedFriends', JSON.stringify(selectedFriends));
      }

      const res = await axios.post(`${config.backendUrl}/api/groups`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setGroups([...groups, res.data]);
      setOpenDialog(false);
      setNewGroup({
        name: '',
        description: '',
        isPrivate: false,
        rules: '',
        tags: ''
      });
      setSelectedFriends([]);
      setCoverImage(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error creating group:', error);
      setError(error.response?.data?.msg || 'Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGroupMenuOpen = (event, group) => {
    console.log('Menu open for group:', group);
    setGroupMenuAnchor(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleGroupMenuClose = () => {
    setGroupMenuAnchor(null);
    setSelectedGroup(null);
  };

  const handleLeaveGroup = async () => {
    try {
      await axios.put(`${config.backendUrl}/api/groups/${selectedGroup._id}/leave`);
      setGroups(groups.filter(g => g._id !== selectedGroup._id));
      handleGroupMenuClose();
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await axios.delete(`${config.backendUrl}/api/groups/${selectedGroup._id}`);
      setGroups(groups.filter(g => g._id !== selectedGroup._id));
      handleGroupMenuClose();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleMessageMenuOpen = (event, message) => {
    event.stopPropagation();
    setMessageMenuAnchor(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
  };

  const startEditing = (message) => {
    console.log('Starting message edit:', message);
    setEditingMessage(message);
    setEditText(message.text);
  };

  const handleEditMessage = async () => {
    console.log('Attempting to save edited message:', { selectedMessage, editText, groupId });
    if (!editText.trim() || !socket || !selectedMessage || !groupId) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${config.backendUrl}/api/groups/${groupId}/messages/${selectedMessage._id}`,
        { text: editText },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Emit message updated event
      socket.emit('messageUpdated', {
        groupId,
        message: res.data
      });

      // Update message in UI
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === selectedMessage._id ? res.data : msg
        )
      );

      setEditingMessage(null);
      setEditText('');
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
      setError('Failed to edit message. Please try again.');
    }
  };

  const handleDeleteMessage = async () => {
    if (!socket || !selectedMessage) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${config.backendUrl}/api/groups/${groupId}/messages/${selectedMessage._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Remove message from UI
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== selectedMessage._id)
      );

      handleMessageMenuClose();
    } catch (error) {
      console.error('Error deleting message:', error);
      setError(error.response?.data?.msg || 'Failed to delete message. Please try again.');
    }
  };

  const handleEditGroup = async () => {
    console.log('Save button clicked', { selectedGroup, editGroupName });
    if (!editGroupName.trim() || !selectedGroup) return;

    try {
      setIsEditing(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Editing group:', {
        groupId: selectedGroup._id,
        name: editGroupName,
        description: editGroupDescription,
        adminImage: editAdminImage
      });

      const res = await axios.put(
        `${config.backendUrl}/api/groups/${selectedGroup._id}`,
        {
          name: editGroupName,
          description: editGroupDescription,
          adminImage: editAdminImage
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the groups list
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group._id === selectedGroup._id ? res.data : group
        )
      );

      // If this is the current group, update it
      if (currentGroup?._id === selectedGroup._id) {
        setCurrentGroup(res.data);
      }

      setEditDialogOpen(false);
      setEditGroupName('');
      setEditGroupDescription('');
      setEditAdminImage('');
      setSelectedGroup(null);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Group updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error editing group:', error);
      setError(error.response?.data?.msg || 'Failed to edit group. Please try again.');
      setSnackbar({
        open: true,
        message: error.response?.data?.msg || 'Failed to edit group',
        severity: 'error'
      });
    } finally {
      setIsEditing(false);
    }
  };

  const startEditingGroup = (group) => {
    console.log('Start editing group:', group);
    setSelectedGroup(group);
    setEditGroupName(group.name);
    setEditGroupDescription(group.description || '');
    setEditAdminImage(group.adminImage || '');
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedGroup(null);
    setEditGroupName('');
    setEditGroupDescription('');
    setEditAdminImage('');
  };

  const handleProfileClick = (user) => {
    if (user && user._id) {
      navigate(`/profile/${user._id}`);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${config.backendUrl}/api/groups/${groupId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroups();
    } catch (err) {
      setError('Failed to join group');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout title="Groups">
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
        flexGrow: 1,
        minHeight: '80vh',
      }}>
        {/* Left Sidebar - Groups List */}
        <Box sx={{
          width: { xs: '100%', md: 300 },
          borderRight: { md: `1px solid ${theme.palette.divider}` },
          display: { xs: groupId && isMobile ? 'none' : 'block', md: 'block' },
          height: '100%',
          overflowY: 'auto',
          bgcolor: isMobile ? 'background.paper' : 'inherit',
          zIndex: 2,
        }}>
          <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{
                  color: isDarkMode ? 'text.primary' : 'primary.main',
                  fontWeight: 'bold',
                  fontSize: isMobile ? 18 : 22
                }}
              >
                Groups
              </Typography>
              <IconButton
                onClick={() => setOpenDialog(true)}
                color="primary"
                sx={{
                  bgcolor: isDarkMode ? 'action.hover' : 'primary.light',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'action.selected' : 'primary.main',
                    color: 'white'
                  },
                  width: isMobile ? 40 : 36,
                  height: isMobile ? 40 : 36
                }}
              >
                <AddIcon fontSize={isMobile ? 'medium' : 'small'} />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              size={isMobile ? 'medium' : 'small'}
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color={isDarkMode ? 'inherit' : 'primary'} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: isDarkMode ? 'background.paper' : 'white',
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  fontSize: isMobile ? 16 : 14
                }
              }}
            />
            <List>
              {filteredGroups.map((group) => (
                <ListItem
                  key={group._id}
                  button
                  selected={currentGroup?._id === group._id}
                  onClick={() => handleGroupClick(group)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    bgcolor: currentGroup?._id === group._id
                      ? isDarkMode ? 'action.selected' : 'primary.light'
                      : 'transparent',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'action.hover' : 'primary.light',
                    },
                    minHeight: isMobile ? 56 : 48
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGroupMenuOpen(e, group);
                      }}
                      sx={{ color: isDarkMode ? 'text.secondary' : 'primary.main', width: isMobile ? 40 : 36, height: isMobile ? 40 : 36 }}
                      aria-label="Group options"
                    >
                      <MoreVertIcon fontSize={isMobile ? 'medium' : 'small'} />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    {group.adminImage ? (
                      <Avatar
                        src={
                          (group.adminImage.startsWith('http')
                            ? group.adminImage
                            : `${config.backendUrl}${group.adminImage.startsWith('/') ? '' : '/'}${group.adminImage}`
                          ) + `?t=${Date.now()}`
                        }
                        alt={group.name}
                        sx={{ width: isMobile ? 44 : 40, height: isMobile ? 44 : 40 }}
                        onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                      >
                        <GroupIcon />
                      </Avatar>
                    ) : (
                      <Avatar
                        sx={{
                          bgcolor: isDarkMode ? 'primary.dark' : 'primary.main',
                          width: isMobile ? 44 : 40,
                          height: isMobile ? 44 : 40
                        }}
                      >
                        <GroupIcon />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          color: isDarkMode ? 'text.primary' : 'text.primary',
                          fontWeight: currentGroup?._id === group._id ? 'bold' : 'normal',
                          fontSize: isMobile ? 16 : 15
                        }}
                      >
                        {group.name}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDarkMode ? 'text.secondary' : 'text.secondary',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: isMobile ? 13 : 12
                        }}
                      >
                        {group.description}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          p: { xs: 1, md: 2 },
          bgcolor: isDarkMode ? 'background.default' : 'grey.50',
          position: 'relative',
        }}>
          {isMobile && groupId && (
            <Button
              variant="text"
              onClick={() => navigate('/groups')}
              sx={{ mb: 1, alignSelf: 'flex-start', fontSize: 16 }}
            >
              ← Back to Groups
            </Button>
          )}
          {currentGroup ? (
            <>
              <Box sx={{ 
                mb: { xs: 1.5, md: 2 },
                p: 2,
                borderRadius: 2,
                bgcolor: isDarkMode ? 'background.paper' : 'white',
                boxShadow: 1,
                flexShrink: 0,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {currentGroup.adminImage ? (
                    <Avatar
                      src={
                        (currentGroup.adminImage.startsWith('http')
                          ? currentGroup.adminImage
                          : `${config.backendUrl}${currentGroup.adminImage.startsWith('/') ? '' : '/'}${currentGroup.adminImage}`
                        ) + `?t=${Date.now()}`
                      }
                      alt={currentGroup.name}
                      sx={{ width: 40, height: 40 }}
                      onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    />
                  ) : (
                    <Avatar
                      sx={{ width: 40, height: 40, bgcolor: isDarkMode ? 'primary.dark' : 'primary.main' }}
                    >
                      <GroupIcon />
                    </Avatar>
                  )}
                <Typography 
                  variant="h6"
                  sx={{
                    color: isDarkMode ? 'text.primary' : 'primary.main',
                    fontWeight: 'bold'
                  }}
                >
                  {currentGroup.name}
                </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: isDarkMode ? 'text.secondary' : 'text.secondary',
                    mt: 0.5
                  }}
                >
                  {currentGroup.description}
                </Typography>
              </Box>
              
              {/* Messages Container */}
              <Box 
                sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  mb: { xs: 1.5, md: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  p: 1,
                  bgcolor: isDarkMode ? 'background.paper' : 'white',
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  messages.map((message, index) => (
                    <Box
                      key={message._id || index}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender?._id === user?._id ? 'flex-end' : 'flex-start',
                        mb: 1,
                        gap: 1,
                        alignItems: 'flex-start'
                      }}
                    >
                      {message.sender?._id !== user?._id && (
                        <Tooltip title="View Profile">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                            <Avatar
                              src={getBestProfileImage(message.sender)}
                              alt={message.sender?.username || 'User'}
                              sx={{ 
                                width: 32, 
                                height: 32,
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 0.8
                                }
                              }}
                              onClick={() => message.sender && handleProfileClick(message.sender)}
                              onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                            >
                              {message.sender?.username?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', maxWidth: 40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {message.sender?.username || 'User'}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          maxWidth: { xs: '85%', md: '70%' },
                          borderRadius: 2,
                          bgcolor: message.sender?._id === user?._id 
                            ? isDarkMode ? 'primary.dark' : 'primary.main'
                            : isDarkMode ? 'background.paper' : 'grey.100',
                          color: message.sender?._id === user?._id 
                            ? 'white' 
                            : isDarkMode ? 'text.primary' : 'text.primary',
                          position: 'relative',
                          '&:hover': {
                            '& .message-menu': {
                              opacity: 1,
                            },
                          }
                        }}
                      >
                        {editingMessage?._id === message._id ? (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleEditMessage();
                                }
                              }}
                              autoFocus
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  color: 'inherit',
                                  '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                  },
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={handleEditMessage}
                              sx={{ color: 'inherit' }}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingMessage(null);
                                setEditText('');
                              }}
                              sx={{ color: 'inherit' }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        ) : (
                          <>
                            <Typography variant="body1">{message.text}</Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                display: 'block',
                                textAlign: 'right',
                                mt: 0.5,
                                opacity: 0.7,
                                color: message.sender?._id === user?._id 
                                  ? 'rgba(255, 255, 255, 0.7)' 
                                  : isDarkMode ? 'text.secondary' : 'text.secondary'
                              }}
                            >
                              {new Date(message.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                            {message.sender?._id === user?._id && (
                              <Tooltip title="Message Options">
                                <IconButton
                                  size="small"
                                  className="message-menu"
                                  onClick={(e) => handleMessageMenuOpen(e, message)}
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    color: 'inherit',
                                    '&:hover': {
                                      opacity: 1,
                                    },
                                  }}
                                >
                                  <MoreVertIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </>
                        )}
                      </Paper>
                      {message.sender?._id === user?._id && (
                        <Tooltip title="View Profile">
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                            <Avatar
                              src={getBestProfileImage(message.sender)}
                              alt={message.sender?.username || 'User'}
                              sx={{ 
                                width: 32, 
                                height: 32,
                                cursor: 'pointer',
                                '&:hover': {
                                  opacity: 0.8
                                }
                              }}
                              onClick={() => message.sender && handleProfileClick(message.sender)}
                              onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                            >
                              {message.sender?.username?.[0]?.toUpperCase() || 'U'}
                            </Avatar>
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', textAlign: 'center', maxWidth: 40, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {message.sender?.username || 'User'}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box 
                sx={{
                  display: 'flex', 
                  gap: 1,
                  p: 1,
                  bgcolor: isDarkMode ? 'background.paper' : 'white',
                  borderRadius: 2,
                  boxShadow: 1,
                  flexShrink: 0,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: isDarkMode ? 'background.paper' : 'white',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: isDarkMode ? 'primary.dark' : 'primary.main',
                    '&:hover': {
                      bgcolor: isDarkMode ? 'primary.main' : 'primary.dark',
                    }
                  }}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDarkMode ? 'background.paper' : 'white',
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography 
                variant="h6" 
                sx={{
                  color: isDarkMode ? 'text.secondary' : 'text.secondary',
                  textAlign: 'center',
                  p: 2
                }}
              >
                Select a group to start chatting
              </Typography>
            </Box>
          )}
        </Box>

        {/* Create Group Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? 'background.paper' : 'white',
              borderRadius: 2,
              width: '100%',
              m: 0,
              p: 0,
              ...(isMobile && { maxWidth: '100vw', minWidth: '100vw' })
            }
          }}
        >
          <DialogTitle sx={{ 
            color: isDarkMode ? 'text.primary' : 'primary.main',
            fontWeight: 'bold'
          }}>
            Create New Group
          </DialogTitle>
          <DialogContent>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
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
                {coverImage ? (
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <TextField
                autoFocus
                label="Group Name"
                fullWidth
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                disabled={isCreating}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDarkMode ? 'background.paper' : 'white',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                disabled={isCreating}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDarkMode ? 'background.paper' : 'white',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Add Friends to Group
              </Typography>
              
              {isLoadingFriends ? (
                <CircularProgress size={20} />
              ) : (
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {friends.map((friend) => (
                    <ListItem
                      key={friend._id}
                      button
                      onClick={() => {
                        setSelectedFriends(prev => 
                          prev.includes(friend._id)
                            ? prev.filter(id => id !== friend._id)
                            : [...prev, friend._id]
                        );
                      }}
                      selected={selectedFriends.includes(friend._id)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={getProfileImageUrl(friend.profilePicture || friend.avatar) || fallbackImage}
                          alt={friend.username}
                        />
                      </ListItemAvatar>
                      <ListItemText primary={friend.username} />
                      {selectedFriends.includes(friend._id) && (
                        <CheckIcon color="primary" />
                      )}
                    </ListItem>
                  ))}
                </Box>
              )}

              <TextField
                label="Rules (comma-separated)"
                fullWidth
                value={newGroup.rules}
                onChange={(e) => setNewGroup({ ...newGroup, rules: e.target.value })}
                disabled={isCreating}
                helperText="Enter rules separated by commas"
              />
              
              <TextField
                label="Tags (comma-separated)"
                fullWidth
                value={newGroup.tags}
                onChange={(e) => setNewGroup({ ...newGroup, tags: e.target.value })}
                disabled={isCreating}
                helperText="Enter tags separated by commas"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)} 
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              variant="contained"
              disabled={!newGroup.name || !newGroup.description || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Group Menu */}
        <Menu
          anchorEl={groupMenuAnchor}
          open={Boolean(groupMenuAnchor)}
          onClose={handleGroupMenuClose}
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? 'background.paper' : 'white',
              borderRadius: 2,
              boxShadow: 2
            }
          }}
        >
          {isAdmin && (
            <>
              <MenuItem 
                onClick={() => startEditingGroup(selectedGroup)}
                sx={{
                  color: isDarkMode ? 'text.primary' : 'text.primary',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'action.hover' : 'primary.light',
                  }
                }}
              >
                <ListItemIcon>
                  <EditIcon fontSize="small" color={isDarkMode ? 'inherit' : 'primary'} />
                </ListItemIcon>
                Edit Group
              </MenuItem>
              <MenuItem 
                onClick={handleDeleteGroup}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'action.hover' : 'error.light',
                  }
                }}
              >
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete Group
              </MenuItem>
            </>
          )}
          <MenuItem 
            onClick={handleLeaveGroup}
            sx={{
              color: isDarkMode ? 'text.primary' : 'text.primary',
              '&:hover': {
                bgcolor: isDarkMode ? 'action.hover' : 'primary.light',
              }
            }}
          >
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" color={isDarkMode ? 'inherit' : 'primary'} />
            </ListItemIcon>
            Leave Group
          </MenuItem>
        </Menu>

        {/* Message Menu */}
        <Menu
          anchorEl={messageMenuAnchor}
          open={Boolean(messageMenuAnchor)}
          onClose={handleMessageMenuClose}
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? 'background.paper' : 'white',
              borderRadius: 2,
              boxShadow: 2
            }
          }}
        >
          <MenuItem 
            onClick={() => startEditing(selectedMessage)}
            sx={{
              color: isDarkMode ? 'text.primary' : 'text.primary',
              '&:hover': {
                bgcolor: isDarkMode ? 'action.hover' : 'primary.light',
              }
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" color={isDarkMode ? 'inherit' : 'primary'} />
            </ListItemIcon>
            Edit
          </MenuItem>
          <MenuItem 
            onClick={handleDeleteMessage}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: isDarkMode ? 'action.hover' : 'error.light',
              }
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>

        {/* Edit Group Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleEditDialogClose}
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
            Edit Group
          </DialogTitle>
          <DialogContent>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
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
                onClick={() => fileInputRef.current.click()}
              >
                {editAdminImage ? (
                  <img
                    src={editAdminImage}
                    alt="Admin"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                )}
              </Box>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleEditFileChange}
              />
              <TextField
                autoFocus
                label="Group Name"
                fullWidth
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                disabled={isEditing}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDarkMode ? 'background.paper' : 'white',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={editGroupDescription}
                onChange={(e) => setEditGroupDescription(e.target.value)}
                disabled={isEditing}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: isDarkMode ? 'background.paper' : 'white',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleEditDialogClose} 
              disabled={isEditing}
              sx={{
                color: isDarkMode ? 'text.primary' : 'primary.main'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditGroup}
              variant="contained"
              disabled={!editGroupName.trim() || isEditing}
              sx={{ 
                bgcolor: isDarkMode ? 'primary.dark' : 'primary.main',
                '&:hover': {
                  bgcolor: isDarkMode ? 'primary.main' : 'primary.dark',
                }
              }}
            >
              {isEditing ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profile Dialog */}
        <Dialog
          open={profileDialogOpen}
          onClose={() => setProfileDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: isDarkMode ? 'background.paper' : 'white',
              borderRadius: 2
            }
          }}
        >
          {selectedProfile && (
            <>
              <DialogTitle sx={{ 
                color: isDarkMode ? 'text.primary' : 'primary.main',
                fontWeight: 'bold'
              }}>
                User Profile
              </DialogTitle>
              <DialogContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2,
                  p: 2
                }}>
                  <Avatar
                    src={getProfileImageUrl(selectedProfile?.profilePicture || selectedProfile?.avatar) || fallbackImage}
                    alt={selectedProfile?.username || 'User'}
                    sx={{ width: 100, height: 100 }}
                    onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                  >
                    {(!selectedProfile?.profilePicture && !selectedProfile?.avatar && selectedProfile?.username)
                      ? selectedProfile?.username[0]?.toUpperCase()
                      : null}
                  </Avatar>
                  <Typography variant="h6" sx={{ color: isDarkMode ? 'text.primary' : 'text.primary' }}>
                    {selectedProfile?.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDarkMode ? 'text.secondary' : 'text.secondary' }}>
                    {selectedProfile?.email}
                  </Typography>
                  <Chip 
                    label={selectedProfile?.role || 'User'} 
                    color={selectedProfile?.role === 'admin' ? 'primary' : 'default'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setProfileDialogOpen(false)}
                  sx={{
                    color: isDarkMode ? 'text.primary' : 'primary.main'
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Add Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  );
};

export default Groups;