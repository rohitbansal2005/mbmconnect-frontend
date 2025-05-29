import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import config from '../config';

const OTPVerification = ({ email, onVerificationSuccess, onCancel }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(`${config.backendUrl}/api/auth/verify-otp`, {
                email,
                otp
            });
            if (response.data.success) {
                onVerificationSuccess();
            } else {
                setError(response.data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await axios.post(`${config.backendUrl}/api/auth/resend-otp`, {
                email
            });
            if (response.data.success) {
                setTimer(60);
                setCanResend(false);
                setError('');
            } else {
                setError(response.data.message || 'Failed to resend OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom align="center">
                Verify Your Email
            </Typography>
            <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
                We've sent a verification code to {email}
            </Typography>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            <TextField
                fullWidth
                label="Enter OTP"
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
                onClick={handleVerify}
                disabled={loading || !otp}
                sx={{ mt: 2 }}
            >
                {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Didn\'t receive the code?'}
                </Typography>
                <Button
                    color="primary"
                    onClick={handleResendOTP}
                    disabled={!canResend || loading}
                    sx={{ mt: 1 }}
                >
                    Resend OTP
                </Button>
            </Box>
            <Button
                fullWidth
                variant="text"
                onClick={onCancel}
                disabled={loading}
                sx={{ mt: 2 }}
            >
                Cancel
            </Button>
        </Paper>
    );
};

export default OTPVerification; 