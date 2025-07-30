const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const processingActivityController = require('../controllers/processingActivityController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all processing activities
router.get('/', processingActivityController.getAllProcessingActivities);

// Get a single processing activity by ID
router.get('/:id', processingActivityController.getProcessingActivityById);

// Create a new processing activity
router.post(
  '/',
  [
    body('activityId').notEmpty().withMessage('Activity ID is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('purpose').notEmpty().withMessage('Purpose is required'),
    body('dataTypes').isArray().withMessage('Data types must be an array'),
    body('legalBasis').notEmpty().withMessage('Legal basis is required'),
    body('riskLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid risk level'),
    body('status').optional().isIn(['active', 'inactive', 'under_review']).withMessage('Invalid status'),
    body('itSystemIds').optional().isArray().withMessage('IT system IDs must be an array'),
    validate
  ],
  processingActivityController.createProcessingActivity
);

// Update a processing activity
router.put(
  '/:id',
  [
    body('activityId').notEmpty().withMessage('Activity ID is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('purpose').notEmpty().withMessage('Purpose is required'),
    body('dataTypes').isArray().withMessage('Data types must be an array'),
    body('legalBasis').notEmpty().withMessage('Legal basis is required'),
    body('riskLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid risk level'),
    body('status').optional().isIn(['active', 'inactive', 'under_review']).withMessage('Invalid status'),
    body('itSystemIds').optional().isArray().withMessage('IT system IDs must be an array'),
    validate
  ],
  processingActivityController.updateProcessingActivity
);

// Delete a processing activity
router.delete('/:id', processingActivityController.deleteProcessingActivity);

module.exports = router; 