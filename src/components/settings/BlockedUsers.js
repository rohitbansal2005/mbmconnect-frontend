import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BlockedUsers = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const response = await axios.get('/api/users/blocked');
            setBlockedUsers(response.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch blocked users');
            setLoading(false);
        }
    };

    const unblockUser = async (userId) => {
        try {
            await axios.post(`/api/users/unblock/${userId}`);
            toast.success('User unblocked successfully');
            // Remove user from blocked list
            setBlockedUsers(blockedUsers.filter(user => user._id !== userId));
        } catch (error) {
            toast.error('Failed to unblock user');
        }
    };

    if (loading) {
        return <div className="text-center p-4">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Blocked Users</h2>
            
            {blockedUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No blocked users</p>
            ) : (
                <div className="space-y-4">
                    {blockedUsers.map(user => (
                        <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                                <img 
                                    src={user.profilePicture || '/default-avatar.png'} 
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-semibold">{user.username}</h3>
                                    <p className="text-sm text-gray-500">Blocked on {user.blockedAt ? new Date(user.blockedAt).toLocaleDateString() : ''}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => unblockUser(user._id)}
                                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            >
                                Unblock
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BlockedUsers; 