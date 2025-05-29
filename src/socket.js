import io from 'socket.io-client';

// Create socket instance
const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Socket connection event handlers
socket.on('connect', () => {
    console.log('Socket connected');
});

socket.on('disconnect', () => {
    console.log('Socket disconnected');
});

socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

export const initializeSocket = (token) => {
    if (token) {
        socket.auth = { token };
        socket.connect();
    }
};

export const disconnectSocket = () => {
    socket.disconnect();
}; 
