import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    LinearProgress
} from '@mui/material';
import OTPVerification from '../components/OTPVerification';
import axios from 'axios';
import config from '../config';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const { register } = useAuth();

    const checkPasswordStrength = (pass) => {
        let strength = 0;
        if (pass.length >= 8) strength += 20;
        if (/[A-Z]/.test(pass)) strength += 20;
        if (/[a-z]/.test(pass)) strength += 20;
        if (/[0-9]/.test(pass)) strength += 20;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 20;
        return strength;
    };

    const getPasswordStrengthColor = (strength) => {
        if (strength <= 20) return 'error';
        if (strength <= 40) return 'warning';
        if (strength <= 60) return 'info';
        if (strength <= 80) return 'primary';
        return 'success';
    };

    const getPasswordStrengthText = (strength) => {
        if (strength <= 20) return 'Very Weak';
        if (strength <= 40) return 'Weak';
        if (strength <= 60) return 'Medium';
        if (strength <= 80) return 'Strong';
        return 'Very Strong';
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(checkPasswordStrength(newPassword));
    };

    const validatePassword = () => {
        if (password.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
        if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
        return '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`${config.backendUrl}/api/auth/send-otp`, { email });
            if (response.data.success) {
                setShowOTP(true);
            } else {
                setError(response.data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        }
    };

    const handleVerificationSuccess = async () => {
        const result = await register(username, email, password);
        if (result.success) {
            navigate('/home');
        } else {
            setError(result.message);
            setShowOTP(false);
        }
    };

    if (showOTP) {
        return (
            <Container maxWidth="sm">
                <OTPVerification
                    email={email}
                    onVerificationSuccess={handleVerificationSuccess}
                    onCancel={() => setShowOTP(false)}
                />
            </Container>
        );
    }

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
                        Create an Account
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            margin="normal"
                            required
                            helperText="Password must be at least 8 characters long and contain uppercase, lowercase, number and special character"
                        />
                        {password && (
                            <Box sx={{ mt: 1, mb: 2 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={passwordStrength} 
                                    color={getPasswordStrengthColor(passwordStrength)}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Password Strength: {getPasswordStrengthText(passwordStrength)}
                                </Typography>
                            </Box>
                        )}
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            margin="normal"
                            required
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3 }}
                            disabled={passwordStrength < 80}
                        >
                            Send Verification Code
                        </Button>
                    </form>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            Already have an account?{' '}
                            <Button
                                color="primary"
                                onClick={() => navigate('/login')}
                            >
                                Login here
                            </Button>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register; 