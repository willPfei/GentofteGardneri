const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const contractRoutes = require('./contractRoutes');
const itSystemRoutes = require('./itSystemRoutes');
const processingActivityRoutes = require('./processingActivityRoutes');
const organizationRoutes = require('./organizationRoutes');
const reportRoutes = require('./reportRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/contracts', contractRoutes);
router.use('/it-systems', itSystemRoutes);
router.use('/processing-activities', processingActivityRoutes);
router.use('/organization', organizationRoutes);
router.use('/reports', reportRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

module.exports = router; 