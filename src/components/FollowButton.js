import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckIcon from '@mui/icons-material/Check';
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled';
import { socket } from '../socket';  // Make sure this import path is correct

const FollowButton = ({ targetUserId, onFollowChange }) => {
    const { user, token } = useAuth();
    const [followStatus, setFollowStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const checkTimeoutRef = useRef(null);

    useEffect(() => {
        if (user && targetUserId && token) {
            // Clear any existing timeout
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
            }

            // Set a new timeout to debounce the API call
            checkTimeoutRef.current = setTimeout(async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/follows/check/${targetUserId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    console.log('Follow status response:', response.data);
                    setFollowStatus(response.data);
                } catch (error) {
                    console.error('Error checking follow status:', error.response?.data || error);
                    setFollowStatus({ isFollowing: false, status: null });
                }
            }, 500); // 500ms debounce
        }

        // Cleanup timeout on unmount
        return () => {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
            }
        };
    }, [user, targetUserId, token]);

    useEffect(() => {
        // Socket event listener for follow status updates
        const handleFollowStatusUpdate = (data) => {
            console.log('Received follow status update:', data);
            if (
                (data.followerId === user?._id && data.followingId === targetUserId) ||
                (data.followingId === user?._id && data.followerId === targetUserId)
            ) {
                setFollowStatus(prevStatus => ({
                    ...prevStatus,
                    status: data.status,
                    isFollowing: data.status === 'accepted'
                }));
            }
        };

        socket.on('followStatusUpdated', handleFollowStatusUpdate);

        return () => {
            socket.off('followStatusUpdated', handleFollowStatusUpdate);
        };
    }, [user?._id, targetUserId]);

    const handleFollow = async () => {
        if (!user || !token) return;
        setLoading(true);
        try {
            if (followStatus?.status === 'accepted') {
                // Unfollow
                const response = await axios.delete(`http://localhost:5000/api/follows/${targetUserId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Unfollow response:', response.data);
                setFollowStatus({ isFollowing: false, status: null });
            } else {
                // Follow
                const response = await axios.post(`http://localhost:5000/api/follows/${targetUserId}`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Follow response:', response.data);
                setFollowStatus({ isFollowing: false, status: 'pending' });
            }
            if (onFollowChange) {
                onFollowChange();
            }
        } catch (error) {
            console.error('Error toggling follow:', error.response?.data || error);
            alert(error.response?.data?.message || 'Error following/unfollowing user');
        } finally {
            setLoading(false);
        }
    };

    // Don't show button if:
    // 1. No user is logged in
    // 2. No target user ID provided
    // 3. User is viewing their own profile
    if (!user || !targetUserId || user._id === targetUserId) {
        return null;
    }

    const getButtonProps = () => {
        if (!followStatus) {
            return {
                variant: 'contained',
                color: 'primary',
                startIcon: <PersonAddIcon />,
                children: 'Follow'
            };
        }
        
        if (followStatus.status === 'pending') {
            return {
                variant: 'outlined',
                color: 'primary',
                startIcon: <PersonAddDisabledIcon />,
                children: 'Requested'
            };
        }
        
        if (followStatus.status === 'accepted') {
            return {
                variant: 'outlined',
                color: 'secondary',
                startIcon: <PersonRemoveIcon />,
                children: 'Following'
            };
        }
        
        return {
            variant: 'contained',
            color: 'primary',
            startIcon: <PersonAddIcon />,
            children: 'Follow'
        };
    };

    return (
        <Button
            {...getButtonProps()}
            onClick={handleFollow}
            disabled={loading}
            sx={{
                borderRadius: '20px',
                textTransform: 'none',
                fontWeight: 'bold',
                minWidth: '120px'
            }}
        />
    );
};

export default FollowButton; 