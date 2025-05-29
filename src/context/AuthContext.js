import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import io from 'socket.io-client'; // Import socket.io-client
import { initializeSocket, disconnectSocket } from '../socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    // Add state for socket, online users, messages, and unread count
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState([]); // State for messages
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0); // State for unread count
    const [typingUsers, setTypingUsers] = useState({}); // State for users currently typing

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUserData();
            // Fetch initial messages when token is available
            fetchMessages();
        } else {
            setLoading(false);
        }
    }, [token]);

    // Effect to manage the socket connection
    useEffect(() => {
        if (user) {
            console.log('Initializing socket with URL:', config.socketUrl);
            const socket = io(config.socketUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                withCredentials: true,
                path: '/socket.io',
                forceNew: true,
                timeout: 10000,
                autoConnect: true
            });

            socket.on('connect_error', (error) => {
                console.log('Socket connection error:', error);
                // Attempt to reconnect with polling if websocket fails
                if (socket.io.opts.transports[0] === 'websocket') {
                    console.log('Switching to polling transport');
                    socket.io.opts.transports = ['polling', 'websocket'];
                }
            });

            socket.on('connect', () => {
                console.log('Socket connected successfully');
                // Emit userLogin event after successful connection
                if (user._id) {
                    console.log('Emitting userLogin event for user:', user._id);
                    socket.emit('userLogin', user._id);
                }
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                if (reason === 'io server disconnect') {
                    // Server initiated disconnect, try to reconnect
                    socket.connect();
                }
            });

            socket.on('reconnect_attempt', (attemptNumber) => {
                console.log('Socket reconnection attempt:', attemptNumber);
            });

            socket.on('reconnect_failed', () => {
                console.log('Socket reconnection failed');
            });

            socket.on('userData', (data) => {
                console.log('User data received:', data);
                if (data.user) {
                    setUser(data.user);
                }
            });

            socket.on('receiveMessage', (message) => {
                console.log('New message received:', message);
                setMessages(prevMessages => {
                    const exists = prevMessages.some(m => m._id === message._id);
                    if (exists) return prevMessages;
                    return [...prevMessages, message];
                });
            });

            socket.on('messageUpdated', (message) => {
                console.log('Message updated:', message);
                setMessages(prevMessages => 
                    prevMessages.map(msg => 
                        msg._id === message._id ? message : msg
                    )
                );
            });

            socket.on('messageDeleted', (data) => {
                console.log('Message deleted:', data);
                setMessages(prevMessages => 
                    prevMessages.filter(msg => msg._id !== data.messageId)
                );
            });

            socket.on('userStatus', (data) => {
                console.log('User status update:', data);
                setOnlineUsers(prev => {
                    const newStatus = { ...prev };
                    newStatus[data.userId] = data.status;
                    return newStatus;
                });
            });

            socket.on('userTyping', (data) => {
                console.log('User typing:', data);
                setTypingUsers(prev => {
                    const newTyping = { ...prev };
                    newTyping[data.userId] = data.isTyping;
                    return newTyping;
                });
            });

            socket.on('onlineUsers', (users) => {
                console.log('Received online users:', users);
                setOnlineUsers(users);
            });

            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(socket);

            return () => {
                socket.off('connect_error');
                socket.off('connect');
                socket.off('disconnect');
                socket.off('reconnect_attempt');
                socket.off('reconnect_failed');
                socket.disconnect();
            };
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            if (!token) return;
            const response = await axios.get(`${config.backendUrl}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('User data received:', response.data);
            const userData = response.data.user;
            if (!userData || !userData._id) {
                throw new Error('Invalid user data received');
            }

            const userWithId = {
                ...userData,
                _id: userData._id
            };

            console.log('Setting user data:', userWithId);
            setUser(userWithId);
            localStorage.setItem('user', JSON.stringify(userWithId));

            // Removed socket.emit('userLogin') from here, now handled in the socket effect

        } catch (error) {
            console.error('Error fetching user data:', error.response?.data || error.message);
            logout(); // This will trigger the cleanup in the socket effect
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch initial messages
    const fetchMessages = async () => {
      try {
        if (!token) return;
        const response = await axios.get(`${config.backendUrl}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Initial messages fetched:', response.data);
        setMessages(response.data);
        // Calculate initial unread count
        setUnreadMessagesCount(response.data.filter(msg => !msg.read && msg.recipient?._id === user?._id).length);
      } catch (error) {
        console.error('Error fetching initial messages:', error.response?.data || error.message);
        setMessages([]);
        setUnreadMessagesCount(0);
      }
    };

    // Function to mark messages as read
    const markMessagesAsRead = async (conversationPartnerId = null) => {
      try {
          if (!token || !user?._id) return;
          // Emit socket event to inform backend
          if (socket) {
              socket.emit('markMessagesAsRead', {
                  userId: user._id,
                  conversationPartnerId: conversationPartnerId // Optional: mark specific conversation as read
              });
          }

          // Optimistically update state
          setMessages(prevMessages =>
              prevMessages.map(msg => {
                  // Mark messages as read if the current user is the recipient
                  // and either no specific conversation is specified or it's within the specified conversation
                  const isForCurrentUser = msg.recipient?._id === user._id;
                  const isRelevantConversation = !conversationPartnerId ||
                                               (msg.sender?._id === conversationPartnerId || msg.recipient?._id === conversationPartnerId);

                  if (isForCurrentUser && isRelevantConversation) {
                      return { ...msg, read: true };
                  }
                  return msg;
              })
          );
          // Recalculate unread count after optimistic update
          setUnreadMessagesCount(prevMessages => prevMessages.filter(msg => !msg.read && msg.recipient?._id === user?._id).length);

          // Optional: You could also make an API call to persist this, but socket event is usually sufficient
          // await axios.post(`${config.backendUrl}/api/messages/mark-read`, { conversationPartnerId }, {
          //     headers: { Authorization: `Bearer ${token}` }
          // });

      } catch (error) {
          console.error('Error marking messages as read:', error.response?.data || error.message);
          // Handle error, potentially revert optimistic update or refetch
      }
    };

    const login = (userData, token) => {
        setUser(userData);
        setToken(token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        initializeSocket(token);  // Initialize socket connection
    };

    const register = async (username, email, password) => {
        try {
            const response = await axios.post(`${config.backendUrl}/api/users`, {
                username,
                email,
                password
            });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            setToken(token);
            
            // Removed socket.emit('userLogin') from here, now handled in the socket effect

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'An error occurred during registration'
            };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        disconnectSocket();  // Disconnect socket
    };

    return (
        // Provide socket, onlineUsers, messages, unreadMessagesCount, and markMessagesAsRead through AuthContext
        <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, socket, onlineUsers, messages, unreadMessagesCount, markMessagesAsRead, typingUsers }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
