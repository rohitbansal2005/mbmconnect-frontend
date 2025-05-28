import React, { useState, useRef } from 'react';
import { Box, Avatar, Typography, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const StoriesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  background: theme.palette.background.paper,
  borderRadius: '16px',
  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  padding: '18px 24px 12px 24px',
  margin: '60px auto 0 auto',
  maxWidth: '940px',
  overflowX: 'auto',
  marginBottom: 0,
  scrollbarWidth: 'thin',
  scrollbarColor: '#ccc #f0f0f0',
  '&::-webkit-scrollbar': {
    height: '8px',
    background: '#f0f0f0',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#ccc',
    borderRadius: '8px',
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
}));

const StoriesList = styled(Box)({
  display: 'flex',
  gap: '16px',
  overflowX: 'auto',
  flex: 1,
});

const StoryItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  width: '80px',
  minWidth: '80px',
});

const StoryImage = styled(Box)({
  width: '68px',
  height: '68px',
  borderRadius: '50%',
  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
  padding: '3px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  marginBottom: '6px',
  position: 'relative',
  boxSizing: 'border-box',
});

const StoryImageInner = styled(Box)({
  width: '62px',
  height: '62px',
  borderRadius: '50%',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative',
});

const StoryProfile = styled(Box)({
  position: 'absolute',
  bottom: '-8px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: '2px solid #fff',
  background: '#fff',
  overflow: 'hidden',
  zIndex: 2,
});

const StoryUsername = styled(Typography)({
  fontSize: '12px',
  color: '#222',
  textAlign: 'center',
  fontWeight: 500,
  marginTop: '2px',
  maxWidth: '80px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const CreateStoryCard = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  width: '80px',
  minWidth: '80px',
});

const StoriesBar = ({ stories = [], onStoryClick, onCreateStory }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video') ? 'video' : 'image';
    
    onCreateStory({
      url,
      type,
      username: 'You',
      profile: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    });
  };

  return (
    <StoriesContainer>
      <StoriesList>
        <CreateStoryCard onClick={() => fileInputRef.current?.click()}>
          <StoryImage>
            <StoryImageInner>
              <IconButton
                sx={{
                  color: 'primary.main',
                  '&:hover': { color: 'primary.dark' },
                }}
              >
                <AddCircleIcon fontSize="large" />
              </IconButton>
            </StoryImageInner>
          </StoryImage>
          <StoryUsername>Create Story</StoryUsername>
        </CreateStoryCard>

        {stories.map((story, index) => (
          <StoryItem key={index} onClick={() => onStoryClick(story)}>
            <StoryImage>
              <StoryImageInner>
                <img
                  src={story.profile}
                  alt={story.username}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                />
              </StoryImageInner>
            </StoryImage>
            <StoryUsername>{story.username}</StoryUsername>
          </StoryItem>
        ))}
      </StoriesList>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </StoriesContainer>
  );
};

export default StoriesBar; 