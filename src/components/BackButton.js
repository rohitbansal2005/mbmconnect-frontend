import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const BackButton = ({ title = 'Back' }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: { xs: 'flex', md: 'none' },
      alignItems: 'center',
      mb: 2,
      position: 'sticky',
      top: 0,
      zIndex: 2,
      backgroundColor: theme.palette.background.default,
      py: 1
    }}>
      <IconButton 
        onClick={() => navigate(-1)}
        sx={{ 
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500 }}>
        {title}
      </Typography>
    </Box>
  );
};

export default BackButton; 