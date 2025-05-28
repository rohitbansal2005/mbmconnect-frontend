import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Avatar,
  TextField,
  Button,
  IconButton,
  styled,
  Snackbar,
  Alert,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import VideocamIcon from '@mui/icons-material/Videocam';
import { getProfileImageUrl, getBestProfileImage, fallbackImage } from '../utils/imageUtils';

const CreatePostContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));

const PostInput = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const PostActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  position: 'relative',
  '& img': {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: theme.shape.borderRadius,
  },
}));

const RemoveImageButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const CreatePost = ({ onPost, user }) => {
  const [postText, setPostText] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);

  const handleMediaChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'File size exceeds 10MB. Please select a smaller file.',
          severity: 'error'
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
        setMediaType(isImage ? 'image' : 'video');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = () => {
    if (postText.trim() || mediaPreview) {
      console.log('Sending post data:', {
        content: postText,
        hasMedia: !!fileInputRef.current?.files[0],
        mediaFile: fileInputRef.current?.files[0]
      });

      const formData = new FormData();
      formData.append('content', postText);
      if (fileInputRef.current?.files[0]) {
        formData.append('media', fileInputRef.current.files[0]);
      }

      onPost(formData);
      setPostText('');
      setMediaPreview(null);
      setMediaType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <CreatePostContainer>
      <PostInput>
        <Avatar
          src={getBestProfileImage(user)}
          alt={user?.username || user?.fullName}
          sx={{ width: 40, height: 40 }}
        >
          {(!user?.avatar && !user?.profilePicture && (user?.username || user?.fullName)) ? (user.username ? user.username[0].toUpperCase() : user.fullName[0].toUpperCase()) : null}
        </Avatar>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="What's on your mind?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          variant="outlined"
          size="small"
        />
      </PostInput>

      {mediaPreview && (
        <ImagePreview>
          {mediaType === 'image' ? (
            <img src={mediaPreview} alt="Preview" />
          ) : (
            <video src={mediaPreview} controls style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: 8 }} />
          )}
          <RemoveImageButton size="small" onClick={handleRemoveMedia}>×</RemoveImageButton>
        </ImagePreview>
      )}

      <PostActions>
        <Button
          startIcon={<PhotoCameraIcon />}
          onClick={() => {
            fileInputRef.current.accept = 'image/*';
            fileInputRef.current.click();
          }}
          variant="outlined"
          size="small"
          disabled={!!mediaPreview}
        >
          Photo
        </Button>
        <Button
          startIcon={<VideocamIcon />}
          onClick={() => {
            fileInputRef.current.accept = 'video/*';
            fileInputRef.current.click();
          }}
          variant="outlined"
          size="small"
          disabled={!!mediaPreview}
        >
          Video
        </Button>
        <Button
          endIcon={<SendIcon />}
          onClick={handlePost}
          variant="contained"
          disabled={!postText.trim() && !mediaPreview}
        >
          Post
        </Button>
      </PostActions>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleMediaChange}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </CreatePostContainer>
  );
};

export default CreatePost; 