import React, { useState, useEffect, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  Box,
  Menu,
  MenuItem,
  useTheme as useMuiTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  ListItemButton,
  Divider,
  Alert,
  ClickAwayListener,
  ListItemAvatar
} from '@mui/material';
import Popper from '@mui/material/Popper';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  Update as UpdateIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Bookmark as BookmarkIcon,
  Help as HelpIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import axios from 'axios';
import NavbarUserSearch from './NavbarUserSearch';
import NotificationList from './NotificationList';
import { getProfileImageUrl, getBestProfileImage, fallbackImage } from '../utils/imageUtils';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { useNotifications } from '../context/NotificationContext';
import config from '../config';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return `${config.backendUrl}/${avatar.replaceAll('\\', '/')}`;
};

const Navbar = () => {
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token, socket, onlineUsers, markMessagesAsRead, messages, unreadMessagesCount } = useAuth();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState('menu');
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [messageAnchorEl, setMessageAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications: contextNotifications, unreadCount: contextUnreadCount } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);

  const [acceptingRequestId, setAcceptingRequestId] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setLogoutDialogOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleMessageOpen = (event) => setMessageAnchorEl(event.currentTarget);
  const handleMessageClose = () => setMessageAnchorEl(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        if (!token) {
          console.log('No auth token found, skipping user fetch in Navbar');
          setLoading(false);
          return;
        }
        const response = await axios.get(`${config.backendUrl}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users in Navbar:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, onlineUsers]);

  const mainMenuItems = [
    { icon: <HomeIcon />, text: 'Home', path: '/home' },
    { icon: <UpdateIcon />, text: 'Updates', path: '/events' },
    { icon: <GroupIcon />, text: 'Groups', path: '/groups' },
    { icon: <BookmarkIcon />, text: 'Saved Posts', path: '/saved' },
  ];

  const bottomMenuItems = [
    { icon: <HelpIcon />, text: 'Help Center', path: '/help-center' },
    { icon: <SettingsIcon />, text: 'Settings', path: '/settings' },
  ];

  const drawerWidth = 250;

  const drawer = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <Tabs value={drawerContent} onChange={(e, newValue) => setDrawerContent(newValue)} variant="fullWidth">
        <Tab label="Menu" value="menu" />
        <Tab label="Users" value="users" />
      </Tabs>
      <Box sx={{ mt: 1 }}>
        {drawerContent === 'menu' && (
          <List>
            {mainMenuItems.map((item) => (
              <ListItemButton key={item.text} onClick={() => { handleNavigation(item.path); if (isMobile) handleDrawerToggle(); }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}

            <Divider sx={{ my: 1 }} />

            {user && (
              <ListItemButton onClick={() => { handleNavigation(`/profile/${user._id}`); if (isMobile) handleDrawerToggle(); }}>
                <ListItemIcon>
                  <Avatar 
                    src={getProfileImageUrl(user?.profilePicture || user?.avatar) || fallbackImage}
                    alt={user?.username}
                    sx={{ width: 24, height: 24 }}
                    onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                  >
                    {(user?.username || user?.name || 'U')[0]?.toUpperCase()}
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={user?.username} secondary="View Profile" />
              </ListItemButton>
            )}

            <Divider sx={{ my: 1 }} />

            {bottomMenuItems.map((item) => (
              <ListItemButton key={item.text} onClick={() => { handleNavigation(item.path); if (isMobile) handleDrawerToggle(); }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}

            {user?.role === 'admin' && (
              <ListItemButton onClick={() => { handleNavigation('/admin-reports'); if (isMobile) handleDrawerToggle(); }}>
                <ListItemIcon>
                  <Badge color="error" variant="dot">
                    <HelpIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="User Reports" />
              </ListItemButton>
            )}
          </List>
        )}
        {drawerContent === 'users' && (
           <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Online Users</Typography>
              {console.log('Navbar Drawer - onlineUsers:', onlineUsers, 'users:', users)}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress size={20} /></Box>
              ) : users.length > 0 ? (
                <RightSidebar users={users} onlineUsers={onlineUsers} />
              ) : (
                <Alert severity="info">No users available or failed to load users.</Alert>
              )}
           </Box>
        )}
      </Box>
    </Box>
  );

  const handleClickAwaySearchResults = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleMessageClick = () => {
    markMessagesAsRead();
    navigate('/messages');
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  // Accept follow request handler
  const handleAcceptFollowRequest = async (notifId) => {
    try {
      setAcceptingRequestId(notifId);
      await axios.post(
        `http://localhost:5000/api/follows/accept/${notifId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Optionally: refresh notifications or show a message
      setAcceptingRequestId(null);
      // You may want to refetch notifications here
    } catch (err) {
      setAcceptingRequestId(null);
      // Optionally: show error
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" color="default" elevation={1}>
        <Toolbar sx={{ minHeight: 56, px: { xs: 2, sm: 2 } }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            component="img"
            src="/mbmlogo.png"
            alt="MBMConnect"
            sx={{
              height: 40,
              cursor: 'pointer',
              display: { xs: 'none', md: 'block' },
              mr: 1,
            }}
            onClick={() => navigate('/home')}
          />

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start', alignItems: 'center' }}>
            {isMobile ? (
              <Box sx={{ width: '100%', maxWidth: 200 }}>
                <NavbarUserSearch 
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  results={searchResults}
                  setResults={setSearchResults}
                  loading={searchLoading}
                  setLoading={setSearchLoading}
                  showResults={showSearchResults}
                  setShowResults={setShowSearchResults}
                  searchInputRef={searchInputRef}
                />
              </Box>
            ) : (
              <Box>
                <NavbarUserSearch 
                  query={searchQuery}
                  setQuery={setSearchQuery}
                  results={searchResults}
                  setResults={setSearchResults}
                  loading={searchLoading}
                  setLoading={setSearchLoading}
                  showResults={showSearchResults}
                  setShowResults={setShowSearchResults}
                  searchInputRef={searchInputRef}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={() => handleNavigation('/messages')} sx={{ display: { xs: 'inline-flex', md: 'inline-flex' } }}>
              <Badge badgeContent={unreadMessagesCount} color="error">
                <MessageIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit" onClick={handleNotifOpen} sx={{ display: { xs: 'inline-flex', md: 'inline-flex' } }}>
              <Badge badgeContent={contextUnreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ alignSelf: 'center' }}
            >
              <Avatar
                src={getBestProfileImage(user)}
                alt={user?.username || user?.fullName}
                sx={{ width: 32, height: 32 }}
              >
                {(!user?.avatar && !user?.profilePicture && (user?.username || user?.fullName)) ? (user.username ? user.username[0].toUpperCase() : user.fullName[0].toUpperCase()) : null}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleNavigation(`/profile/${user?._id}`)}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/settings')}>
              Settings
            </MenuItem>
            {user?.role === 'admin' && (
              <MenuItem onClick={() => handleNavigation('/admin-login')}>
                Admin Panel
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
          >
            {contextNotifications.length === 0 ? (
              <MenuItem onClick={handleNotifClose}>No notifications</MenuItem>
            ) : (
              contextNotifications.slice(0, 5).map((notif) => (
                <MenuItem key={notif._id} selected={!notif.read} onClick={() => {
                  handleNotifClose();
                }}>
                  <ListItemAvatar>
                    <Avatar
                      src={notif.sender ? getBestProfileImage(notif.sender) : fallbackImage}
                      alt={notif.sender?.username || 'User'}
                      onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    >
                      {notif.sender?.username
                        ? notif.sender.username[0].toUpperCase()
                        : 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notif.content || 'New notification'}
                    secondary={notif.sender?.username || 'Unknown User'}
                  />
                  {/* Accept button for follow request */}
                  {notif.type === 'follow_request' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      disabled={acceptingRequestId === notif._id}
                      onClick={e => {
                        e.stopPropagation();
                        handleAcceptFollowRequest(notif._id);
                      }}
                      sx={{ ml: 1 }}
                    >
                      {acceptingRequestId === notif._id ? 'Accepting...' : 'Accept'}
                    </Button>
                  )}
                </MenuItem>
              ))
            )}
            {contextNotifications.length > 5 && (
              <MenuItem onClick={() => { navigate('/notifications'); handleNotifClose(); }}>
                View All Notifications
              </MenuItem>
            )}
          </Menu>
          <Menu
            anchorEl={messageAnchorEl}
            open={Boolean(messageAnchorEl)}
            onClose={handleMessageClose}
          >
            {messages.length === 0 ? (
              <MenuItem>No messages</MenuItem>
            ) : (
              messages.map((msg, idx) => (
                <MenuItem key={idx} selected={!msg.read}>
                  {msg.text}
                </MenuItem>
              ))
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </nav>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography id="logout-dialog-description">
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Navbar;