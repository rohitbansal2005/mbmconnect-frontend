import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    IconButton,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import PageLayout from '../components/PageLayout';
import { getBestProfileImage, fallbackImage } from '../utils/imageUtils';
import config from '../config';

const Messages = () => {
    console.log('Messages component rendered');
    const { userId } = useParams();
    console.log('Messages: userId from useParams', userId);
    const navigate = useNavigate();
    const { token, user, socket, onlineUsers } = useAuth();
    const { isDarkMode } = useAppTheme();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!userId) {
            // If no userId is provided, show the messages list
            fetchAllMessages();
            return;
        }

        const fetchRecipient = async () => {
            try {
                const response = await axios.get(`${config.backendUrl}/api/users/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setRecipient(response.data);
            } catch (error) {
                console.error('Error fetching recipient:', error);
                setError('Failed to load user data');
            }
        };

        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${config.backendUrl}/api/messages/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
                setError('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchRecipient();
            fetchMessages();
            // Join user's room when userId is available
            if (socket && user?._id) {
                socket.emit('joinUserRoom', user._id);
            }
            // Join recipient's room if needed for direct messages
            if (socket && userId) {
                socket.emit('joinUserRoom', userId);
            }
        } else {
            fetchAllMessages();
        }
    }, [userId, token, socket, user]);

    const fetchAllMessages = async () => {
        try {
            const response = await axios.get(`${config.backendUrl}/api/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching all messages:', error);
            setError('Failed to load messages');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (socket) {
            const handleNewMessage = (message) => {
                console.log('Received new message:', message);
                // Check if the message is for the current chat (if userId is defined)
                if (!userId || (message.sender?._id === userId) || (message.recipient?._id === userId)) {
                    setMessages(prev => [...prev, message]);
                    scrollToBottom();
                }
            };

            const handleMessageSent = (message) => {
                console.log('Message sent confirmation:', message);
                // Optionally add the sent message to the UI immediately
                // if (!userId || (message.sender?._id === userId) || (message.recipient?._id === userId)) {
                //    setMessages(prev => [...prev, message]);
                //    scrollToBottom();
                // }
            };

            socket.on('newMessage', handleNewMessage);
            socket.on('messageSent', handleMessageSent);

            return () => {
                socket.off('newMessage', handleNewMessage);
                socket.off('messageSent', handleMessageSent);
            };
        }

    }, [socket, userId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !userId || !socket || !user) return;

        try {
            // Use the socket from useAuth
            socket.emit('sendMessage', { recipientId: userId, text: newMessage, senderId: user._id });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    // If no userId is provided, show the messages list
    if (!userId) {
        console.log('Messages: Rendering all messages list', { loading, error, userId, recipient, messages: messages.length });
        return (
            <PageLayout title="Messages">
                <List>
                    {messages.map((message) => {
                        // Ensure sender and recipient are populated if needed here
                        const otherUser = message.sender?._id === user?._id ? message.recipient : message.sender;
                        if (!otherUser) return null; // Add check for otherUser
                        return (
                            <ListItem
                                key={message._id}
                                button
                                onClick={() => navigate(`/messages/${otherUser._id}`)}
                            >
                                <ListItemAvatar>
                                    {/* Use getBestProfileImage for consistent avatar handling */}
                                    <Avatar
                                        src={getBestProfileImage(otherUser)}
                                        alt={otherUser.username}
                                        onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                                    >
                                        {otherUser.username?.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={otherUser.username}
                                    secondary={message.text}
                                    secondaryTypographyProps={{
                                        noWrap: true,
                                        style: { maxWidth: '200px' }
                                    }}
                                />
                            </ListItem>
                        );
                    })}
                </List>
            </PageLayout>
        );
    }

    console.log('Messages: Rendering chat UI', { loading, error, userId, recipient, messages: messages.length });
    // Only render chat UI if userId and recipient are available
    if (!userId || !recipient) {
      console.log('Messages: Skipping chat UI render because userId or recipient is missing', { userId, recipient });
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography color="text.secondary">Select a conversation</Typography>
        </Box>
      );
    }

    return (
        <PageLayout title="Messages">
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
                {/* Header */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        bgcolor: isDarkMode ? 'background.paper' : 'white'
                    }}
                >
                    <IconButton onClick={() => navigate('/messages')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Avatar
                        src={recipient?.profilePicture || recipient?.avatar}
                        alt={recipient?.username}
                        sx={{ width: 40, height: 40 }}
                    >
                        {recipient?.username?.charAt(0)}
                    </Avatar>
                    <Typography variant="h6">{recipient?.username}</Typography>
                </Paper>

                {/* Messages */}
                <Box
                    sx={{
                        flex: 1,
                        overflow: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        bgcolor: isDarkMode ? 'background.default' : 'grey.50'
                    }}
                >
                    {messages.map((message) => (
                        <Box
                            key={message._id}
                            sx={{
                                display: 'flex',
                                justifyContent: message.sender._id === user._id ? 'flex-end' : 'flex-start',
                                gap: 1
                            }}
                        >
                            {message.sender._id !== user._id && (
                                <Avatar
                                    src={recipient?.profilePicture || recipient?.avatar}
                                    alt={recipient?.username}
                                    sx={{ width: 32, height: 32 }}
                                >
                                    {recipient?.username?.charAt(0)}
                                </Avatar>
                            )}
                            <Paper
                                elevation={1}
                                sx={{
                                    p: 1.5,
                                    maxWidth: '70%',
                                    borderRadius: 2,
                                    bgcolor: message.sender._id === user._id
                                        ? isDarkMode ? 'primary.dark' : 'primary.main'
                                        : isDarkMode ? 'background.paper' : 'white',
                                    color: message.sender._id === user._id
                                        ? 'white'
                                        : isDarkMode ? 'text.primary' : 'text.primary'
                                }}
                            >
                                <Typography variant="body1">{message.text}</Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        textAlign: 'right',
                                        mt: 0.5,
                                        opacity: 0.7
                                    }}
                                >
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </Paper>
                            {message.sender._id === user._id && (
                                <Avatar
                                    src={user.profilePicture || user.avatar}
                                    alt={user.username}
                                    sx={{ width: 32, height: 32 }}
                                >
                                    {user.username?.charAt(0)}
                                </Avatar>
                            )}
                        </Box>
                    ))}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        display: 'flex',
                        gap: 1,
                        bgcolor: isDarkMode ? 'background.paper' : 'white'
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                            }
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        sx={{
                            borderRadius: 2,
                            minWidth: 'auto',
                            px: 2
                        }}
                    >
                        <SendIcon />
                    </Button>
                </Paper>
            </Box>
        </PageLayout>
    );
};

export default Messages; 