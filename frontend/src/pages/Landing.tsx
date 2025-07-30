import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon,
} from '@mui/icons-material';

const Landing: React.FC = () => {
  const features = [
    {
      icon: <SecurityIcon fontSize="large" color="primary" />,
      title: 'Secure & Compliant',
      description:
        'Keep your data processing activities secure and compliant with GDPR requirements. Our platform ensures proper documentation and data isolation.',
    },
    {
      icon: <SpeedIcon fontSize="large" color="primary" />,
      title: 'Efficient Management',
      description:
        'Streamline your records management with our intuitive interface. Easily track contracts, IT systems, and processing activities in one place.',
    },
    {
      icon: <DevicesIcon fontSize="large" color="primary" />,
      title: 'Responsive Design',
      description:
        'Access your records from any device with our responsive design. Our platform works seamlessly on desktops, tablets, and mobile devices.',
    },
  ];

  return (
    <Box>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RoPA Platform
          </Typography>
          <Button color="primary" component={RouterLink} to="/login">
            Login
          </Button>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/register"
            sx={{ ml: 2 }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            gutterBottom
          >
            Records of Processing Activities
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            A comprehensive platform for managing your organization's data processing activities,
            contracts, and IT systems in compliance with GDPR requirements.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/register"
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              component={RouterLink}
              to="/login"
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: 8 }} maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ my: 2 }}>{feature.icon}</Box>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography>{feature.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          RoPA Platform
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Simplifying GDPR compliance for organizations of all sizes
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' RoPA Platform. All rights reserved.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default Landing; 