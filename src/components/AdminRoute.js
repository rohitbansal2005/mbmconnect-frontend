import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    // If not admin, redirect to home
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute; 