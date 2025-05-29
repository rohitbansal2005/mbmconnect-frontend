import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config';
// Payment-based verification temporarily disabled. To re-enable, restore VerificationPayment import and related code.

const ENABLE_VERIFICATION_PAYMENT = false; // Set to true to re-enable in future

const UserProfile = ({ user, currentUser }) => {
    const [isBlocked, setIsBlocked] = useState(false);
    // const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Fetch blocked users on mount and when user/currentUser changes
    useEffect(() => {
        const fetchBlockedUsers = async () => {
            try {
                if (!user || !currentUser || user._id === currentUser._id) return;
                // You may need to pass token if required by backend
                const res = await axios.get(`${config.backendUrl}/api/users/blocked`);
                setIsBlocked(res.data.some(u => u._id === user._id));
            } catch (err) {
                // Optionally handle error
            }
        };
        fetchBlockedUsers();
    }, [user, currentUser]);

    const handleBlock = async () => {
        try {
            await axios.post(`${config.backendUrl}/api/users/block/${user._id}`);
            // Refresh blocked users list after blocking
            const res = await axios.get(`${config.backendUrl}/api/users/blocked`);
            setIsBlocked(res.data.some(u => u._id === user._id));
            toast.success('User blocked successfully');
        } catch (error) {
            toast.error('Failed to block user');
        }
    };

    const handleUnblock = async () => {
        try {
            await axios.post(`${config.backendUrl}/api/users/unblock/${user._id}`);
            // Refresh blocked users list after unblocking
            const res = await axios.get(`${config.backendUrl}/api/users/blocked`);
            setIsBlocked(res.data.some(u => u._id === user._id));
            toast.success('User unblocked successfully');
        } catch (error) {
            toast.error('Failed to unblock user');
        }
    };

    // Don't show block button for own profile
    if (!user || !currentUser) return null;
    if (String(user._id) === String(currentUser._id)) return null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                {/* Username removed as per user request */}
                <div className="mt-4 flex">
                    <button
                        onClick={isBlocked ? handleUnblock : handleBlock}
                        className={`px-4 py-2 rounded ${
                            isBlocked 
                                ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                                : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                    >
                        {isBlocked ? 'Unblock User' : 'Block User'}
                    </button>
                </div>
            </div>
            {/* ... rest of the profile component ... */}
        </div>
    );
};

export default UserProfile; 