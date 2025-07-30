const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const contractController = require('../controllers/contractController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const vendorController = require('../controllers/vendorController');

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all contracts
router.get('/', contractController.getAllContracts);

// Get a single contract by ID
router.get('/:id', contractController.getContractById);

// Create a new contract
router.post(
  '/',
  [
    body('contractId').notEmpty().withMessage('Contract ID is required'),
    body('vendorName').notEmpty().withMessage('Vendor name is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date'),
    body('value').optional({ nullable: true }).isNumeric().withMessage('Value must be a number'),
    body('status').optional().isIn(['active', 'expired', 'terminated', 'draft']).withMessage('Invalid status'),
    body('itSystemIds').optional().isArray().withMessage('IT system IDs must be an array'),
    validate
  ],
  contractController.createContract
);

// Update a contract
router.put(
  '/:id',
  [
    body('contractId').notEmpty().withMessage('Contract ID is required'),
    body('vendorName').notEmpty().withMessage('Vendor name is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date'),
    body('value').optional({ nullable: true }).isNumeric().withMessage('Value must be a number'),
    body('status').optional().isIn(['active', 'expired', 'terminated', 'draft']).withMessage('Invalid status'),
    body('itSystemIds').optional().isArray().withMessage('IT system IDs must be an array'),
    validate
  ],
  contractController.updateContract
);

// Delete a contract
router.delete('/:id', contractController.deleteContract);

// Get all vendors
router.get('/vendors', vendorController.getAllVendors);

// Get a single vendor by ID
router.get('/vendors/:id', vendorController.getVendorById);

// Create a new vendor
router.post(
  '/vendors',
  [
    body('vendorId').notEmpty().withMessage('Vendor ID is required'),
    body('vendorName').notEmpty().withMessage('Vendor name is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date'),
    body('value').optional({ nullable: true }).isNumeric().withMessage('Value must be a number'),
    body('status').optional().isIn(['active', 'expired', 'terminated', 'draft']).withMessage('Invalid status'),
    body('itSystemIds').optional().isArray().withMessage('IT system IDs must be an array'),
    validate
  ],
  vendorController.createVendor
);

// Update a vendor
router.put(
  '/vendors/:id',
  [
    body('vendorId').notEmpty().withMessage('Vendor ID is required'),
    body('vendorName').notEmpty().withMessage('Vendor name is required'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date'),
    body('value').optional({ nullable: true }).isNumeric().withMessage('Value must be a number'),
    body('status').optional().isIn(['active', 'expired', 'terminated', 'draft']).withMessage('Invalid status'),
    body('itSystemIds').optional().isArray().withMessage('IT system IDs must be an array'),
    validate
  ],
  vendorController.updateVendor
);

// Delete a vendor
router.delete('/vendors/:id', vendorController.deleteVendor);

module.exports = router; 