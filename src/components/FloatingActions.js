import React from 'react';
import { Box, Fab, Tooltip, styled } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';

const FloatingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '80px',
  right: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  zIndex: 1000,
  [theme.breakpoints.up('md')]: {
    display: 'none', // Hide on desktop
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  width: '56px',
  height: '56px',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
}));

const FloatingActions = ({ onCreatePost }) => {
  return (
    <FloatingContainer>
      <Tooltip title="Create Post" placement="left">
        <StyledFab
          onClick={onCreatePost}
          aria-label="create post"
        >
          <CreateIcon />
        </StyledFab>
      </Tooltip>
    </FloatingContainer>
  );
};

export default FloatingActions; 