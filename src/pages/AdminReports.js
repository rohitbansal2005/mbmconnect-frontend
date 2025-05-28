import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import { Close as CloseIcon, Check as CheckIcon, Block as BlockIcon } from '@mui/icons-material';
import axios from 'axios';

const AdminReports = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }

        const fetchReports = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reports`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Reports fetched:', response.data);
                setReports(response.data);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError(err.response?.data?.message || 'Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [user, token, navigate]);

    const handleOpenDialog = (report) => {
        setSelectedReport(report);
        setAdminNote(report.adminNotes || '');
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedReport(null);
        setAdminNote('');
    };

    const handleAction = async (action) => {
        if (!selectedReport) return;

        try {
            setActionLoading(true);
            setError(null);

            const response = await axios.patch(
                `${process.env.REACT_APP_API_URL}/api/reports/${selectedReport._id}`,
                {
                    status: action,
                    adminNotes: adminNote
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update the reports list
            setReports(reports.map(report => 
                report._id === selectedReport._id ? response.data : report
            ));

            handleCloseDialog();
        } catch (err) {
            console.error('Error updating report:', err);
            setError(err.response?.data?.message || 'Failed to update report');
        } finally {
            setActionLoading(false);
        }
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Reports
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Reporter</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reports.map((report) => (
                            <TableRow key={report._id}>
                                <TableCell>{report.reporter?.username || 'Unknown'}</TableCell>
                                <TableCell>{report.itemType}</TableCell>
                                <TableCell>{report.reason}</TableCell>
                                <TableCell>
                                    <Box sx={{ 
                                        color: report.status === 'Resolved' ? 'success.main' : 
                                               report.status === 'Rejected' ? 'error.main' : 
                                               'warning.main'
                                    }}>
                                        {report.status}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {report.status === 'Pending' && (
                                        <Box>
                                            <Tooltip title="Resolve">
                                                <IconButton 
                                                    color="success" 
                                                    onClick={() => handleOpenDialog(report)}
                                                    size="small"
                                                >
                                                    <CheckIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <IconButton 
                                                    color="error" 
                                                    onClick={() => handleOpenDialog(report)}
                                                    size="small"
                                                >
                                                    <BlockIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedReport?.status === 'Pending' ? 'Handle Report' : 'View Report'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Description:
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {selectedReport?.description}
                        </Typography>

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Admin Notes"
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            margin="normal"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    {selectedReport?.status === 'Pending' && (
                        <>
                            <Button 
                                onClick={() => handleAction('Resolved')}
                                color="success"
                                disabled={actionLoading}
                            >
                                Resolve
                            </Button>
                            <Button 
                                onClick={() => handleAction('Rejected')}
                                color="error"
                                disabled={actionLoading}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminReports;
