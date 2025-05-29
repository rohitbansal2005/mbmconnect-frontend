import React, { useState, useEffect, useRef } from 'react';
import { TextField, List, ListItem, Avatar, Typography, CircularProgress, Box, Paper, ListItemAvatar, ListItemText, InputAdornment, IconButton } from '@mui/material';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileImageUrl, fallbackImage } from '../utils/imageUtils';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import config from '../config';

const NavbarUserSearch = ({
  query,
  setQuery,
  results,
  setResults,
  loading,
  setLoading,
  showResults,
  setShowResults,
  searchInputRef,
  readOnly = false
}) => {
  const { token } = useAuth();
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setLoading(true);
    setShowResults(true);
    try {
      console.log('Searching with token:', token ? 'Token exists' : 'No token');
      const res = await axios.get(`${config.backendUrl}/api/users/search?query=${encodeURIComponent(value)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log('Search results:', res.data);
      setResults(res.data);
    } catch (error) {
      console.error('Search error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setResults([]);
    }
    setLoading(false);
  };

  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setQuery('');
      setResults([]);
      setShowResults(false);
    }
  };

  useEffect(() => {
    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.length > 1) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  const handleSearchClick = () => {
    if (query.length > 1) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }} ref={searchRef}>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search users..."
        value={query}
        onChange={(e) => !readOnly && handleSearch(e)}
        onKeyDown={handleKeyDown}
        inputRef={searchInputRef}
        InputProps={{
          readOnly: readOnly,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearchClick}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          },
        }}
      />
      {query && showResults && results.length > 0 && (
        <Paper sx={{ position: 'absolute', top: 40, left: 0, width: '100%', zIndex: 10, maxHeight: 300, overflowY: 'auto' }}>
          <List>
            {results.length === 0 && !loading && (
              <ListItem>
                <ListItemText primary="No users found" />
              </ListItem>
            )}
            {results.map((user) => (
              <ListItem key={user._id} button component={Link} to={`/profile/${user._id}`} onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}>
                <ListItemAvatar>
                  <Avatar src={getProfileImageUrl(user.profilePicture || user.avatar) || fallbackImage}>
                    {(!user.profilePicture && !user.avatar && user.username) && user.username[0].toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user.username || user.fullName}
                    </Typography>
                  }
                  secondary={
                    <>
                      {(user.branch || user.session || user.semester) ? (
                        <Typography variant="body2" color="text.secondary" component="span">
                          {user.branch ? user.branch : ''}
                          {user.session ? ` • ${user.session}` : ''}
                          {user.semester ? ` • Semester ${user.semester}` : ''}
                        </Typography>
                      ) : null}
                      {user.bio && (
                        <Typography variant="body2" color="text.secondary" component="span" sx={{ fontStyle: 'italic', fontSize: '0.85em', display: 'block' }}>
                          {user.bio}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
      {query && showResults && results.length === 0 && !loading && (
         <Paper sx={{ position: 'absolute', top: 40, left: 0, width: '100%', zIndex: 10, maxHeight: 300, overflowY: 'auto', p: 1 }}>
           <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
             No users found
           </Typography>
         </Paper>
      )}
    </Box>
  );
};

export default NavbarUserSearch;
