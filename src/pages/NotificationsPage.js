import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { useNotifications } from '../context/NotificationContext';
import NotificationList from '../components/NotificationList'; // We can reuse the list component
import PageLayout from '../components/PageLayout';

const NotificationsPage = () => {
  const { notifications, unreadCount } = useNotifications();

  return (
    <PageLayout title="Notifications">
      {/* Removed Container and Box as they are now handled within NotificationList when isPage is true */}
      
      {/* Pass the isPage prop to render as a full list */}
      <NotificationList isPage={true} />
      
      {/* The empty state message should ideally be handled within NotificationList now */}
      {/* Keeping it here for now, but might remove it later if NotificationList handles it */}
      {/* Checking NotificationList.js again... it handles the empty list state. Great! */}
      {/* So we can remove the empty state message from here. */}

    </PageLayout>
  );
};

export default NotificationsPage; 