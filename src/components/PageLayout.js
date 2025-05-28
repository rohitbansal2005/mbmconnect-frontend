import React from 'react';
import { Box, Container, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const PageLayout = ({ children, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); 
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Estimate AppBar height (standard Material-UI heights)
  const appBarHeight = isMobile ? 56 : (isDesktop ? 64 : 56); 
  
  // Estimate fixed header height (BackButton content + py: 1)
  const fixedHeaderVerticalPadding = theme.spacing(1) * 2; // py: 1 is 8px top + 8px bottom = 16px
  // Let's assume fixed header content height is around 36px
  const fixedHeaderContentHeight = 36;
  const fixedHeaderTotalHeight = fixedHeaderContentHeight + fixedHeaderVerticalPadding; // 36 + 16 = 52px

  // Total height to offset content is AppBar height + Fixed Header height
  // Set responsive pt for content box
  const contentPaddingTop = {
    xs: appBarHeight + fixedHeaderTotalHeight + 8, // Increased offset
    sm: (isMobile ? appBarHeight : 64) + fixedHeaderTotalHeight + 8, // Increased offset
    md: 64 + fixedHeaderTotalHeight + 8 // Increased offset
  };

  return (
    <Box sx={{ 
      position: 'relative',
      minHeight: '100vh',
      backgroundColor: theme => theme.palette.background.default,
      pb: { xs: 2, sm: 3, md: 4 },
    }}>
      {/* Fixed header box for back button and title */}
      <Box sx={{ 
        position: 'fixed',
        top: appBarHeight, // Position directly below the AppBar
        left: 0,
        right: 0,
        zIndex: 1100, 
        backgroundColor: theme => theme.palette.background.default, 
        py: 1, // 8px top and bottom padding
        display: 'flex', 
        alignItems: 'center',
        px: { xs: 1, sm: 2, md: 3 }, 
        boxShadow: theme => theme.shadows[1],
        height: { xs: '56px', sm: '64px' }, // Define a responsive height for the fixed header
      }}>
        <IconButton 
          onClick={() => window.history.back()} // Use window.history.back() for navigation
          sx={{ 
            color: theme.palette.text.primary,
            height: fixedHeaderContentHeight // Set explicit height based on estimation
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 500, color: theme.palette.text.primary }}>
          {title}
        </Typography>
      </Box>
      
      {/* Content Box: Add top padding to prevent overlap with the fixed header */}
      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          overflowY: 'auto',
          mt: { xs: '120px', sm: '130px' }, // Increase top margin further to clear both nav and fixed header
          px: { xs: 1, sm: 2, md: 3 },
          pb: 3, // Add some bottom padding
          boxSizing: 'border-box', // Include padding in the element's total width and height
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PageLayout; 