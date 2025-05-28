import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  CircularProgress,
  Stack,
  TextField
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import PageLayout from '../components/PageLayout';
import { Link as RouterLink } from 'react-router-dom';

const Settings = () => {
  const { user, logout, token } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [openBlockDialog, setOpenBlockDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showGoodbye, setShowGoodbye] = useState(false);

  // Add official reasons
  const officialDeleteReasons = [
    'Privacy concerns',
    'Too many notifications',
    'Created a duplicate account',
    'Not useful',
    'Switching to another platform',
    'Other'
  ];
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchBlockedUsers();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Fetched settings from backend:', response.data);
      setSettings(response.data);
      if (response.data.theme !== (isDarkMode ? 'dark' : 'light')) {
        toggleTheme(response.data.theme === 'dark');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/users/blocked',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Fetched blocked users:', response.data);
      setBlockedUsers(response.data);
    } catch (error) {
      console.error('Error fetching blocked users:', error.response?.data || error.message);
      showSnackbar('Failed to load blocked users', 'error');
    }
  };

  const handleSettingChange = async (setting) => {
    if (updating || !settings) return;
    
    try {
      setUpdating(true);
      const newSettings = { ...settings, [setting]: !settings[setting] };
      console.log(`Attempting to update setting: ${setting}`, newSettings);
      
      // Optimistically update UI
      setSettings(newSettings);
      
      await axios.put('http://localhost:5000/api/settings', newSettings, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSnackbar('Settings updated successfully');
    } catch (error) {
      console.error('Error updating setting:', error);
      // Revert on error
      setSettings(prevSettings => ({ ...prevSettings, [setting]: !prevSettings[setting] }));
      showSnackbar('Failed to update setting', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleThemeChange = async () => {
    if (updating || !settings) return;
    
    try {
      setUpdating(true);
      const newTheme = !isDarkMode ? 'dark' : 'light';
      console.log('Attempting to update theme to:', newTheme);
      
      // Optimistically update UI
      toggleTheme();
      
      await axios.put('http://localhost:5000/api/settings', { theme: newTheme }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      showSnackbar('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      // Revert on error
      toggleTheme();
      showSnackbar('Failed to update theme', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await axios.post(`http://localhost:5000/api/users/unblock/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update the blocked users list by filtering out the unblocked user
      setBlockedUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      showSnackbar('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error.response?.data || error.message);
      showSnackbar('Failed to unblock user', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    if (!reason.trim() || !deletePassword) {
      showSnackbar('Please provide a reason and your password', 'error');
      return;
    }
    try {
      setLoading(true);
      await axios.delete('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason, password: deletePassword }
      });
      logout();
      setShowGoodbye(true);
      showSnackbar('Account deleted successfully');
      setTimeout(() => {
        window.location.href = '/';
      }, 3500);
    } catch (error) {
      console.error('Error deleting account:', error);
      showSnackbar(error.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
    setOpenDeleteDialog(false);
    setSelectedReason('');
    setCustomReason('');
    setDeletePassword('');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  if (showGoodbye) {
    return (
      <PageLayout title="Goodbye">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Your account has been deleted
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We're sorry to see you go. If you change your mind, you're always welcome to create a new account.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will be redirected to the homepage shortly...
          </Typography>
        </Box>
      </PageLayout>
    );
  }

  if (loading || !settings) {
    return (
      <PageLayout title="Settings">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Settings">
      <Box sx={{ maxWidth: 600, mx: 'auto', px: 3, pb: 3 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Settings
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Online Status
              </Typography>
              <Box sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showOnlineStatus}
                      onChange={() => handleSettingChange('showOnlineStatus')}
                      disabled={updating}
                    />
                  }
                  label="Show online status"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  When enabled, other users can see when you're online
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showLastSeen}
                      onChange={() => handleSettingChange('showLastSeen')}
                      disabled={updating}
                    />
                  }
                  label="Show last seen"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                  When enabled, other users can see when you were last active
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <Box sx={{ pl: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isDarkMode}
                      onChange={handleThemeChange}
                      disabled={updating}
                    />
                  }
                  label="Dark mode"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Toggle between light and dark theme
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Blocked Users
          </Typography>
          {blockedUsers && blockedUsers.length > 0 ? (
            <List>
              {blockedUsers.map((blockedUser) => (
                <ListItem
                  key={blockedUser._id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleUnblockUser(blockedUser._id)}>
                      <PersonOffIcon />
                    </IconButton>
                  }
                  alignItems="flex-start"
                >
                  <ListItemAvatar>
                    <Avatar
                      src={blockedUser.profilePicture || blockedUser.avatar}
                      alt={blockedUser.username}
                      component={RouterLink}
                      to={`/profile/${blockedUser._id}`}
                      sx={{ cursor: 'pointer' }}
                    >
                      {blockedUser.username?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <RouterLink
                        to={`/profile/${blockedUser._id}`}
                        style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                      >
                        {blockedUser.username}
                      </RouterLink>
                    }
                    secondary={
                      blockedUser.blockedAt
                        ? `Blocked on ${new Date(blockedUser.blockedAt).toLocaleDateString()}`
                        : ''
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No blocked users
            </Typography>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 3, mb: 3, bgcolor: 'error.light' }}>
          <Typography variant="h6" gutterBottom color="error">
            Danger Zone
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDeleteDialog(true)}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Once you delete your account, there is no going back. Please be certain.
          </Typography>
        </Paper>

        <Dialog
          open={openDeleteDialog}
          onClose={() => !loading && setOpenDeleteDialog(false)}
        >
          <DialogTitle>Delete Account</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Please tell us why you are deleting your account:
            </Typography>
            <TextField
              select
              label="Reason for deleting"
              fullWidth
              margin="dense"
              value={selectedReason}
              onChange={e => setSelectedReason(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="">Select a reason</option>
              {officialDeleteReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </TextField>
            {selectedReason === 'Other' && (
              <TextField
                margin="dense"
                label="Custom reason"
                fullWidth
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
              />
            )}
            <TextField
              margin="dense"
              label="Enter your password"
              type="password"
              fullWidth
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              autoComplete="new-password"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteAccount}
              color="error"
              variant="contained"
              disabled={(!selectedReason || (selectedReason === 'Other' && !customReason.trim()) || !deletePassword || loading)}
            >
              Delete Account
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  );
};

export default Settings; 