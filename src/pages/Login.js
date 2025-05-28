import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Dialog
} from '@mui/material';
import ForgotPassword from '../components/ForgotPassword';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result && result.success) {
        navigate('/home');
      } else {
        setError(result?.message || "An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Box
              component="img"
              src="/mbmlogo.png"
              alt="MBMConnect"
              sx={{ height: 40, mr: 1 }}
            />
            <Typography variant="h4" component="h1">
              MBMConnect
            </Typography>
          </Box>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              color="primary"
              onClick={() => setShowForgotPassword(true)}
              disabled={loading}
            >
              Forgot Password?
            </Button>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/register')}
                disabled={loading}
              >
                Register here
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Dialog 
        open={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)}
        maxWidth="sm"
        fullWidth
      >
        <ForgotPassword onClose={() => setShowForgotPassword(false)} />
      </Dialog>
    </Container>
  );
};

export default Login; 