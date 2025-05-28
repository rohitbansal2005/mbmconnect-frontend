import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import config from '../config';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${config.backendUrl}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (err) {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();

    const socket = io(config.socketUrl, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') }
    });

    socket.on('receiveNotification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, setNotifications, setUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}; 