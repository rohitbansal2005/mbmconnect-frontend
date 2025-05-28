import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  LinearProgress,
  styled,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const ModalOverlay = styled(Box)({
  display: 'flex',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.85)',
  zIndex: 2000,
  alignItems: 'center',
  justifyContent: 'center',
});

const ModalContent = styled(Box)({
  background: '#111',
  borderRadius: '16px',
  padding: 0,
  maxWidth: '420px',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  position: 'relative',
});

const ProgressBar = styled(Box)({
  width: '100%',
  height: '4px',
  background: 'rgba(255,255,255,0.2)',
  borderRadius: '2px 2px 0 0',
  overflow: 'hidden',
  marginBottom: 0,
  position: 'absolute',
  top: 0,
  left: 0,
});

const ProgressBarFill = styled(Box)({
  height: '100%',
  background: 'linear-gradient(90deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
  width: '0%',
  transition: 'width 0.2s linear',
});

const MediaContainer = styled(Box)({
  maxWidth: '100%',
  maxHeight: '70vh',
  borderRadius: '0 0 16px 16px',
  background: '#000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '4px',
});

const NavigationButtons = styled(Box)({
  position: 'absolute',
  top: '50%',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  transform: 'translateY(-50%)',
  zIndex: 10,
});

const NavButton = styled(IconButton)({
  background: 'rgba(0,0,0,0.3)',
  color: '#fff',
  '&:hover': {
    background: 'rgba(0,0,0,0.6)',
  },
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: '10px',
  right: '10px',
  background: 'rgba(0,0,0,0.3)',
  color: '#fff',
  zIndex: 20,
  '&:hover': {
    background: 'rgba(0,0,0,0.6)',
  },
});

const StoryModal = ({ open, onClose, stories, initialStoryIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialStoryIndex);
      setProgress(0);
      startProgressTimer();
    }
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [open, initialStoryIndex]);

  const startProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STORY_DURATION) * 100;

      if (newProgress >= 100) {
        handleNext();
      } else {
        setProgress(newProgress);
      }
    }, 10);
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      startProgressTimer();
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      startProgressTimer();
    }
  };

  const handleMouseEnter = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const handleMouseLeave = () => {
    startProgressTimer();
  };

  if (!open || !stories.length) return null;

  const currentStory = stories[currentIndex];

  return (
    <ModalOverlay
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ModalContent>
        <ProgressBar>
          <ProgressBarFill style={{ width: `${progress}%` }} />
        </ProgressBar>

        <MediaContainer>
          {currentStory.type === 'video' ? (
            <video
              src={currentStory.url}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '0 0 16px 16px',
                background: '#000',
              }}
              autoPlay
              muted
              loop
            />
          ) : (
            <img
              src={currentStory.url}
              alt={currentStory.username}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '0 0 16px 16px',
                background: '#000',
              }}
            />
          )}
        </MediaContainer>

        <NavigationButtons>
          <NavButton onClick={handlePrevious} disabled={currentIndex === 0}>
            <NavigateBeforeIcon />
          </NavButton>
          <NavButton onClick={handleNext} disabled={currentIndex === stories.length - 1}>
            <NavigateNextIcon />
          </NavButton>
        </NavigationButtons>

        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default StoryModal; 