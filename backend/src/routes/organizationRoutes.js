const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const organizationController = require('../controllers/organizationController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get organization details
router.get('/', organizationController.getOrganization);

// Update organization details
router.put(
  '/',
  [
    body('name').notEmpty().withMessage('Organization name is required'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    validate
  ],
  organizationController.updateOrganization
);

// Get organization users (admin only)
router.get('/users', isAdmin, organizationController.getOrganizationUsers);

// Update user role (admin only)
router.put(
  '/users/:userId/role',
  isAdmin,
  [
    body('role').isIn(['admin', 'user']).withMessage('Invalid role'),
    validate
  ],
  organizationController.updateUserRole
);

module.exports = router; 