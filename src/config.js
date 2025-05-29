const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
    backendUrl: isDevelopment 
        ? 'http://localhost:5000/api'
        : 'https://mbmconnect-backend.onrender.com/api',
    socketUrl: isDevelopment 
        ? 'http://localhost:5000'
        : 'https://mbmconnect-backend.onrender.com',
    isDevelopment
};

export default config; 
