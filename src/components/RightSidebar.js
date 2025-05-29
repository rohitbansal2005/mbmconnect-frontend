import React, { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Badge } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getBestProfileImage, fallbackImage } from '../utils/imageUtils';
import config from '../config';

const RightSidebar = ({ users, onlineUsers }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userSettings, setUserSettings] = useState(null);

  console.log('RightSidebar users:', users);
  console.log('RightSidebar onlineUsers:', onlineUsers);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/api/settings`, {
          headers: { 'Authorization': `Bearer ${token}`