const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Generate GDPR Article 30 compliant report
router.get('/article30', reportController.generateArticle30Report);

module.exports = router; 