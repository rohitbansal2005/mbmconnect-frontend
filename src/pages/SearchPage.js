import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { List, ListItem, ListItemText, Avatar, Box, Typography, CircularProgress, Stack } from '@mui/material';
import { getProfileImageUrl, fallbackImage } from '../utils/imageUtils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import FollowButton from '../components/FollowButton';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const query = useQuery().get('query') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) return;
    setLoading(true);
    axios.get(`http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => setResults(res.data))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" gutterBottom>Search Results</Typography>
      </Box>
      {loading ? <CircularProgress /> : (
        <List>
          {results.map(user => (
            <ListItem key={user._id} alignItems="flex-start" disableGutters>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                  <Link to={`/profile/${user._id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', width: '100%' }}>
                    <Avatar src={getProfileImageUrl(user.profilePicture || user.avatar) || fallbackImage} sx={{ width: 48, height: 48, mr: 2 }} />
                    <Stack direction="column" spacing={0.5} sx={{ ml: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>{user.username || user.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.branch || 'Branch not set'}
                        {user.session ? ` • ${user.session}` : ''}
                        {user.semester ? ` • Semester ${user.semester}` : ''}
                      </Typography>
                      {user.bio && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {user.bio}
                        </Typography>
                      )}
                    </Stack>
                  </Link>
                </Box>
                <Box sx={{ ml: 2 }}>
                  <FollowButton targetUserId={user._id} />
                </Box>
              </Box>
            </ListItem>
          ))}
          {results.length === 0 && <Typography>No users found.</Typography>}
        </List>
      )}
    </Box>
  );
};

export default SearchPage; 