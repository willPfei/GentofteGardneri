const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const itSystemController = require('../controllers/itSystemController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all IT systems
router.get('/', itSystemController.getAllITSystems);

// Get a single IT system by ID
router.get('/:id', itSystemController.getITSystemById);

// Create a new IT system
router.post(
  '/',
  [
    body('systemId').notEmpty().withMessage('System ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('responsibleParty').optional().notEmpty().withMessage('Responsible party cannot be empty if provided'),
    body('hostingType').optional().isIn(['cloud', 'on-premise', 'hybrid']).withMessage('Invalid hosting type'),
    body('status').optional().isIn(['active', 'inactive', 'planned', 'retired']).withMessage('Invalid status'),
    body('dataClassification').optional().isIn(['public', 'internal', 'confidential', 'restricted']).withMessage('Invalid data classification'),
    body('contractIds').optional().isArray().withMessage('Contract IDs must be an array'),
    validate
  ],
  itSystemController.createITSystem
);

// Update an IT system
router.put(
  '/:id',
  [
    body('systemId').notEmpty().withMessage('System ID is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('responsibleParty').optional().notEmpty().withMessage('Responsible party cannot be empty if provided'),
    body('hostingType').optional().isIn(['cloud', 'on-premise', 'hybrid']).withMessage('Invalid hosting type'),
    body('status').optional().isIn(['active', 'inactive', 'planned', 'retired']).withMessage('Invalid status'),
    body('dataClassification').optional().isIn(['public', 'internal', 'confidential', 'restricted']).withMessage('Invalid data classification'),
    body('contractIds').optional().isArray().withMessage('Contract IDs must be an array'),
    validate
  ],
  itSystemController.updateITSystem
);

// Delete an IT system
router.delete('/:id', itSystemController.deleteITSystem);

module.exports = router; 