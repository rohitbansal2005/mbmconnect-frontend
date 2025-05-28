import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress } from '@mui/material';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        setPost(null);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!post) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Post not found.</Typography></Box>;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>{post.content}</Typography>
      {post.mediaType === 'image' && post.media && (
        <img
          src={`http://localhost:5000/${post.media.replace(/^[/\\]+/, '').replace(/\\/g, '/')}`}
          alt="post"
          style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
        />
      )}
      {post.mediaType === 'video' && post.media && (
        <video
          src={`http://localhost:5000/${post.media.replace(/^[/\\]+/, '').replace(/\\/g, '/')}`}
          controls
          style={{ width: '100%', borderRadius: 8, marginBottom: 16 }}
        />
      )}
      {/* Aur bhi post details yahan dikhayein */}
    </Box>
  );
};

export default PostDetail;