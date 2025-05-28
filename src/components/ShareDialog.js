import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box, Card, CardContent, Avatar, Snackbar } from '@mui/material';
import { getBestProfileImage, fallbackImage } from '../utils/imageUtils';

const getPostImageUrl = (media) => {
  if (!media) return fallbackImage;
  if (media.startsWith('http')) return media;
  return `${window.location.origin}/${media.replace(/^[/\\]+/, '').replace(/\\/g, '/')}`;
};

const ShareDialog = ({ open, onClose, post }) => {
  const [caption, setCaption] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  if (!post) return null;
  const postUrl = `${window.location.origin}/post/${post._id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(postUrl);
    setSnackbarOpen(true);
    onClose();
  };

  const handleSystemShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post!',
        text: caption,
        url: postUrl
      });
      onClose();
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { minWidth: 360, maxWidth: 500 } }}
      >
        <DialogTitle>Share Post</DialogTitle>
        <DialogContent sx={{ minHeight: 220, overflowY: 'auto' }}>
          <Card variant="outlined" sx={{ mb: 2, boxShadow: 1, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Avatar
                  src={getBestProfileImage(post.author)}
                  alt={post.author?.username}
                  sx={{ width: 40, height: 40 }}
                  onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{post.author?.username}</Typography>
              </Box>
              <Typography variant="body1" sx={{ mb: 1 }}>{post.content}</Typography>
              {/* Image preview removed as per user request */}
            </CardContent>
          </Card>
          <TextField
            label="Add a caption (optional)"
            fullWidth
            value={caption}
            onChange={e => setCaption(e.target.value)}
            sx={{ mt: 1, mb: 2 }}
          />
          <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all', color: 'text.secondary' }}>
            Link: {postUrl}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSystemShare} variant="contained">Share</Button>
          <Button onClick={handleCopy}>Copy Link</Button>
          <Button onClick={onClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Link copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default ShareDialog; 