const config = {
  backendUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  socketUrl: process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'
};

export default config; 