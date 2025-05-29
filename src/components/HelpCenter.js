import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, CircularProgress, TextField, InputAdornment, Grid, Card, CardContent, Button, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import config from '../config';

const categories = [
  { id: 1, name: 'Account', icon: '👤' },
  { id: 2, name: 'Groups', icon: '👥' },
  { id: 3, name: 'Events', icon: '📅' },
  { id: 4, name: 'Support', icon: '🛠️' }
];

const HelpCenter = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    axios.get(`${config.backendUrl}/api/help-center/faqs`)
      .then(res => {
        setFaqs(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Filter FAQs by search and category
  const filteredFaqs = faqs.filter(faq =>
    (!selectedCategory || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(search.toLowerCase()) ||
     faq.answer.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess('');
    setFormError('');
    try {
      const res = await axios.post(`${config.backendUrl}/api/help-center/message`, form);
      setFormSuccess(res.data.msg);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to send message');
    }
    setFormLoading(false);
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
        Help Center
      </Typography>
      <TextField
        fullWidth
        placeholder="Search help articles..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}
      />

      {/* Category Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {categories.map(cat => (
          <Grid item xs={6} md={3} key={cat.id}>
            <Card
              onClick={() => setSelectedCategory(cat.name)}
              sx={{
                cursor: 'pointer',
                bgcolor: selectedCategory === cat.name ? 'primary.light' : 'background.paper',
                color: selectedCategory === cat.name ? 'primary.main' : 'text.primary',
                textAlign: 'center',
                p: 2,
                border: selectedCategory === cat.name ? '2px solid #1976d2' : '1px solid #eee',
                boxShadow: selectedCategory === cat.name ? 3 : 1,
                transition: 'all 0.2s'
              }}
            >
              <Typography variant="h3">{cat.icon}</Typography>
              <Typography variant="subtitle1">{cat.name}</Typography>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Typography
            variant="body2"
            sx={{ cursor: 'pointer', color: 'primary.main', mt: 1, textAlign: 'right' }}
            onClick={() => setSelectedCategory(null)}
          >
            {selectedCategory ? 'Show all topics' : ''}
          </Typography>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress />
      ) : (
        filteredFaqs.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            No help articles found.
          </Typography>
        ) : (
          filteredFaqs.map(faq => (
            <Paper key={faq.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">{faq.question}</Typography>
              <Typography variant="body2" color="text.secondary">{faq.answer}</Typography>
            </Paper>
          ))
        )
      )}

      {/* Message Box */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Contact Support / Ask a Question</Typography>
        {formSuccess && <Alert severity="success" sx={{ mb: 2 }}>{formSuccess}</Alert>}
        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
        <Box component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Your Name"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            required
          />
          <TextField
            label="Your Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleFormChange}
            required
          />
          <TextField
            label="Your Message"
            name="message"
            value={form.message}
            onChange={handleFormChange}
            required
            multiline
            minRows={3}
          />
          <Button type="submit" variant="contained" disabled={formLoading}>
            {formLoading ? 'Sending...' : 'Send Message'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default HelpCenter;