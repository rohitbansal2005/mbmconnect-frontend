import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Divider,
    Link,
    Stack,
    Avatar,
    IconButton,
    useScrollTrigger,
    Fade,
    Paper,
    TextField,
    Tooltip
} from '@mui/material';
import {
    People as PeopleIcon,
    Chat as ChatIcon,
    Share as ShareIcon,
    School as SchoolIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Work as WorkIcon,
    Groups as GroupsIcon,
    Notifications as NotificationsIcon,
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    LinkedIn as LinkedInIcon,
    Instagram as InstagramIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    KeyboardArrowDown as ScrollIcon,
    Event as EventIcon,
    Assignment as AssignmentIcon,
    Forum as ForumIcon,
    EmojiEvents as EmojiEventsIcon,
    Instagram
} from '@mui/icons-material';

const Landing = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [logoError, setLogoError] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [displayText, setDisplayText] = useState('');
    const fullText = 'Welcome to MBMConnect — College Social Network Platform';
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout;
        const animate = () => {
            if (isMobile) {
                // Simpler, faster animation for mobile
                if (!isDeleting && currentIndex < fullText.length) {
                    setDisplayText(fullText.slice(0, currentIndex + 1));
                    setCurrentIndex(prev => prev + 1);
                    timeout = setTimeout(animate, 5); // Much faster on mobile
                } else if (isDeleting && currentIndex > 0) {
                    setDisplayText(fullText.slice(0, currentIndex - 1));
                    setCurrentIndex(prev => prev - 1);
                    timeout = setTimeout(animate, 3); // Much faster on mobile
                } else {
                    setIsDeleting(!isDeleting);
                    timeout = setTimeout(animate, 200); // Shorter pause on mobile
                }
            } else {
                // Smoother animation for desktop
                if (!isDeleting && currentIndex < fullText.length) {
                    setDisplayText(fullText.slice(0, currentIndex + 1));
                    setCurrentIndex(prev => prev + 1);
                    timeout = setTimeout(animate, 15);
                } else if (isDeleting && currentIndex > 0) {
                    setDisplayText(fullText.slice(0, currentIndex - 1));
                    setCurrentIndex(prev => prev - 1);
                    timeout = setTimeout(animate, 8);
                } else {
                    setIsDeleting(!isDeleting);
                    timeout = setTimeout(animate, 300);
                }
            }
        };

        timeout = setTimeout(animate, isMobile ? 50 : 100);
        return () => clearTimeout(timeout);
    }, [currentIndex, isDeleting, isMobile]);

    // Optimize text rendering
    const displayTextMemo = React.useMemo(() => displayText, [displayText]);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const features = [
        {
            icon: <PeopleIcon sx={{ fontSize: 40 }} />,
            title: 'Connect with Classmates',
            description: 'Build meaningful connections with your peers and expand your college network'
        },
        {
            icon: <GroupsIcon sx={{ fontSize: 40 }} />,
            title: 'Join Student Groups',
            description: 'Discover and join clubs, organizations, and student groups that match your interests'
        },
        {
            icon: <ShareIcon sx={{ fontSize: 40 }} />,
            title: 'Share Your Journey',
            description: 'Share posts, photos, and ideas with your college community'
        },
        {
            icon: <NotificationsIcon sx={{ fontSize: 40 }} />,
            title: 'Campus Updates',
            description: 'Stay informed about events, deadlines, and important announcements'
        }
    ];

    const highlights = [
        {
            icon: <EventIcon sx={{ fontSize: 40 }} />,
            title: 'College Events',
            description: 'Stay updated with all college events, workshops, and seminars'
        },
        {
            icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
            title: 'Academic Resources',
            description: 'Access study materials, notes, and academic resources'
        },
        {
            icon: <ForumIcon sx={{ fontSize: 40 }} />,
            title: 'Discussion Forums',
            description: 'Engage in meaningful discussions with peers and faculty'
        },
        {
            icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
            title: 'Achievements',
            description: 'Share and celebrate your academic and extracurricular achievements'
        }
    ];

    // Update dark mode colors and text contrast
    const darkModeColors = {
        background: '#121212',
        surface: '#1e1e1e',
        card: '#2d2d2d',
        text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
            disabled: '#757575'
        },
        divider: 'rgba(255, 255, 255, 0.12)'
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bgcolor: darkMode ? darkModeColors.surface : 'white',
                    boxShadow: darkMode ? '0 0 0 1px rgba(255,255,255,.15), 0 2px 3px rgba(0,0,0,.3)' : '0 0 0 1px rgba(0,0,0,.15), 0 2px 3px rgba(0,0,0,.2)',
                    zIndex: 1000,
                    height: '72px',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Container maxWidth="lg" sx={{ height: '100%' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                component="img"
                                src={process.env.PUBLIC_URL + '/mbmlogo.png'}
                                alt="MBM Logo"
                                sx={{
                                    height: '40px',
                                    width: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    color: darkMode ? '#fff' : '#0a66c2',
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem'
                                }}
                            >
                                MBMConnect
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* Hide dark mode icon on mobile */}
                            <IconButton 
                                onClick={() => setDarkMode(!darkMode)}
                                sx={{ 
                                    color: darkMode ? '#fff' : '#0a66c2', 
                                    ml: { xs: 1, sm: 2 }, 
                                    order: { xs: 3, sm: 0 },
                                    display: { xs: 'none', sm: 'inline-flex' } // Hide on mobile
                                }}
                            >
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                            {/* Only show Join button on mobile */}
                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                sx={{
                                    bgcolor: darkMode ? '#fff' : '#0a66c2',
                                    color: darkMode ? '#000' : '#fff',
                                    '&:hover': { 
                                        bgcolor: darkMode ? '#e0e0e0' : '#004182'
                                    },
                                    borderRadius: '24px',
                                    textTransform: 'none',
                                    ml: { xs: 1, sm: 1 },
                                    fontSize: { xs: '0.75rem', sm: '1rem' },
                                    px: { xs: 1.5, sm: 3 },
                                    py: { xs: 0.3, sm: 1 },
                                    minWidth: { xs: '70px', sm: '120px' },
                                    height: { xs: '28px', sm: '40px' },
                                    position: { xs: 'relative', sm: 'static' },
                                    right: { xs: '-8px', sm: 0 },
                                    display: { xs: 'inline-flex', sm: 'inline-flex' }
                                }}
                            >
                                Join
                            </Button>
                            {/* Hide Sign in button on mobile */}
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/login')}
                                sx={{
                                    display: { xs: 'none', sm: 'inline-flex' },
                                    borderColor: darkMode ? '#fff' : '#0a66c2',
                                    color: darkMode ? '#fff' : '#0a66c2',
                                    '&:hover': {
                                        borderColor: darkMode ? '#fff' : '#004182',
                                        bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(10, 102, 194, 0.1)'
                                    },
                                    borderRadius: '24px',
                                    textTransform: 'none',
                                    ml: { xs: 0, sm: 1 }
                                }}
                            >
                                Sign in
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box
                sx={{
                    position: 'relative',
                    height: { xs: '100vh', md: '90vh' },
                    backgroundImage: `url(${process.env.PUBLIC_URL}/MBM.jpg)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1
                    }
                }}
            >
                <Container 
                    maxWidth="lg" 
                    sx={{ 
                        height: '100%',
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        pt: '60px'
                    }}
                >
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ color: 'white' }}>
                                <Typography
                                    variant="h2"
                                    component="h1"
                                    gutterBottom
                                    sx={{
                                        fontWeight: 'bold',
                                        fontSize: { xs: '1.5rem', sm: '2.7rem', md: '3.5rem' },
                                        color: 'white',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                        lineHeight: 1.08,
                                        maxWidth: { xs: '95vw', md: '650px' },
                                        minWidth: { xs: '220px', md: '600px' },
                                        textAlign: { xs: 'left', md: 'left' },
                                        wordBreak: 'break-word',
                                        whiteSpace: 'normal',
                                        letterSpacing: '-0.5px',
                                        mb: 2,
                                        mt: { xs: 7, sm: 0 },
                                        willChange: 'contents',
                                        backfaceVisibility: 'hidden',
                                        WebkitFontSmoothing: 'antialiased',
                                        transform: isMobile ? 'translateZ(0)' : 'none' // Force GPU acceleration only on mobile
                                    }}
                                >
                                    {displayText}
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{ 
                                        mb: 4, 
                                        opacity: 0.9,
                                        color: 'white',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Connect, share, and grow with your MBM community
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' } }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/register')}
                                        sx={{
                                            bgcolor: 'white',
                                            color: 'primary.main',
                                            '&:hover': {
                                                bgcolor: 'grey.100'
                                            },
                                            px: { xs: 2, sm: 4 },
                                            py: { xs: 1, sm: 1.5 },
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            borderRadius: '24px',
                                            width: { xs: '100%', sm: 'auto' },
                                            minWidth: { xs: '120px', sm: 'auto' },
                                            mb: { xs: 1, sm: 0 }
                                        }}
                                    >
                                        Get Started
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        onClick={() => scrollToSection('features')}
                                        sx={{
                                            borderColor: 'white',
                                            color: 'white',
                                            '&:hover': {
                                                borderColor: 'white',
                                                bgcolor: 'rgba(255, 255, 255, 0.1)'
                                            },
                                            px: { xs: 2, sm: 4 },
                                            py: { xs: 1, sm: 1.5 },
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            borderRadius: '24px',
                                            width: { xs: '100%', sm: 'auto' },
                                            minWidth: { xs: '120px', sm: 'auto' }
                                        }}
                                    >
                                        Explore Features
                                    </Button>
                                </Box>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center',
                                        mt: 4
                                    }}
                                >
                                    <IconButton
                                        onClick={() => scrollToSection('features')}
                                        sx={{
                                            color: 'white',
                                            animation: 'bounce 2s infinite',
                                            '@keyframes bounce': {
                                                '0%, 20%, 50%, 80%, 100%': {
                                                    transform: 'translateY(0)'
                                                },
                                                '40%': {
                                                    transform: 'translateY(-20px)'
                                                },
                                                '60%': {
                                                    transform: 'translateY(-10px)'
                                                }
                                            }
                                        }}
                                    >
                                        <ScrollIcon sx={{ fontSize: 40 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Features Section */}
            <Box 
                id="features"
                sx={{ 
                    bgcolor: darkMode ? darkModeColors.background : '#f3f2ef',
                    py: 8,
                    color: darkMode ? darkModeColors.text.primary : 'inherit'
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        component="h2"
                        align="center"
                        gutterBottom
                        sx={{ 
                            mb: 6,
                            color: darkMode ? darkModeColors.text.primary : '#1a1a1a'
                        }}
                    >
                        Why Choose MBMConnect?
                    </Typography>
                    <Grid container spacing={4}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'transform 0.2s',
                                        bgcolor: darkMode ? darkModeColors.card : 'white',
                                        '&:hover': {
                                            transform: 'translateY(-8px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                                        <Box
                                            sx={{
                                                color: darkMode ? '#90caf9' : '#0a66c2',
                                                mb: 2
                                            }}
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography
                                            variant="h5"
                                            component="h3"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                color: darkMode ? darkModeColors.text.primary : '#1a1a1a'
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                color: darkMode ? darkModeColors.text.secondary : '#444'
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Highlights Section */}
            <Box 
                sx={{ 
                    bgcolor: darkMode ? darkModeColors.background : '#f3f2ef',
                    py: 8,
                    color: darkMode ? darkModeColors.text.primary : 'inherit'
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        component="h2"
                        align="center"
                        gutterBottom
                        sx={{ 
                            mb: 6,
                            color: darkMode ? darkModeColors.text.primary : '#1a1a1a'
                        }}
                    >
                        Campus Life at Your Fingertips
                    </Typography>
                    <Grid container spacing={4}>
                        {highlights.map((highlight, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        bgcolor: darkMode ? darkModeColors.card : 'white',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            color: '#0a66c2',
                                            mb: 2
                                        }}
                                    >
                                        {highlight.icon}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 600,
                                            color: darkMode ? darkModeColors.text.primary : '#1a1a1a'
                                        }}
                                    >
                                        {highlight.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: darkMode ? darkModeColors.text.secondary : '#444'
                                        }}
                                    >
                                        {highlight.description}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Mockup Section */}
            <Box 
                sx={{ 
                    bgcolor: darkMode ? darkModeColors.background : '#f3f2ef',
                    py: 8,
                    color: darkMode ? darkModeColors.text.primary : 'inherit'
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h3"
                                component="h2"
                                gutterBottom
                                sx={{ 
                                    mb: 3,
                                    color: darkMode ? darkModeColors.text.primary : '#1a1a1a'
                                }}
                            >
                                Your Personalized Student Feed
                            </Typography>
                            <Typography
                                variant="body1"
                                paragraph
                                sx={{ color: darkMode ? darkModeColors.text.secondary : '#444', mb: 2 }}
                            >
                                Stay connected with your college community through a personalized feed that shows relevant updates, events, and opportunities.
                            </Typography>
                            <Typography
                                variant="body1"
                                paragraph
                                sx={{ color: darkMode ? darkModeColors.text.secondary : '#444', mb: 2 }}
                            >
                                Find trending topics, join discussions, and never miss important announcements from your college.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#fff',
                                    borderRadius: '20px',
                                    border: '2px solid #0a66c2',
                                    p: 2,
                                    minHeight: 320,
                                    maxHeight: 400,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <Box
                                    component="img"
                                    src={process.env.PUBLIC_URL + '/mbmlogo.png'}
                                    alt="MBMConnect Feed"
                                    sx={{
                                        width: '100%',
                                        height: 'auto',
                                        maxHeight: 320,
                                        objectFit: 'contain',
                                        display: 'block',
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* App Preview Section */}
            <Box 
                sx={{ 
                    bgcolor: darkMode ? darkModeColors.background : '#f3f2ef',
                    py: 8,
                    color: darkMode ? darkModeColors.text.primary : 'inherit',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h3"
                                component="h2"
                                gutterBottom
                                sx={{ 
                                    mb: 3,
                                    color: darkMode ? darkModeColors.text.primary : '#1a1a1a',
                                    fontWeight: 600
                                }}
                            >
                                Get the MBMConnect App
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{ 
                                    mb: 3,
                                    color: darkMode ? darkModeColors.text.secondary : '#444',
                                    fontWeight: 400
                                }}
                            >
                                Stay connected with your college community on the go. Download our mobile app for the best experience.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<img src={process.env.PUBLIC_URL + '/mbmlogo.png'} alt="MBMConnect" style={{ height: '24px' }} />}
                                    onClick={() => window.open('https://drive.google.com/file/d/1-2YwXwXwXwXwXwXwXwXwXwXwXwXwXwXw/view?usp=sharing', '_blank')}
                                    sx={{
                                        bgcolor: '#0a66c2',
                                        '&:hover': { bgcolor: '#004182' },
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontSize: '1.1rem',
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        '&:hover': {
                                            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
                                            transform: 'translateY(-2px)',
                                            transition: 'all 0.3s ease'
                                        }
                                    }}
                                >
                                    Download APK
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => window.open('https://drive.google.com/file/d/1-2YwXwXwXwXwXwXwXwXwXwXwXwXwXwXw/view?usp=sharing', '_blank')}
                                    sx={{
                                        borderColor: '#0a66c2',
                                        color: '#0a66c2',
                                        '&:hover': { 
                                            borderColor: '#004182',
                                            bgcolor: 'rgba(10, 102, 194, 0.1)'
                                        },
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '12px',
                                        textTransform: 'none',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    View on Drive
                                </Button>
                            </Box>
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="body2" sx={{ color: darkMode ? darkModeColors.text.secondary : '#666' }}>
                                    Version 1.0.0 • 15MB • Android 6.0+
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    perspective: '1000px'
                                }}
                            >
                                {/* Phone Frame */}
                                <Box
                                    sx={{
                                        width: { xs: '280px', sm: '320px' },
                                        height: { xs: '560px', sm: '640px' },
                                        bgcolor: '#1a1a1a',
                                        borderRadius: '40px',
                                        position: 'relative',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                        transform: 'rotateY(-15deg)',
                                        transition: 'transform 0.3s ease',
                                        '&:hover': {
                                            transform: 'rotateY(-5deg)'
                                        },
                                        animation: 'phoneFloat 3s ease-in-out infinite',
                                        '@keyframes phoneFloat': {
                                            '0%, 100%': { transform: 'translateY(0) rotateY(-15deg)' },
                                            '50%': { transform: 'translateY(-18px) rotateY(-15deg)' }
                                        }
                                    }}
                                >
                                    {/* Screen */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '10px',
                                            left: '10px',
                                            right: '10px',
                                            bottom: '10px',
                                            bgcolor: '#fff',
                                            borderRadius: '30px',
                                            overflow: 'hidden',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                                        }}
                                    >
                                        {/* App Content */}
                                        <Box
                                            sx={{
                                                height: '100%',
                                                background: `url(${process.env.PUBLIC_URL}/mbmconnect.png)`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                position: 'relative',
                                                opacity: 0,
                                                animation: 'screenFadeIn 1.2s 0.5s forwards',
                                                '@keyframes screenFadeIn': {
                                                    from: { opacity: 0, filter: 'blur(8px)' },
                                                    to: { opacity: 1, filter: 'blur(0)' }
                                                }
                                            }}
                                        >
                                            {/* Notch */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: '150px',
                                                    height: '30px',
                                                    bgcolor: '#1a1a1a',
                                                    borderBottomLeftRadius: '15px',
                                                    borderBottomRightRadius: '15px'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                {/* Decorative Elements */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        background: 'radial-gradient(circle at center, rgba(10, 102, 194, 0.1) 0%, transparent 70%)',
                                        zIndex: -1
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Final CTA Section */}
            <Box 
                sx={{ 
                    bgcolor: darkMode ? darkModeColors.background : '#f3f2ef',
                    py: 8,
                    color: darkMode ? darkModeColors.text.primary : 'inherit'
                }}
            >
                <Container maxWidth="md">
                    <Box 
                        sx={{ 
                            textAlign: 'center',
                            bgcolor: darkMode ? darkModeColors.card : 'white',
                            p: 6,
                            borderRadius: '20px',
                            boxShadow: darkMode ? '0 4px 6px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Typography
                            variant="h3"
                            sx={{
                                mb: 2,
                                color: darkMode ? darkModeColors.text.primary : '#1a1a1a',
                                fontWeight: 600
                            }}
                        >
                            Ready to join your college's ultimate network?
                        </Typography>
                        <Typography
                            variant="h6"
                            sx={{ 
                                mb: 4, 
                                color: darkMode ? darkModeColors.text.secondary : 'text.secondary'
                            }}
                        >
                            Join thousands of students already connected on MBMConnect
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/register')}
                            sx={{
                                bgcolor: '#0a66c2',
                                '&:hover': { bgcolor: '#004182' },
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                borderRadius: '24px'
                            }}
                        >
                            Sign Up Free Today
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* Footer */}
            <Box 
                sx={{ 
                    bgcolor: darkMode ? darkModeColors.background : 'white',
                    py: 6,
                    borderTop: darkMode ? `1px solid ${darkModeColors.divider}` : '1px solid rgba(0,0,0,.15)',
                    color: 'inherit'
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ mb: 3 }}>
                                <Box
                                    component="img"
                                    src={process.env.PUBLIC_URL + '/mbmlogo.png'}
                                    alt="MBM Logo"
                                    sx={{
                                        height: '40px',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        mb: 2
                                    }}
                                />
                                <Typography variant="body2" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} paragraph>
                                    MBMConnect is the official social platform for MBM University Jodhpur, connecting students, alumni, and faculty.
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                    <Link href="#" sx={{ color: darkMode ? darkModeColors.text.primary : '#0a66c2' }}>
                                        <FacebookIcon />
                                    </Link>
                                    <Link href="https://x.com/mbm_connect" sx={{ color: darkMode ? darkModeColors.text.primary : '#0a66c2' }}>
                                        <TwitterIcon />
                                    </Link>
                                    <Link href="https://www.linkedin.com/company/mbmconnect" sx={{ color: darkMode ? darkModeColors.text.primary : '#0a66c2' }}>
                                        <LinkedInIcon />
                                    </Link>
                                    <Link href="https://instagram.com/YOUR_INSTAGRAM_USERNAME" target="_blank" rel="noopener noreferrer" sx={{ color: darkMode ? darkModeColors.text.primary : '#0a66c2' }}>
                                        <InstagramIcon />
                                    </Link>
                                </Stack>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: darkMode ? darkModeColors.text.primary : '#1a1a1a' }}>
                                About
                            </Typography>
                            <Stack spacing={1}>
                                <Link 
                                    href="#" 
                                    sx={{ 
                                        color: darkMode ? darkModeColors.text.secondary : '#444',
                                        '&:hover': {
                                            color: darkMode ? darkModeColors.text.primary : 'primary.main'
                                        }
                                    }} 
                                    underline="hover"
                                >
                                    About Us
                                </Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Careers</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Press</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Blog</Link>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: darkMode ? darkModeColors.text.primary : '#1a1a1a' }}>
                                Community
                            </Typography>
                            <Stack spacing={1}>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Students</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Alumni</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Faculty</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Events</Link>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: darkMode ? darkModeColors.text.primary : '#1a1a1a' }}>
                                Support
                            </Typography>
                            <Stack spacing={1}>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Help Center</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Safety Center</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Community Guidelines</Link>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: darkMode ? darkModeColors.text.primary : '#1a1a1a' }}>
                                Legal
                            </Typography>
                            <Stack spacing={1}>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Privacy Policy</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Terms of Service</Link>
                                <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover">Cookie Policy</Link>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 4 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }}>
                            © 2025 MBMConnect. All rights reserved.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover" variant="body2">
                                Privacy Policy
                            </Link>
                            <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover" variant="body2">
                                Terms of Service
                            </Link>
                            <Link href="#" sx={{ color: darkMode ? darkModeColors.text.secondary : '#444' }} underline="hover" variant="body2">
                                Cookie Policy
                            </Link>
                        </Box>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default Landing; 