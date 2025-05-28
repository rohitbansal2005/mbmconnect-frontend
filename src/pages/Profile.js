import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Toolbar,
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Link,
} from '@mui/material';
import {
  School,
  Work,
  LocationOn,
  Email,
  Phone,
  Edit,
  Save,
  Cancel,
  LinkedIn,
  GitHub,
  Language,
  Add,
  Menu,
  Search,
  InputBase,
  Badge,
  Notifications,
  LightMode,
  DarkMode,
  PhotoCamera,
  Delete,
  Instagram,
  ArrowBack,
  Close,
  Lock as LockIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material/styles';
import FollowButton from '../components/FollowButton';
import FollowersList from '../components/FollowersList';
import Feed from '../components/Feed';
import CreatePost from '../components/CreatePost';
import { getProfileImageUrl, fallbackImage } from '../utils/imageUtils';
import PageLayout from '../components/PageLayout';
import UserProfile from '../components/UserProfile';
import config from '../config';

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [openEducationDialog, setOpenEducationDialog] = useState(false);
  const [openExperienceDialog, setOpenExperienceDialog] = useState(false);
  const [educationInput, setEducationInput] = useState({ degree: '', institution: '', year: '' });
  const [experienceInput, setExperienceInput] = useState({ position: '', company: '', duration: '' });
  const { id } = useParams();
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [savedPosts, setSavedPosts] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    branch: '',
    session: '',
    semester: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    skills: [],
    education: [],
    experience: [],
    socialLinks: [],
  });

  const privacyOptions = [
    { value: 'public', label: 'Public' },
    { value: 'friends', label: 'Friends Only' },
    { value: 'private', label: 'Private' },
  ];

  const [privacy, setPrivacy] = useState({
    photo: 'public',
    email: 'public',
    phone: 'private',
    address: 'private',
    bio: 'public',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching profile for ID:', id);
      console.log('User data:', user);
      console.log('Using token:', token ? 'Token exists' : 'No token');

      if (!id && !user) {
        throw new Error('No profile ID available and no user data');
      }

      if (!token) {
        throw new Error('No authentication token available');
      }

      const profileId = id || user._id;
      
      if (!profileId) {
        throw new Error('No valid profile ID available');
      }

      console.log('Making request to:', `${config.backendUrl}/api/students/${profileId}`);
      
      try {
        const response = await axios.get(`${config.backendUrl}/api/students/${profileId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.data) {
          throw new Error('No profile data received');
        }

        console.log('Profile data received:', response.data);
        
        // Check if current user is a follower
        if (response.data.followers) {
          const isCurrentUserFollower = response.data.followers.some(
            follower => String(follower._id) === String(user._id)
          );
          setIsFollower(isCurrentUserFollower);
        }
        
        // Ensure avatar URL is complete
        const profileData = {
          ...response.data,
          avatar: response.data.avatar ? 
            (response.data.avatar.startsWith('http') ? 
              response.data.avatar : 
              `${config.backendUrl}/${response.data.avatar}`) 
            : '',
          education: response.data.education || [],
          experience: response.data.experience || [],
          skills: response.data.skills || [],
          socialLinks: response.data.socialLinks || [],
          privacy: response.data.privacy || {
            profile: 'public',
            photo: 'public',
            email: 'public',
            phone: 'private',
            address: 'private',
            bio: 'public'
          }
        };
        
        console.log('Setting profile data:', {
          id: profileData._id,
          name: profileData.fullName
        });
        
        setProfile(profileData);
        setFormData(profileData);
      } catch (error) {
        if (error.response?.status === 404) {
          // Profile doesn't exist, create it
          console.log('Profile not found, creating new profile');
          const createResponse = await axios.post('http://localhost:5000/api/students', {
            user: profileId,
            fullName: user.username,
            rollNumber: `MBM${Date.now()}`,
            branch: 'Not specified',
            session: 'Not specified',
            semester: 'Not specified',
            email: user.email
          }, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (createResponse.data) {
            setProfile(createResponse.data);
            setFormData(createResponse.data);
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      console.error('Error details:', error.response?.data || error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user && !id) {
          setError('No user or profile ID found.');
          setLoading(false);
          return;
        }
        await fetchProfile();
      } catch (error) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };
    loadProfile();
  }, [id, user]);

  useEffect(() => {
    if (profile && profile.privacy) {
      setPrivacy(profile.privacy);
    }
  }, [profile]);

  useEffect(() => {
    console.log('Debug Profile Data:', {
      user: {
        id: user?._id,
        userId: user?.userId,
        allUserData: user
      },
      profile: {
        id: profile?._id,
        userId: profile?.user?._id,
        allProfileData: profile
      },
      isOwner: user?._id === profile?.user?._id
    });
  }, [user, profile]);

  const handleEdit = () => {
    if (!user || !profile) return;
    
    // Set form data to current profile data
    setFormData({
      fullName: profile.fullName || '',
      rollNumber: profile.rollNumber || '',
      branch: profile.branch || '',
      session: profile.session || '',
      semester: profile.semester || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      bio: profile.bio || '',
      skills: profile.skills || [],
      education: profile.education || [],
      experience: profile.experience || [],
      socialLinks: profile.socialLinks || [],
    });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      fullName: profile.fullName || '',
      rollNumber: profile.rollNumber || '',
      branch: profile.branch || '',
      session: profile.session || '',
      semester: profile.semester || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      bio: profile.bio || '',
      skills: profile.skills || [],
      education: profile.education || [],
      experience: profile.experience || [],
      socialLinks: profile.socialLinks || [],
    });
  };

  const handleSave = async () => {
    if (!user || !token || !profile) {
        setSnackbar({
            open: true,
            message: 'Please log in to update your profile',
            severity: 'error'
        });
        return;
    }

    try {
        setLoading(true);
        console.log('Saving profile updates:', {
            formData,
            userId: user._id,
            profileUserId: profile.user._id,
            isMatch: String(user._id) === String(profile.user._id)
        });
        
        // Only send the fields that have changed
        const updateData = {
            ...formData,
            user: user._id // Ensure we're sending the correct user ID
        };

        const response = await axios.put(
            `http://localhost:5000/api/students/${profile._id}`,
            updateData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Profile update response:', response.data);
        
        setProfile(response.data);
        setEditMode(false);
        // Update global user context and localStorage
        setUser(prev => {
            const updatedUser = { ...prev, ...response.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        });
        setSnackbar({
            open: true,
            message: 'Profile updated successfully',
            severity: 'success'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Failed to update profile',
            severity: 'error'
        });
    } finally {
        setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input changed:', { name, value });
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    console.log('Social link changed:', { platform, value });
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      console.log('Adding skill:', newSkill);
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      setOpenDialog(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    console.log('Removing skill:', skillToRemove);
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/'); // ya '/landing'
  };

  const handleDrawerToggle = () => {
    // Implementation of handleDrawerToggle
  };

  const handleProfileMenuOpen = () => {
    // Implementation of handleProfileMenuOpen
  };

  const handleNavigation = (path) => {
    // Implementation of handleNavigation
  };

  const toggleTheme = () => {
    // Implementation of toggleTheme
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!user || !token) {
        setSnackbar({
            open: true,
            message: 'Please log in to update your profile photo',
            severity: 'error'
        });
        return;
    }

    // Check if user is trying to update their own profile
    if (!profile?.user?._id || String(user._id) !== String(profile.user._id)) {
        setSnackbar({
            open: true,
            message: 'You can only update your own profile photo',
            severity: 'error'
        });
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        setSnackbar({
            open: true,
            message: 'Please select an image file',
            severity: 'error'
        });
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
            open: true,
            message: 'File size should be less than 5MB',
            severity: 'error'
        });
        return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
        console.log('Uploading photo for profile:', profile._id);
        const response = await axios.post(
            `http://localhost:5000/api/students/${profile._id}/photo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('Photo upload response:', response.data);

        // Update profile with new avatar URL
        const updatedProfile = {
            ...profile,
            avatar: response.data.avatar,
            profilePicture: response.data.avatar
        };
        setProfile(updatedProfile);
        setFormData(updatedProfile);
        
        setUser(prev => {
          const updatedUser = { 
            ...prev, 
            avatar: response.data.avatar, 
            profilePicture: response.data.avatar 
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
        
        setSnackbar({
            open: true,
            message: 'Profile photo updated successfully',
            severity: 'success'
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Failed to upload photo',
            severity: 'error'
        });
    } finally {
        setUploadingPhoto(false);
    }
  };

  // Update the getAvatarUrl function to handle paths correctly
  const getAvatarUrl = () => {
    if (!profile?.avatar) return '';
    
    // If it's already a full URL, return it
    if (profile.avatar.startsWith('http')) {
        return profile.avatar;
    }
    
    // If it's a relative path, construct the full URL
    // Remove any leading slashes to avoid double slashes
    const cleanPath = profile.avatar.replace(/^\/+/, '');
    return `http://localhost:5000/${cleanPath}`;
  };

  const handlePrivacyChange = (field, value) => {
    console.log('Privacy change:', { field, value, currentPrivacy: privacy });
    setPrivacy(prev => {
        const newPrivacy = { ...prev, [field]: value };
        console.log('New privacy settings:', newPrivacy);
        return newPrivacy;
    });
  };

  const handleSavePrivacy = async () => {
    if (!user || !token) {
        setSnackbar({
            open: true,
            message: 'Please log in to update privacy settings',
            severity: 'error'
        });
        return;
    }

    // Check if user is trying to update their own profile
    if (!profile?.user?._id || String(user._id) !== String(profile.user._id)) {
        setSnackbar({
            open: true,
            message: 'You can only update your own privacy settings',
            severity: 'error'
        });
        return;
    }

    try {
        setLoading(true);
        console.log('Updating privacy settings:', privacy);

        const response = await axios.put(
            `http://localhost:5000/api/students/${profile._id}`,
            { privacy },
            {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Update the profile with new privacy settings
        const updatedProfile = {
            ...profile,
            privacy: response.data.privacy
        };
        setProfile(updatedProfile);
        
        setUser(prev => {
          const updatedUser = { ...prev, ...response.data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
        
        setSnackbar({ 
            open: true, 
            message: 'Privacy settings updated successfully', 
            severity: 'success' 
        });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        setSnackbar({ 
            open: true, 
            message: error.response?.data?.message || 'Failed to update privacy settings',
            severity: 'error' 
        });
    } finally {
        setLoading(false);
    }
  };

  const getFieldValue = (field) => {
    if (!profile) return '';

    // For sensitive fields, hide value if private
    if (["email", "phone", "address"].includes(field)) {
      if (profile.privacy?.profile === 'private') return 'Private';
      if (profile.privacy?.[field] === 'private') return 'Private';
      if (profile.privacy?.[field] === 'friends' && !isFollower) return 'Private';
      if (!profile[field]) return 'Not specified';
      return profile[field];
    }

    // For non-sensitive fields, always show value, but indicate privacy with lock icon
    if (!profile[field]) return 'Not specified';
    return profile[field];
  };

  const isFieldPrivate = (field) => {
    if (!profile) return false;
    if (["email", "phone", "address"].includes(field)) return false;
    // Only for non-sensitive fields
    if (profile.privacy?.profile === 'private') return true;
    if (profile.privacy?.[field] === 'private') return true;
    if (profile.privacy?.[field] === 'friends' && !isFollower) return true;
    return false;
  };

  const getSocialLinkValue = (platform) => {
    if (!profile?.socialLinks) return '';
    
    // Check if the profile is private
    if (profile.privacy?.profile === 'private') {
        return 'Private';
    }
    
    // Check if social links are private
    if (profile.privacy?.socialLinks === 'private') {
        return 'Private';
    }
    
    // Check if social links are friends-only and user is not a follower
    if (profile.privacy?.socialLinks === 'friends' && !isFollower) {
        return 'Private';
    }
    
    if (profile.socialLinks[platform] === 'Private') {
        return 'Private';
    }
    if (!profile.socialLinks[platform]) {
        return 'Not specified';
    }
    return profile.socialLinks[platform];
  };

  const getSocialLinkUrl = (platform) => {
    const value = getSocialLinkValue(platform);
    if (value === 'Private' || value === 'Not specified') return null;
    if (/^https?:\/\//i.test(value)) return value;
    return 'https://' + value;
  };

  const handleAddEducation = async () => {
    try {
      const updatedEducation = [...formData.education, educationInput];
      await axios.put(
        `http://localhost:5000/api/students/${profile._id}`,
        { education: updatedEducation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData(prev => ({
        ...prev,
        education: updatedEducation
      }));
      setEducationInput({ degree: '', institution: '', year: '' });
      setOpenEducationDialog(false);
      setSnackbar({ open: true, message: 'Education added!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add education', severity: 'error' });
    }
  };

  const handleRemoveEducation = async (index) => {
    console.log('Removing education at index:', index);
    const updatedEducation = formData.education.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const handleAddExperience = async () => {
    try {
      const updatedExperience = [...formData.experience, experienceInput];
      await axios.put(
        `http://localhost:5000/api/students/${profile._id}`,
        { experience: updatedExperience },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData(prev => ({
        ...prev,
        experience: updatedExperience
      }));
      setExperienceInput({ position: '', company: '', duration: '' });
      setOpenExperienceDialog(false);
      setSnackbar({ open: true, message: 'Experience added!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to add experience', severity: 'error' });
    }
  };

  const handleRemoveExperience = async (index) => {
    try {
      const updatedExperience = formData.experience.filter((_, i) => i !== index);
      await axios.put(
        `http://localhost:5000/api/students/${profile._id}`,
        { experience: updatedExperience },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData(prev => ({
        ...prev,
        experience: updatedExperience
      }));
      setSnackbar({ open: true, message: 'Experience removed!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to remove experience', severity: 'error' });
    }
  };

  // Add useEffect to fetch follow data when profile changes
  useEffect(() => {
    if (profile?.user?._id) {
      fetchFollowData();
    }
  }, [profile?.user?._id]);

  // Update shouldShowContent to handle different sections
  const shouldShowSection = (section) => {
    if (!profile) return false;
    
    // If user is viewing their own profile, always show content
    if (user && String(user._id) === String(profile.user._id)) {
        return true;
    }
    
    // Basic info (header) is always visible
    if (section === 'header') {
        return true;
    }
    
    // Check profile-level privacy for other sections
    if (profile.privacy?.profile === 'private') {
        return false;
    }
    
    // Check if profile is friends-only and user is not a follower
    if (profile.privacy?.profile === 'friends' && !isFollower) {
        return false;
    }
    
    return true;
  };

  // Fetch user posts
  const fetchUserPosts = async () => {
    let userId = profile?.user?._id || profile?._id || user?._id;
    if (!userId) {
      console.warn('No valid user ID found for fetching posts!', { profile, user });
      setSnackbar({
        open: true,
        message: 'User ID missing, cannot load posts',
        severity: 'error'
      });
      return;
    }
    try {
      console.log('Fetching posts for user:', userId);
      const response = await axios.get(`http://localhost:5000/api/posts/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Fetched posts:', response.data);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load posts',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (profile?.user?._id) {
      fetchUserPosts();
    }
  }, [profile?.user?._id]);

  const handleCreatePost = async (formData) => {
    try {
      console.log('Creating post with:', formData);

      const response = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Post created:', response.data);
      
      // Update the posts state with the new post
      setPosts(prevPosts => [response.data, ...prevPosts]);
      
      setSnackbar({ 
        open: true, 
        message: 'Post created successfully', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error creating post:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to create post', 
        severity: 'error' 
      });
    }
  };

  const handlePermanentDelete = async () => {
    if (!user || !token) {
      setSnackbar({
        open: true,
        message: 'Please log in to delete your account',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Delete the user account first
      const userResponse = await axios.delete(`${config.backendUrl}/api/users/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.status === 200) {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear user context
        setUser(null);
        
        // Show success message
        setSnackbar({
          open: true,
          message: 'Account deleted successfully',
          severity: 'success'
        });

        // Redirect to landing page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      let errorMessage = 'Failed to delete account. Please try again.';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Account not found. Please try logging in again.';
        } else if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Disable WebSocket connection attempts for this page
    if (window.io) {
      window.io.engine.on('error', (error) => {
        console.log('WebSocket connection error:', error);
        // Don't show this error to users as it's not critical
      });
    }
  }, []);

  // Functions to manage social links array
  const handleAddSocialLink = () => {
    setFormData(prevFormData => ({
      ...prevFormData,
      socialLinks: { ...prevFormData.socialLinks, [Object.keys(prevFormData.socialLinks).length]: '' },
    }));
  };

  const handleUpdateSocialLink = (platform, value) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      socialLinks: {
        ...prevFormData.socialLinks,
        [platform]: value
      }
    }));
  };

  const handleRemoveSocialLink = (index) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      socialLinks: {
        ...prevFormData.socialLinks,
        [index]: undefined
      }
    }));
  };

  const handleLikePost = async (updatedPost) => {
    try {
      // Update the posts state with the liked/unliked post
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    } catch (error) {
      console.error('Error handling post like:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update like status',
        severity: 'error'
      });
    }
  };

  const handleComment = async (updatedPost) => {
    try {
      // Update the posts state with the new comment
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === updatedPost._id ? updatedPost : post
        )
      );
    } catch (error) {
      console.error('Error handling comment:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update comment',
        severity: 'error'
      });
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the deleted post from the state
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      
      setSnackbar({
        open: true,
        message: 'Post deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete post',
        severity: 'error'
      });
    }
  };

  const handleEditPost = async (post) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editContent.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/posts/${editingPost._id}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update the posts state with the edited post
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === editingPost._id ? response.data : post
        )
      );
      
      setEditingPost(null);
      setEditContent('');
      
      setSnackbar({
        open: true,
        message: 'Post updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating post:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update post',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user || !token) return;
      try {
        const response = await axios.get('http://localhost:5000/api/posts/saved', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedPosts(response.data.map(post => post._id));
      } catch (error) {
        console.error('Error fetching saved posts:', error);
      }
    };

    fetchSavedPosts();
  }, [user, token]);

  const handleSavePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (savedPosts.includes(postId)) {
        // Unsave post
        await axios.post(`http://localhost:5000/api/posts/${postId}/unsave`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedPosts(prev => prev.filter(id => id !== postId));
        setSnackbar({
          open: true,
          message: 'Post unsaved',
          severity: 'info'
        });
      } else {
        // Save post
        await axios.post(`http://localhost:5000/api/posts/${postId}/save`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedPosts(prev => [...prev, postId]);
        setSnackbar({
          open: true,
          message: 'Post saved',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save/unsave post',
        severity: 'error'
      });
    }
  };

  const fetchFollowData = async () => {
    if (!profile?.user?._id) return;

    try {
      // Fetch followers
      const followersResponse = await axios.get(
        `http://localhost:5000/api/follows/followers/${profile.user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setFollowers(followersResponse.data);

      // Fetch following
      const followingResponse = await axios.get(
        `http://localhost:5000/api/follows/following/${profile.user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setFollowing(followingResponse.data);
    } catch (error) {
      console.error('Error fetching follow data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load followers/following data',
        severity: 'error'
      });
    }
  };

  if (!user && !id) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Alert severity="error">No user or profile ID found.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>{error}</Alert>
        <Button 
          variant="contained" 
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchProfile();
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Alert severity="warning" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
          Profile not found. Please try again later.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => {
            setLoading(true);
            fetchProfile();
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <PageLayout title="Profile">
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          {/* Show UserProfile with block/unblock button */}
          {profile && user && (
            <UserProfile user={profile.user || profile} currentUser={user} />
          )}
        </Grid>
        {/* Profile Header - Always visible */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: { xs: 1.5, sm: 2, md: 3 }, // Adjusted padding
            display: 'flex', 
            flexDirection: 'column', 
            position: 'relative',
            borderRadius: { xs: 1, sm: 2 } // Adjusted border radius
          }}>
            {/* Edit/Follow Button Position */}
            <Box sx={{ 
              position: 'absolute',
              top: { xs: 8, sm: 12, md: 16 },
              right: { xs: 8, sm: 12, md: 16 },
              zIndex: 1
            }}>
              {user && profile && (
                <>
                  {user._id === profile.user._id ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setEditMode(!editMode)}
                        size="small"
                        sx={{ 
                          minWidth: { xs: 'auto', sm: '100px' },
                          px: { xs: 1, sm: 2 },
                          py: { xs: 0.5, sm: 1 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {editMode ? 'Cancel' : 'Edit'}
                      </Button>
                    </>
                  ) : (
                    <FollowButton
                      targetUserId={profile.user._id}
                      onFollowChange={fetchFollowData}
                      size="small"
                      sx={{ 
                        minWidth: { xs: 'auto', sm: '100px' },
                        px: { xs: 1, sm: 2 },
                        py: { xs: 0.5, sm: 1 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    />
                  )}
                </>
              )}
            </Box>
            {/* Profile Info Section */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              alignItems: { xs: 'center', md: 'flex-start' }, 
              gap: { xs: 2, md: 4 }, 
              flexWrap: 'wrap',
              mt: { xs: 1, md: 0 } // Added top margin for mobile
            }}>
              <Box sx={{ position: 'relative' }}>
                <picture>
                  <source srcSet={getProfileImageUrl(profile?.avatar) || fallbackImage} type="image/webp" />
                  <Avatar
                    src={getProfileImageUrl(profile?.avatar) || fallbackImage}
                    alt={profile?.fullName}
                    width={100}
                    height={100}
                    loading="lazy"
                    onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    onClick={() => setShowImagePreview(true)}
                    sx={{ 
                      width: { xs: 80, sm: 100 }, // Smaller on mobile
                      height: { xs: 80, sm: 100 }, // Smaller on mobile
                      border: '3px solid white', 
                      boxShadow: 2, 
                      background: theme.palette.grey[100],
                      cursor: 'pointer',
                      '& img': {
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%'
                      }
                    }}
                  />
                </picture>
                {user && String(user._id) === String(profile?.user?._id) && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      type="file"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                    <label htmlFor="photo-upload">
                      <IconButton
                        component="span"
                        sx={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.palette.primary.main, color: 'white', '&:hover': { backgroundColor: theme.palette.primary.dark } }}
                        disabled={uploadingPhoto}
                        aria-label="Upload profile photo"
                      >
                        {uploadingPhoto ? <CircularProgress size={22} color="inherit" /> : <PhotoCamera />}
                      </IconButton>
                    </label>
                  </>
                )}
              </Box>
              <Box sx={{ 
                textAlign: { xs: 'center', md: 'left' },
                width: { xs: '100%', md: 'auto' } // Full width on mobile
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.text.primary, 
                  mb: 0.5,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' } // Smaller font on mobile
                }}>
                  {profile?.fullName}
                  {profile?.privacy?.profile === 'private' && (
                    <Tooltip title="Private Profile">
                      <LockIcon sx={{ ml: 1, fontSize: { xs: 16, sm: 20 }, verticalAlign: 'middle', color: 'text.secondary' }} />
                    </Tooltip>
                  )}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                  color: theme.palette.text.secondary, 
                  fontWeight: 500, 
                  mb: 1,
                  fontSize: { xs: '0.875rem', sm: '1rem' } // Smaller font on mobile
                }}>
                  {[
                    getFieldValue('branch'),
                    getFieldValue('session'),
                    `Semester ${getFieldValue('semester')}`
                  ].filter(Boolean).join(' • ')}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary, 
                  fontStyle: 'italic', 
                  mt: 0.5,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' } // Smaller font on mobile
                }}>
                  {getFieldValue('bio')}
                </Typography>
                
                {/* Add Follow Button and Stats */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1, sm: 2 }, 
                  mt: 2,
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}>
                  <Button
                    onClick={() => {
                      setShowFollowersList(true);
                      setShowFollowers(true);
                    }}
                    sx={{ 
                      textTransform: 'none', 
                      color: 'text.secondary',
                      minWidth: { xs: 'auto', sm: '100px' } // Adjusted button width
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>{followers.length}</strong> Followers
                    </Typography>
                  </Button>
                  <Button
                    onClick={() => {
                      setShowFollowersList(true);
                      setShowFollowing(true);
                    }}
                    sx={{ 
                      textTransform: 'none', 
                      color: 'text.secondary',
                      minWidth: { xs: 'auto', sm: '100px' } // Adjusted button width
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      <strong>{following.length}</strong> Following
                    </Typography>
                  </Button>
                  {user && String(user._id) === String(profile?.user?._id) && (
                    <Button
                      onClick={() => {
                        setShowFollowersList(true);
                        setShowPendingRequests(true);
                      }}
                      sx={{ 
                        textTransform: 'none', 
                        color: 'text.secondary',
                        minWidth: { xs: 'auto', sm: '100px' } // Adjusted button width
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <strong>{pendingRequests.length}</strong> Pending
                      </Typography>
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Content - Only visible if shouldShowSection returns true */}
        {shouldShowSection('content') && (
          <>
            <Grid item xs={12}>
              <Box sx={{ width: '100%', maxWidth: 950, mx: 'auto' }}>
                <Card sx={{ borderRadius: { xs: 1, sm: 2 } }}>
                  <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: { xs: 1, sm: 2 } }}>
                    <Tabs
                      value={activeTab}
                      onChange={handleTabChange}
                      sx={{ 
                        borderBottom: 1, 
                        borderColor: 'divider',
                        '& .MuiTab-root': {
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Smaller font on mobile
                          minWidth: { xs: 'auto', sm: '100px' } // Adjusted tab width
                        }
                      }}
                      variant="scrollable"
                      scrollButtons="auto"
                    >
                      <Tab label="About" />
                      <Tab label="Education" />
                      <Tab label="Experience" />
                      <Tab label="Skills" />
                      <Tab label="Posts" />
                      {user && String(user._id) === String(profile?.user?._id) && (
                        <Tab label="Privacy" />
                      )}
                    </Tabs>
                  </Box>
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    {activeTab === 0 && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, fontSize: 20 }}>
                            Basic Information
                          </Typography>
                          {editMode && user && String(user._id) === String(profile?.user?._id) ? (
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Full Name"
                                  name="fullName"
                                  value={formData.fullName}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Roll Number"
                                  name="rollNumber"
                                  value={formData.rollNumber}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Branch"
                                  name="branch"
                                  value={formData.branch}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Session"
                                  name="session"
                                  value={formData.session}
                                  onChange={handleInputChange}
                                  placeholder="e.g., 2020-2024"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Semester"
                                  name="semester"
                                  value={formData.semester}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  label="Address"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <TextField
                                  fullWidth
                                  label="Phone"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  multiline
                                  rows={3}
                                  label="Bio"
                                  name="bio"
                                  value={formData.bio}
                                  onChange={handleInputChange}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Social Links</Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="LinkedIn Profile"
                                      name="linkedin"
                                      value={formData.socialLinks.linkedin || ''}
                                      onChange={(e) => handleUpdateSocialLink('linkedin', e.target.value)}
                                      placeholder="linkedin.com/in/username"
                                      InputProps={{
                                        startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077b5' }} />,
                                        endAdornment: formData.socialLinks.linkedin && (
                                          <IconButton
                                            size="small"
                                            onClick={() => window.open(formData.socialLinks.linkedin, '_blank')}
                                            sx={{ color: '#0077b5' }}
                                          >
                                            <Language />
                                          </IconButton>
                                        )
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="GitHub Profile"
                                      name="github"
                                      value={formData.socialLinks.github || ''}
                                      onChange={(e) => handleUpdateSocialLink('github', e.target.value)}
                                      placeholder="github.com/username"
                                      InputProps={{
                                        startAdornment: <GitHub sx={{ mr: 1, color: '#333' }} />,
                                        endAdornment: formData.socialLinks.github && (
                                          <IconButton
                                            size="small"
                                            onClick={() => window.open(formData.socialLinks.github, '_blank')}
                                            sx={{ color: '#333' }}
                                          >
                                            <Language />
                                          </IconButton>
                                        )
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Personal Website"
                                      name="website"
                                      value={formData.socialLinks.website || ''}
                                      onChange={(e) => handleUpdateSocialLink('website', e.target.value)}
                                      placeholder="www.example.com"
                                      InputProps={{
                                        startAdornment: <Language sx={{ mr: 1, color: '#2196f3' }} />,
                                        endAdornment: formData.socialLinks.website && (
                                          <IconButton
                                            size="small"
                                            onClick={() => window.open(formData.socialLinks.website, '_blank')}
                                            sx={{ color: '#2196f3' }}
                                          >
                                            <Language />
                                          </IconButton>
                                        )
                                      }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Instagram Profile"
                                      name="instagram"
                                      value={formData.socialLinks.instagram || ''}
                                      onChange={(e) => handleUpdateSocialLink('instagram', e.target.value)}
                                      placeholder="instagram.com/username"
                                      InputProps={{
                                        startAdornment: <Instagram sx={{ mr: 1, color: '#e1306c' }} />,
                                        endAdornment: formData.socialLinks.instagram && (
                                          <IconButton
                                            size="small"
                                            onClick={() => window.open(formData.socialLinks.instagram, '_blank')}
                                            sx={{ color: '#e1306c' }}
                                          >
                                            <Language />
                                          </IconButton>
                                        )
                                      }}
                                    />
                                  </Grid>
                                </Grid>
                              </Grid>
                            </Grid>
                          ) : (
                            <Grid container spacing={1}>
                              {[
                                { icon: <School />, label: 'Roll Number', value: getFieldValue('rollNumber'), privacy: 'rollNumber' },
                                { icon: <School />, label: 'Branch', value: getFieldValue('branch'), privacy: 'branch' },
                                { icon: <School />, label: 'Session', value: getFieldValue('session'), privacy: 'session' },
                                { icon: <School />, label: 'Semester', value: getFieldValue('semester'), privacy: 'semester' },
                                { icon: <LocationOn />, label: 'Address', value: getFieldValue('address'), privacy: 'address' },
                                { icon: <Email />, label: 'Email', value: getFieldValue('email'), privacy: 'email' },
                                { icon: <Phone />, label: 'Phone', value: getFieldValue('phone'), privacy: 'phone' },
                                { icon: <Work />, label: 'Bio', value: getFieldValue('bio'), privacy: 'bio' }
                              ].map((item, idx) => (
                                <Grid item xs={12} sm={6} key={item.label}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1, borderBottom: idx < 7 ? '1px solid #f0f0f0' : 'none' }}>
                                    <Box sx={{ color: theme.palette.text.secondary }}>{item.icon}</Box>
                                    <Box sx={{ flex: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 15 }}>{item.label}</Typography>
                                        {isFieldPrivate(item.privacy) && !["email", "phone", "address"].includes(item.privacy) && (
                                          <Tooltip title="Private Information">
                                            <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                          </Tooltip>
                                        )}
                                      </Box>
                                      <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 400 }}>{item.value}</Typography>
                                    </Box>
                                  </Box>
                                </Grid>
                              ))}
                              <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Social Links</Typography>
                                <Grid container spacing={2}>
                                  {[
                                    { icon: <LinkedIn sx={{ color: '#0077b5' }} />, label: 'LinkedIn', platform: 'linkedin', color: '#0077b5' },
                                    { icon: <GitHub sx={{ color: '#333' }} />, label: 'GitHub', platform: 'github', color: '#333' },
                                    { icon: <Language sx={{ color: '#2196f3' }} />, label: 'Website', platform: 'website', color: '#2196f3' },
                                    { icon: <Instagram sx={{ color: '#e1306c' }} />, label: 'Instagram', platform: 'instagram', color: '#e1306c' }
                                  ].map((item) => {
                                    const value = getSocialLinkValue(item.platform);
                                    const url = getSocialLinkUrl(item.platform);
                                    return (
                                      <Grid item xs={12} sm={6} key={item.label}>
                                        <Box 
                                          sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1, 
                                            py: 1,
                                            px: 2,
                                            borderRadius: 1,
                                            '&:hover': {
                                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                              cursor: url ? 'pointer' : 'default'
                                            }
                                          }}
                                          onClick={() => url && window.open(url, '_blank')}
                                        >
                                          <Box>{item.icon}</Box>
                                          <Box sx={{ flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 15 }}>{item.label}</Typography>
                                              {isFieldPrivate('socialLinks') && (
                                                <Tooltip title="Private Information">
                                                  <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                </Tooltip>
                                              )}
                                            </Box>
                                            {url ? (
                                              <Link
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ 
                                                  color: item.color,
                                                  textDecoration: 'none',
                                                  '&:hover': { 
                                                    textDecoration: 'underline',
                                                    color: item.color
                                                  }
                                                }}
                                              >
                                                <Typography variant="body2">{value}</Typography>
                                              </Link>
                                            ) : (
                                              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 400 }}>{value}</Typography>
                                            )}
                                          </Box>
                                          {url && (
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(url, '_blank');
                                              }}
                                              sx={{ color: item.color }}
                                            >
                                              <Language />
                                            </IconButton>
                                          )}
                                        </Box>
                                      </Grid>
                                    );
                                  })}
                                </Grid>
                              </Grid>
                            </Grid>
                          )}
                        </Grid>
                      </Grid>
                    )}

                    {activeTab === 1 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Education
                          {profile?.privacy?.education === 'private' && (
                            <Tooltip title="Private Education">
                              <LockIcon sx={{ ml: 1, fontSize: 20, verticalAlign: 'middle', color: 'text.secondary' }} />
                            </Tooltip>
                          )}
                        </Typography>
                        {editMode && user && String(user._id) === String(profile?.user?._id) ? (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              sx={{ mb: 2 }}
                              onClick={() => setOpenEducationDialog(true)}
                            >
                              Add Education
                            </Button>
                            <List>
                              {formData.education && formData.education.map((edu, index) => (
                                <ListItem key={index} secondaryAction={
                                  <IconButton edge="end" onClick={() => handleRemoveEducation(index)}>
                                    <Delete />
                                  </IconButton>
                                }>
                                  <ListItemIcon>
                                    <School />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={edu.degree}
                                    secondary={`${edu.institution} • ${edu.year}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        ) : (
                          <List>
                            {profile?.education && profile.education.length > 0 ? (
                              profile.education.map((edu, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <School />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={edu.degree}
                                    secondary={`${edu.institution} • ${edu.year}`}
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <ListItem>
                                <ListItemText
                                  primary="No education details available"
                                  sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                                />
                              </ListItem>
                            )}
                          </List>
                        )}
                      </Box>
                    )}

                    {activeTab === 2 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Experience
                          {profile?.privacy?.experience === 'private' && (
                            <Tooltip title="Private Experience">
                              <LockIcon sx={{ ml: 1, fontSize: 20, verticalAlign: 'middle', color: 'text.secondary' }} />
                            </Tooltip>
                          )}
                        </Typography>
                        {editMode && user && String(user._id) === String(profile?.user?._id) ? (
                          <>
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              sx={{ mb: 2 }}
                              onClick={() => setOpenExperienceDialog(true)}
                            >
                              Add Experience
                            </Button>
                            <List>
                              {formData.experience && formData.experience.map((exp, index) => (
                                <ListItem key={index} secondaryAction={
                                  <IconButton edge="end" onClick={() => handleRemoveExperience(index)}>
                                    <Delete />
                                  </IconButton>
                                }>
                                  <ListItemIcon>
                                    <Work />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={exp.position}
                                    secondary={`${exp.company} • ${exp.duration}`}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </>
                        ) : (
                          <List>
                            {profile?.experience && profile.experience.length > 0 ? (
                              profile.experience.map((exp, index) => (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <Work />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={exp.position}
                                    secondary={`${exp.company} • ${exp.duration}`}
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <ListItem>
                                <ListItemText
                                  primary="No experience details available"
                                  sx={{ color: 'text.secondary', fontStyle: 'italic' }}
                                />
                              </ListItem>
                            )}
                          </List>
                        )}
                      </Box>
                    )}

                    {activeTab === 3 && (
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Skills
                          {profile?.privacy?.skills === 'private' && (
                            <Tooltip title="Private Skills">
                              <LockIcon sx={{ ml: 1, fontSize: 20, verticalAlign: 'middle', color: 'text.secondary' }} />
                            </Tooltip>
                          )}
                        </Typography>
                        {editMode && user && String(user._id) === String(profile?.user?._id) ? (
                          <>
                            <Box sx={{ mb: 2 }}>
                              {formData.skills && formData.skills.map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  onDelete={() => handleRemoveSkill(skill)}
                                  sx={{ m: 0.5 }}
                                />
                              ))}
                            </Box>
                            <Button
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={() => setOpenDialog(true)}
                            >
                              Add Skill
                            </Button>
                          </>
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {profile?.skills && profile.skills.length > 0 ? (
                              profile.skills.map((skill, index) => (
                                <Chip
                                  key={index}
                                  label={skill}
                                  sx={{ m: 0.5 }}
                                />
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No skills added yet
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    {activeTab === 4 && (
                      <Box>
                        {user && String(user._id) === String(profile?.user?._id) && (
                          <CreatePost onPost={handleCreatePost} user={user} />
                        )}
                        {editingPost && (
                          <Box sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              placeholder="Edit your post..."
                              sx={{ mb: 2 }}
                            />
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setEditingPost(null);
                                  setEditContent('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="contained"
                                onClick={handleSaveEdit}
                                disabled={!editContent.trim()}
                              >
                                Save Changes
                              </Button>
                            </Box>
                          </Box>
                        )}
                        <Feed 
                          posts={posts} 
                          onLike={handleLikePost}
                          onComment={handleComment}
                          onDelete={handleDeletePost}
                          onEdit={handleEditPost}
                          onSave={handleSavePost}
                          savedPosts={savedPosts}
                          showSnackbar={(msg) => setSnackbar({ open: true, message: msg, severity: 'success' })} 
                        />
                      </Box>
                    )}

                    {activeTab === 5 && user && String(user._id) === String(profile?.user?._id) && (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Button
                            startIcon={<ArrowBack />}
                            onClick={() => setActiveTab(0)}
                            sx={{ mr: 2 }}
                          >
                            Back to Profile
                          </Button>
                          <Typography variant="h6">Privacy Settings</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Control who can see your profile information. You can set different privacy levels for each section.
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Profile Visibility</Typography>
                            <FormControl fullWidth sx={{ mb: 3 }}>
                              <InputLabel>Overall Profile Privacy</InputLabel>
                              <Select
                                value={privacy.profile || 'public'}
                                label="Overall Profile Privacy"
                                onChange={e => handlePrivacyChange('profile', e.target.value)}
                              >
                                <MenuItem value="public">Public - Anyone can view your profile</MenuItem>
                                <MenuItem value="friends">Friends Only - Only your followers can view your profile</MenuItem>
                                <MenuItem value="private">Private - Only you can view your profile</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Personal Information</Typography>
                            <Grid container spacing={2}>
                              {[
                                { field: 'photo', label: 'Profile Photo' },
                                { field: 'email', label: 'Email Address' },
                                { field: 'phone', label: 'Phone Number' },
                                { field: 'address', label: 'Address' },
                                { field: 'bio', label: 'Bio' }
                              ].map(item => (
                                <Grid item xs={12} sm={6} key={item.field}>
                                  <FormControl fullWidth>
                                    <InputLabel>{item.label}</InputLabel>
                                    <Select
                                      value={privacy[item.field] || 'public'}
                                      label={item.label}
                                      onChange={e => handlePrivacyChange(item.field, e.target.value)}
                                    >
                                      <MenuItem value="public">Public</MenuItem>
                                      <MenuItem value="friends">Friends Only</MenuItem>
                                      <MenuItem value="private">Private</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Professional Information</Typography>
                            <Grid container spacing={2}>
                              {[
                                { field: 'education', label: 'Education' },
                                { field: 'experience', label: 'Experience' },
                                { field: 'skills', label: 'Skills' },
                                { field: 'socialLinks', label: 'Social Links' }
                              ].map(item => (
                                <Grid item xs={12} sm={6} key={item.field}>
                                  <FormControl fullWidth>
                                    <InputLabel>{item.label}</InputLabel>
                                    <Select
                                      value={privacy[item.field] || 'public'}
                                      label={item.label}
                                      onChange={e => handlePrivacyChange(item.field, e.target.value)}
                                    >
                                      <MenuItem value="public">Public</MenuItem>
                                      <MenuItem value="friends">Friends Only</MenuItem>
                                      <MenuItem value="private">Private</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Social Information</Typography>
                            <Grid container spacing={2}>
                              {[
                                { field: 'followers', label: 'Followers List' },
                                { field: 'following', label: 'Following List' }
                              ].map(item => (
                                <Grid item xs={12} sm={6} key={item.field}>
                                  <FormControl fullWidth>
                                    <InputLabel>{item.label}</InputLabel>
                                    <Select
                                      value={privacy[item.field] || 'public'}
                                      label={item.label}
                                      onChange={e => handlePrivacyChange(item.field, e.target.value)}
                                    >
                                      <MenuItem value="public">Public</MenuItem>
                                      <MenuItem value="friends">Friends Only</MenuItem>
                                      <MenuItem value="private">Private</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => {
                              setPrivacy(profile.privacy);
                              setActiveTab(0);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={async () => {
                              await handleSavePrivacy();
                              setActiveTab(0);
                            }}
                          >
                            Save & Return
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Box>
            </Grid>
          </>
        )}
      </Grid>

      {/* Edit Mode Actions - Made more mobile friendly */}
      {editMode && (
        <Box sx={{ 
          position: 'fixed', 
          bottom: { xs: 16, sm: 20 }, 
          right: { xs: 16, sm: 20 }, 
          display: 'flex', 
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' } // Stack buttons on mobile
        }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={handleCancel}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Save Changes
          </Button>
        </Box>
      )}

      {/* Add Skill Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Skill"
            fullWidth
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddSkill} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add Followers List Dialog */}
      <FollowersList
        open={showFollowersList}
        onClose={() => setShowFollowersList(false)}
        userId={profile?._id}
      />

      {/* Add these dialogs at the bottom of the component, before the closing Container tag */}
      <Dialog
        open={showFollowers}
        onClose={() => setShowFollowers(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Followers</Typography>
            <IconButton onClick={() => setShowFollowers(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {followers.length > 0 ? (
            <List>
              {followers.map((follower) => (
                <ListItem key={follower._id}>
                  <ListItemAvatar>
                    <Avatar src={follower.avatar} alt={follower.username} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={follower.username}
                    secondary={follower.fullName}
                  />
                  {user && String(user._id) === String(profile.user._id) && (
                    <FollowButton
                      targetUserId={follower._id}
                      onFollowChange={fetchFollowData}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
              No followers yet
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showFollowing}
        onClose={() => setShowFollowing(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Following</Typography>
            <IconButton onClick={() => setShowFollowing(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {following.length > 0 ? (
            <List>
              {following.map((followed) => (
                <ListItem key={followed._id}>
                  <ListItemAvatar>
                    <Avatar src={followed.avatar} alt={followed.username} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={followed.username}
                    secondary={followed.fullName}
                  />
                  {user && String(user._id) === String(profile.user._id) && (
                    <FollowButton
                      targetUserId={followed._id}
                      onFollowChange={fetchFollowData}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
              Not following anyone yet
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Profile Image Preview Dialog */}
      <Dialog
        open={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setShowImagePreview(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <Close />
          </IconButton>
          <Box
            component="img"
            src={getProfileImageUrl(profile?.avatar) || fallbackImage}
            alt={profile?.fullName}
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Add Education Dialog */}
      <Dialog open={openEducationDialog} onClose={() => setOpenEducationDialog(false)}>
        <DialogTitle>Add Education</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Degree"
            fullWidth
            value={educationInput.degree}
            onChange={e => setEducationInput({ ...educationInput, degree: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Institution"
            fullWidth
            value={educationInput.institution}
            onChange={e => setEducationInput({ ...educationInput, institution: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Year"
            fullWidth
            value={educationInput.year}
            onChange={e => setEducationInput({ ...educationInput, year: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEducationDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEducation} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Experience Dialog */}
      <Dialog open={openExperienceDialog} onClose={() => setOpenExperienceDialog(false)}>
        <DialogTitle>Add Experience</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Position"
            fullWidth
            value={experienceInput.position}
            onChange={e => setExperienceInput({ ...experienceInput, position: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Company"
            fullWidth
            value={experienceInput.company}
            onChange={e => setExperienceInput({ ...experienceInput, company: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Duration"
            fullWidth
            value={experienceInput.duration}
            onChange={e => setExperienceInput({ ...experienceInput, duration: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExperienceDialog(false)}>Cancel</Button>
          <Button onClick={handleAddExperience} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default Profile; 