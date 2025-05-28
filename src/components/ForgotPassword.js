import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    LinearProgress
} from '@mui/material';
import axios from 'axios';

const ForgotPassword = ({ onClose }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];

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

    const validatePassword = () => {
        if (newPassword.length < 8) return 'Password must be at least 8 characters long';
        if (!/[A-Z]/.test(newPassword)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(newPassword)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(newPassword)) return 'Password must contain at least one number';
        if (!/[^A-Za-z0-9]/.test(newPassword)) return 'Password must contain at least one special character';
        return '';
    };

    const handleSendOTP = async () => {
        setError('');
        setLoading(true);
        try {
            console.log('Sending forgot password OTP request for email:', email);
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
            console.log('Forgot password OTP response:', response.data);
            if (response.data.success) {
                setActiveStep(1);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            console.error('Forgot password OTP error:', err);
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', {
                email,
                otp
            });
            if (response.data.success) {
                setActiveStep(2);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError('');
        const passwordError = validatePassword();
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            if (response.data.success) {
                onClose();
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:5000/api/auth/resend-reset-otp', { email });
            if (response.data.success) {
                setError('');
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <>
                        <Typography variant="body1" gutterBottom>
                            Enter your email address to receive a verification code.
                        </Typography>
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
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleSendOTP}
                            disabled={loading || !email}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Send Verification Code'}
                        </Button>
                    </>
                );
            case 1:
                return (
                    <>
                        <Typography variant="body1" gutterBottom>
                            Enter the verification code sent to your email.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Verification Code"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleVerifyOTP}
                            disabled={loading || !otp}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Verify Code'}
                        </Button>
                        <Button
                            fullWidth
                            variant="text"
                            onClick={handleResendOTP}
                            disabled={loading}
                            sx={{ mt: 1 }}
                        >
                            Resend Code
                        </Button>
                    </>
                );
            case 2:
                return (
                    <>
                        <Typography variant="body1" gutterBottom>
                            Enter your new password.
                        </Typography>
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setPasswordStrength(checkPasswordStrength(e.target.value));
                            }}
                            margin="normal"
                            required
                            disabled={loading}
                            helperText="Password must be at least 8 characters long and contain uppercase, lowercase, number and special character"
                        />
                        {newPassword && (
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
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleResetPassword}
                            disabled={loading || passwordStrength < 80 || !confirmPassword}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
                        </Button>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center">
                Reset Password
            </Typography>
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {renderStepContent(activeStep)}
            <Button
                fullWidth
                variant="text"
                onClick={onClose}
                disabled={loading}
                sx={{ mt: 2 }}
            >
                Cancel
            </Button>
        </Paper>
    );
};

export default ForgotPassword; 