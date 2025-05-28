import React from 'react';
import { Dialog, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImagePreviewDialog = ({ open, onClose, imageUrl }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <Box sx={{ position: 'relative', bgcolor: '#000', p: 0 }}>
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2 }}
      >
        <CloseIcon />
      </IconButton>
      <img
        src={imageUrl}
        alt="Preview"
        style={{
          display: 'block',
          maxWidth: '100%',
          maxHeight: '80vh',
          margin: '0 auto',
          width: 'auto',
          height: 'auto',
        }}
      />
    </Box>
  </Dialog>
);

export default ImagePreviewDialog; 