import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CssBaseline, Box, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Groups from './pages/Groups';
import AdminLogin from './pages/AdminLogin';
import Events from './pages/Events';
import HelpCenter from './components/HelpCenter';
import AdminReports from './pages/AdminReports';
import Messages from './pages/Messages';
import Saved from './pages/Saved';
import PostDetail from './components/PostDetail';
import PageLayout from './components/PageLayout';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationProvider } from './context/NotificationContext';
import SearchPage from './pages/SearchPage';
import Modal from '@mui/material/Modal';
import FocusedPostModal from './components/FocusedPostModal';

// Configure router with future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function AppRoutes() {
  const location = useLocation();
  // This is the location that was current when the link was clicked
  const state = location.state;
  const background = state && state.background;

  return (
    <Routes location={background || location}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Landing />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Navbar />
            <Box component="main">
              <Routes location={background || location}>
                <Route path="home" element={<Home />} />
                <Route path="profile/:id" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="groups" element={<Groups />} />
                <Route path="events" element={<Events />} />
                <Route path="saved" element={<Saved />} />
                <Route path="post/:id" element={<PostDetail />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route 
                  path="admin-login" 
                  element={
                    <AdminRoute>
                      <AdminLogin />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="help-center" 
                  element={
                    <PageLayout title="Help Center">
                      <HelpCenter />
                    </PageLayout>
                  }
                />
                <Route 
                  path="admin-reports" 
                  element={
                    <AdminRoute>
                      <PageLayout title="Admin Reports">
                        <AdminReports />
                      </PageLayout>
                    </AdminRoute>
                  }
                />
                <Route path="/messages/:userId" element={<Messages />} />
                <Route path="/search" element={<SearchPage />} />
              </Routes>
              {/* Show the modal when background exists */}
              {background && (
                <Routes>
                  <Route
                    path="/post/:id"
                    element={
                      <FocusedPostModal
                        // Pass all needed props from Home (like, comment, save, etc.)
                        // You may need to lift these handlers to App or use context if not already available
                      />
                    }
                  />
                </Routes>
              )}
            </Box>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <CssBaseline />
          <Router {...routerConfig}>
            <AppRoutes />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
