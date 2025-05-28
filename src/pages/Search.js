import React, { useState } from 'react';
import { Box, TextField, IconButton, List, ListItem, ListItemText, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PageLayout from '../components/PageLayout';
import FollowButton from '../components/FollowButton';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    // TODO: Replace with your actual search API call
    // Example: const res = await axios.get(`/api/search?q=${query}`);
    // setResults(res.data);
    setResults([
      { _id: '1', name: 'Demo User 1' },
      { _id: '2', name: 'Demo User 2' }
    ]);
  };

  return (
    <PageLayout title="Search">
      <Box sx={{ px: 2, pb: 2, maxWidth: 600, mx: 'auto' }}>
        <Paper sx={{ display: 'flex', alignItems: 'center', p: 1, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search users, posts, groups..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            variant="standard"
            InputProps={{ disableUnderline: true }}
          />
          <IconButton onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
        </Paper>
        <List>
          {results.map((item, idx) => (
            <ListItem key={idx} secondaryAction={<FollowButton targetUserId={item._id} />}>
              <ListItemText primary={item.name || item.title} />
            </ListItem>
          ))}
        </List>
      </Box>
    </PageLayout>
  );
};

export default Search; 