import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Favorite as FavoriteIcon,
  Report as ReportIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getProfileImageUrl, getBestProfileImage, fallbackImage } from '../utils/imageUtils';
import ShareDialog from './ShareDialog';
import ImagePreviewDialog from './ImagePreviewDialog';
import ReportDialog from './ReportDialog';

const PostImage = styled('img')({
  width: '100%',
  maxHeight: 500,
  objectFit: 'cover',
  aspectRatio: '16/9',
  loading: 'lazy',
});

const CommentBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
}));

const CommentBubble = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  maxWidth: '80%',
}));

const getMediaUrl = (media) => {
  if (!media) return '';
  if (media.startsWith('http')) return media;
  let cleanPath = media.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  cleanPath = cleanPath.replace(/([^:]\/)\/+/, '$1');
  return `http://localhost:5000/${cleanPath}`;
};

const PostCard = ({ post, onLike, onComment, onEdit, onReport, onDelete, onSave, savedPosts, showSnackbar, handleShareClick, onImageClick, onReportComment, onPostClick }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [shareSnackbar, setShareSnackbar] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const mediaUrl = getMediaUrl(post.media);
  const isLiked = post.likes?.includes(user?._id);
  const isOwner = user && post.author && post.author._id === user._id;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState('post');
  const [reportTarget, setReportTarget] = useState(null);
  const [textMenuAnchor, setTextMenuAnchor] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const isSaved = savedPosts?.includes(post._id);
  const [followStatus, setFollowStatus] = useState('not_following');
  const [followLoading, setFollowLoading] = useState(false);
  const followCheckTimeoutRef = useRef(null);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !post.author || user._id === post.author._id) return;
      
      // Clear any existing timeout
      if (followCheckTimeoutRef.current) {
        clearTimeout(followCheckTimeoutRef.current);
      }

      // Set a new timeout to debounce the API call
      followCheckTimeoutRef.current = setTimeout(async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(`http://localhost:5000/api/follows/check/${post.author._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFollowStatus(res.data.status || (res.data.isFollowing ? 'following' : 'not_following'));
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }, 500); // 500ms debounce
    };

    checkFollowStatus();

    // Cleanup timeout on unmount
    return () => {
      if (followCheckTimeoutRef.current) {
        clearTimeout(followCheckTimeoutRef.current);
      }
    };
  }, [user, post.author]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onLike) onLike(response.data);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post');
    }
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      if (onComment) onComment(response.data);
    } catch (error) {
      console.error('Error commenting on post:', error);
      alert('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/posts/${post._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (onDelete) onDelete(post._id);
      if (showSnackbar) showSnackbar('Post deleted!', 'success');
      handleMenuClose();
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(post);
    handleMenuClose();
  };

  const handleReport = () => {
    // This function can be removed if not used, or just open the dialog if needed
    // If used, it should only open the report dialog, not send a request
    // setReportDialogOpen(true); // Example if you want to open the dialog
  };

  const handleReportPost = (post) => {
    setReportType('post');
    setReportTarget({ post });
    setReportDialogOpen(true);
  };

  const handleReportComment = (post, comment) => {
    setReportType('comment');
    setReportTarget({ post, comment });
    setReportDialogOpen(true);
  };

  const handleReportSubmit = async ({ reason, description }) => {
    try {
      const token = localStorage.getItem('token');
      if (reportType === 'post') {
        if (!reportTarget || !reportTarget.post || !reportTarget.post._id) {
          if (showSnackbar) showSnackbar('Error: No post selected for reporting.', 'error');
          setReportDialogOpen(false);
          setReportTarget(null);
          return;
        }
        await axios.post(`http://localhost:5000/api/posts/${reportTarget.post._id}/report`, { reason, description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (showSnackbar) showSnackbar('Post reported!', 'success');
      } else if (reportType === 'comment') {
        if (!reportTarget || !reportTarget.post || !reportTarget.comment || !reportTarget.post._id || !reportTarget.comment._id) {
          if (showSnackbar) showSnackbar('Error: No comment selected for reporting.', 'error');
          setReportDialogOpen(false);
          setReportTarget(null);
          return;
        }
        await axios.post(`http://localhost:5000/api/posts/${reportTarget.post._id}/comment/${reportTarget.comment._id}/report`, { reason, description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (showSnackbar) showSnackbar('Comment reported!', 'success');
      }
    } catch (err) {
      console.error('Error reporting:', err);
      if (showSnackbar) showSnackbar('Failed to report.', 'error');
    }
    setReportDialogOpen(false);
    setReportTarget(null);
  };

  const handleTextClick = (event, text, type) => {
    setTextMenuAnchor(event.currentTarget);
    setSelectedText({ text, type });
  };

  const handleTextMenuClose = () => {
    setTextMenuAnchor(null);
    setSelectedText(null);
  };

  const handleCopyText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText.text);
      if (showSnackbar) showSnackbar('Text copied to clipboard!', 'success');
    }
    handleTextMenuClose();
  };

  const handleReportClick = (post) => {
    handleMenuClose();
    setTimeout(() => {
      setReportType('post');
      setReportTarget({ post });
      setReportDialogOpen(true);
    }, 0);
  };

  const handleSave = async () => {
    if (!user) return;
    if (onSave) {
      onSave(post._id);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || !post.author || user._id === post.author._id) return;
    setFollowLoading(true);
    try {
      const token = localStorage.getItem('token');
      let res;
      if (followStatus === 'not_following') {
        res = await axios.post(`http://localhost:5000/api/follows/${post.author._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFollowStatus('pending'); // Assuming it sends a follow request
        if (showSnackbar) showSnackbar('Follow request sent!', 'success');
      } else if (followStatus === 'following') {
        // We need a DELETE route or similar for unfollow
        res = await axios.delete(`http://localhost:5000/api/follows/${post.author._id}`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        setFollowStatus('not_following');
         if (showSnackbar) showSnackbar('Unfollowed user.', 'info');
      } else if (followStatus === 'pending') {
         // Cancel pending request (assuming backend supports this or just do nothing for now)
         // For now, we won't implement cancelling pending requests from here
         if (showSnackbar) showSnackbar('Follow request already pending.', 'info');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      if (showSnackbar) showSnackbar(error.response?.data?.message || 'Failed to toggle follow.', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  const getFollowButtonText = () => {
    switch (followStatus) {
      case 'pending':
        return 'Pending';
      case 'following':
        return 'Following';
      default:
        return 'Follow';
    }
  };

  const getFollowButtonVariant = () => {
     switch (followStatus) {
      case 'following':
        return 'outlined';
      case 'pending':
        return 'text'; // Or 'outlined' with different color
      default:
        return 'contained';
    }
  };

  const getFollowButtonColor = () => {
     switch (followStatus) {
      case 'following':
        return 'primary';
      // When pending, we'll handle color via sx
      // case 'pending':
      //   return 'default';
      default:
        return 'primary';
    }
  };

  return (
    <Card sx={{ mb: 2, p: 0, borderRadius: 3, overflow: 'hidden', boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, pb: 1, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Link to={`/profile/${post.author?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Avatar 
                src={getBestProfileImage(post.author)} 
                alt={post.author?.username || 'User'} 
                sx={{ mr: 1 }} 
              >
                {(!post.author?.profilePicture && !post.author?.avatar && post.author?.username) 
                  ? post.author.username[0].toUpperCase() 
                  : null}
              </Avatar>
            </Link>
            <Box sx={{ display: 'flex', flexDirection: 'column'}}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'inline' }}>
                {post.author?.username || 'Unknown'}
              </Typography>
               <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
              </Typography>
               {post.edited && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0 }}>
                  • edited
                </Typography>
              )}
            </Box>

            {/* Follow Button */}
            {user?._id !== post.author?._id && post.author?._id && (
               <Button
                variant={getFollowButtonVariant()}
                // Use color prop only for standard primary/secondary
                color={followStatus !== 'pending' ? getFollowButtonColor() : undefined}
                onClick={handleFollowToggle}
                disabled={followLoading}
                size="small"
                sx={{
                   ml: 2,
                   textTransform: 'none',
                   // Custom style for pending state
                   ...(followStatus === 'pending' && {
                     color: 'text.secondary', // Use secondary text color for pending
                   }),
                 }}
              >
                {followLoading ? 'Loading...' : getFollowButtonText()}
              </Button>
            )}
          </Box>
         
        </Box>
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
        <Menu 
          anchorEl={anchorEl} 
          open={Boolean(anchorEl)} 
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ style: { zIndex: 1500 } }}
        >
          {isOwner ? ([
            <MenuItem key="edit" onClick={handleEdit}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>,
            <MenuItem key="delete" onClick={handleDelete}>
              <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          ]) : null}
          <MenuItem key="save" onClick={() => { handleSave(); handleMenuClose(); }}>
            <ListItemIcon>{isSaved ? <BookmarkIcon fontSize="small" color="primary" /> : <BookmarkBorderIcon fontSize="small" />}</ListItemIcon>
            <ListItemText>{isSaved ? 'Unsave' : 'Save'}</ListItemText>
          </MenuItem>
          <MenuItem key="report" onClick={() => handleReportClick(post)}>
            <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Report</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      <CardContent sx={{ p: 2, pb: 1 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: post.media ? 2 : 0,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderRadius: 1
            }
          }}
          onClick={(e) => {
            handleTextClick(e, post.content, 'post');
            if (onPostClick) onPostClick(post._id);
          }}
        >
          {post.content || ''}
        </Typography>
        {post.mediaType === 'image' && post.media && (
          <Box sx={{ width: '100%', background: '#111', borderRadius: 2, overflow: 'hidden', mb: 1 }}>
            <img
              src={mediaUrl}
              alt="post"
              width="600"
              height="400"
              loading="lazy"
              style={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                display: 'block',
                borderRadius: 8,
                cursor: 'pointer'
              }}
              onClick={() => onImageClick(mediaUrl)}
              onError={e => { e.target.onerror = null; e.target.src = '/broken-image.png'; }}
            />
          </Box>
        )}
        {post.mediaType === 'video' && post.media && (
          <Box sx={{ width: '100%', background: '#111', borderRadius: 2, overflow: 'hidden', mb: 1 }}>
            <video 
              src={mediaUrl} 
              autoPlay 
              loop 
              muted 
              playsInline
              controls
              style={{ 
                width: '100%', 
                maxHeight: 400, 
                objectFit: 'contain', 
                display: 'block', 
                borderRadius: 8 
              }} 
            />
          </Box>
        )}
      </CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderTop: '1px solid #222', px: 1, py: 1, background: 'background.paper' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleLike} color={isLiked ? 'primary' : 'default'} aria-label={isLiked ? 'Unlike post' : 'Like post'}>
            {isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
          </IconButton>
          <Typography variant="caption">{post.likes?.length || 0}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => setShowComments(!showComments)} aria-label="Show comments">
            <CommentIcon />
          </IconButton>
          <Typography variant="caption">{post.comments?.length || 0}</Typography>
        </Box>
        <Tooltip title="Share">
          <IconButton onClick={() => handleShareClick(post)} aria-label="Share post">
            <ShareIcon />
          </IconButton>
        </Tooltip>
        <Snackbar
          open={shareSnackbar}
          autoHideDuration={2000}
          onClose={() => setShareSnackbar(false)}
          message="Post link copied to clipboard!"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        />
      </Box>
      {showComments && (
        <Box sx={{ mt: 2, px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <Button 
              variant="contained" 
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              Comment
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {post.comments?.map((comment, index) => {
              const isCommentAuthor = user && comment.author && comment.author._id === user._id;
              const isPostOwner = user && post.author && post.author._id === user._id;

              const handleMenuOpen = (event, commentId) => {
                setCommentMenuAnchor(event.currentTarget);
                setActiveCommentId(commentId);
              };
              const handleMenuClose = () => {
                setCommentMenuAnchor(null);
                setActiveCommentId(null);
              };

              const handleEditComment = () => {
                setEditCommentId(comment._id);
                setEditCommentText(comment.text);
                handleMenuClose();
              };

              const handleSaveEditComment = async () => {
                try {
                  const token = localStorage.getItem('token');
                  await axios.put(
                    `http://localhost:5000/api/posts/${post._id}/comment/${editCommentId}`,
                    { text: editCommentText },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  // Update the comment in the UI
                  if (onComment) {
                    const updatedComments = post.comments.map(c =>
                      c._id === editCommentId ? { ...c, text: editCommentText, edited: true } : c
                    );
                    onComment({ ...post, comments: updatedComments });
                  }
                  setEditCommentId(null);
                  setEditCommentText('');
                  if (showSnackbar) showSnackbar('Comment updated!', 'success');
                } catch (err) {
                  if (showSnackbar) showSnackbar('Failed to update comment', 'error');
                }
              };

              return (
                <Box key={comment._id || index} sx={{ display: 'flex', gap: 1, alignItems: 'start', position: 'relative' }}>
                  <Link to={`/profile/${comment.author?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Avatar 
                      src={getBestProfileImage(comment.author)} 
                      alt={comment.author?.username} 
                      sx={{ width: 24, height: 24, display: 'inline-block' }} 
                      onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                    >
                      {(!comment.author?.profilePicture && !comment.author?.avatar && comment.author?.username)
                        ? comment.author.username[0].toUpperCase()
                        : null}
                    </Avatar>
                  </Link>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1 }}>
                        {comment.author?.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
                      </Typography>
                    </Box>
                    {comment.edited && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0, mt: 0 }}>
                        • edited
                      </Typography>
                    )}
                    {editCommentId === comment._id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <TextField
                          value={editCommentText}
                          onChange={e => setEditCommentText(e.target.value)}
                          size="small"
                          fullWidth
                          multiline
                          minRows={1}
                          maxRows={4}
                        />
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleSaveEditComment}
                          disabled={!editCommentText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => {
                            setEditCommentId(null);
                            setEditCommentText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Typography 
                        variant="body2"
                        sx={{ mt: 0.5 }}
                      >
                        {comment.text}
                      </Typography>
                    )}
                  </Box>
                  <IconButton size="small" onClick={e => handleMenuOpen(e, comment._id)} aria-label="Comment options">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu anchorEl={commentMenuAnchor} open={activeCommentId === comment._id} onClose={handleMenuClose}>
                    {isCommentAuthor && (
                      <MenuItem onClick={handleEditComment}>
                        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Edit</ListItemText>
                      </MenuItem>
                    )}
                    {(isCommentAuthor || isPostOwner) && (
                      <MenuItem onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.delete(`http://localhost:5000/api/posts/${post._id}/comment/${comment._id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          if (onComment) {
                            const updatedPost = { ...post, comments: post.comments.filter(c => c._id !== comment._id) };
                            onComment(updatedPost);
                          }
                          if (showSnackbar) showSnackbar('Comment deleted', 'success');
                        } catch (err) {
                          if (showSnackbar) showSnackbar('Failed to delete comment', 'error');
                        }
                        handleMenuClose();
                      }}>
                        <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                        <ListItemText>Delete</ListItemText>
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => {
                      handleMenuClose();
                      handleReportComment(post, comment);
                    }}>
                      <ListItemIcon><ReportIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Report</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
      <Menu
        anchorEl={textMenuAnchor}
        open={Boolean(textMenuAnchor)}
        onClose={handleTextMenuClose}
      >
        <MenuItem onClick={handleCopyText}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Copy Text</ListItemText>
        </MenuItem>
      </Menu>
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReportSubmit}
        type={reportType}
      />
    </Card>
  );
};

const Feed = ({ posts, onLike, onComment, onDelete, onEdit, onSave, savedPosts, onReport, showSnackbar }) => {
  const { user, socket } = useAuth();
  const [commentText, setCommentText] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharePost, setSharePost] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState('post');
  const [reportTarget, setReportTarget] = useState(null);
  const [feedPosts, setFeedPosts] = useState(posts);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Feed received initial posts:', posts);
  console.log('Feed using local state feedPosts:', feedPosts);

  useEffect(() => {
    setFeedPosts(posts);
  }, [posts]);

  useEffect(() => {
    if (!socket) return;

    const handleNewPost = (newPost) => {
      console.log('New post received via socket:', newPost);
      setFeedPosts(prevPosts => [newPost, ...prevPosts]);
    };

    socket.on('newPost', handleNewPost);

    return () => {
      socket.off('newPost', handleNewPost);
    };
  }, [socket]);

  const handleMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentText((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const handleCommentSubmit = (postId) => {
    if (commentText[postId]?.trim()) {
      onComment(postId, commentText[postId]);
      setCommentText((prev) => ({
        ...prev,
        [postId]: '',
      }));
    }
  };

  const isPostOwner = (post) => {
    if (!user || !post) return false;
    return post.user._id === user._id;
  };

  const handleShareClick = (post) => {
    setSharePost(post);
    setShareOpen(true);
  };

  const handleImageClick = (url) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleReportPost = (post) => {
    setReportType('post');
    setReportTarget({ post });
    setReportDialogOpen(true);
  };

  const handleReportComment = (post, comment) => {
    setReportType('comment');
    setReportTarget({ post, comment });
    setReportDialogOpen(true);
  };

  const handleReportSubmit = async ({ reason, description }) => {
    try {
      const token = localStorage.getItem('token');
      if (reportType === 'post') {
        if (!reportTarget || !reportTarget.post || !reportTarget.post._id) {
          if (showSnackbar) showSnackbar('Error: No post selected for reporting.', 'error');
          setReportDialogOpen(false);
          setReportTarget(null);
          return;
        }
        await axios.post(`http://localhost:5000/api/posts/${reportTarget.post._id}/report`, { reason, description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (showSnackbar) showSnackbar('Post reported!', 'success');
      } else if (reportType === 'comment') {
        if (!reportTarget || !reportTarget.post || !reportTarget.comment || !reportTarget.post._id || !reportTarget.comment._id) {
          if (showSnackbar) showSnackbar('Error: No comment selected for reporting.', 'error');
          setReportDialogOpen(false);
          setReportTarget(null);
          return;
        }
        await axios.post(`http://localhost:5000/api/posts/${reportTarget.post._id}/comment/${reportTarget.comment._id}/report`, { reason, description }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (showSnackbar) showSnackbar('Comment reported!', 'success');
      }
    } catch (err) {
      console.error('Error reporting:', err);
      if (showSnackbar) showSnackbar('Failed to report.', 'error');
    }
    setReportDialogOpen(false);
    setReportTarget(null);
  };

  const handleReportClick = (post) => {
    handleMenuClose();
    setTimeout(() => {
      setReportType('post');
      setReportTarget({ post });
      setReportDialogOpen(true);
    }, 0);
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`, { state: { background: location } });
  };

  if (!feedPosts || feedPosts.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No posts to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {feedPosts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          onLike={onLike}
          onComment={onComment}
          onEdit={onEdit}
          onReport={onReport}
          onDelete={onDelete}
          onSave={onSave}
          savedPosts={savedPosts}
          showSnackbar={showSnackbar}
          handleShareClick={handleShareClick}
          onImageClick={handleImageClick}
          onReportComment={handleReportComment}
          onPostClick={handlePostClick}
        />
      ))}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onBlur={handleMenuClose}
      >
        {selectedPost && isPostOwner(selectedPost) ? (
          <>
            <MenuItem onClick={() => {
              onEdit(selectedPost);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Post</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              onDelete(selectedPost._id);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Post</ListItemText>
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => handleReportClick(selectedPost)}>
            <ListItemIcon>
              <FlagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Report Post</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} post={sharePost} />
      <ImagePreviewDialog open={previewOpen} onClose={() => setPreviewOpen(false)} imageUrl={previewUrl} />
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReportSubmit}
        type={reportType}
      />
    </Box>
  );
};

export default Feed;