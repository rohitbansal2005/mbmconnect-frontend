import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, MenuItem } from '@mui/material';

const allowedReasons = [
  'Spam',
  'Inappropriate Content',
  'Harassment',
  'Hate Speech',
  'Violence',
  'Other'
];

const ReportDialog = ({ open, onClose, onSubmit, type }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    onSubmit({ reason, description });
    setReason('');
    setDescription('');
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  const isValid = reason && description.trim().length >= 10 && description.trim().length <= 500;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Report {type === 'comment' ? 'Comment' : 'Post'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Please select a reason and provide a description (10-500 chars):
        </Typography>
        <TextField
          select
          label="Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          {allowedReasons.map(r => (
            <MenuItem key={r} value={r}>{r}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Description"
          multiline
          minRows={3}
          fullWidth
          value={description}
          onChange={e => setDescription(e.target.value)}
          helperText={`${description.length}/500`}
          inputProps={{ maxLength: 500 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!isValid}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog; 