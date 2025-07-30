const { ProcessingActivity, ITSystem, Organization } = require('../models');
const { Op } = require('sequelize');

// Get all processing activities for an organization
const getAllProcessingActivities = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { search, status, riskLevel, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    
    // Build query conditions
    const whereConditions = { organizationId };
    
    if (search) {
      whereConditions[Op.or] = [
        { activityId: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { purpose: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }

    if (riskLevel) {
      whereConditions.riskLevel = riskLevel;
    }

    // Get processing activities with pagination
    const { count, rows: processingActivities } = await ProcessingActivity.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: ITSystem,
          as: 'itSystems',
          attributes: ['id', 'systemId', 'name'],
          through: { attributes: [] }
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      processingActivities,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get all processing activities error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single processing activity by ID
const getProcessingActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const processingActivity = await ProcessingActivity.findOne({
      where: { id, organizationId },
      include: [
        {
          model: ITSystem,
          as: 'itSystems',
          attributes: ['id', 'systemId', 'name'],
          through: { attributes: [] }
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!processingActivity) {
      return res.status(404).json({ message: 'Processing activity not found' });
    }

    res.json({ processingActivity });
  } catch (error) {
    console.error('Get processing activity by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new processing activity
const createProcessingActivity = async (req, res) => {
  try {
    const { 
      activityId, 
      description, 
      purpose, 
      dataSubjects, 
      dataTypes, 
      legalBasis, 
      retentionPeriod, 
      securityMeasures, 
      dataTransfers,
      riskLevel,
      status,
      itSystemIds 
    } = req.body;
    
    const { organizationId } = req.user;

    // Create processing activity
    const processingActivity = await ProcessingActivity.create({
      activityId,
      description,
      purpose,
      dataSubjects,
      dataTypes,
      legalBasis,
      retentionPeriod,
      securityMeasures,
      dataTransfers,
      riskLevel,
      status,
      organizationId
    });

    // Associate IT systems if provided
    if (itSystemIds && itSystemIds.length > 0) {
      // Verify all IT systems belong to the organization
      const itSystems = await ITSystem.findAll({
        where: {
          id: { [Op.in]: itSystemIds },
          organizationId
        }
      });

      if (itSystems.length !== itSystemIds.length) {
        return res.status(400).json({ 
          message: 'One or more IT systems do not exist or do not belong to your organization' 
        });
      }

      await processingActivity.setItSystems(itSystemIds);
    }

    // Return the created processing activity with associated IT systems
    const createdProcessingActivity = await ProcessingActivity.findByPk(processingActivity.id, {
      include: [
        {
          model: ITSystem,
          as: 'itSystems',
          attributes: ['id', 'systemId', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({ 
      message: 'Processing activity created successfully', 
      processingActivity: createdProcessingActivity 
    });
  } catch (error) {
    console.error('Create processing activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a processing activity
const updateProcessingActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { 
      activityId, 
      description, 
      purpose, 
      dataSubjects, 
      dataTypes, 
      legalBasis, 
      retentionPeriod, 
      securityMeasures, 
      dataTransfers,
      riskLevel,
      status,
      itSystemIds 
    } = req.body;

    // Find the processing activity
    const processingActivity = await ProcessingActivity.findOne({
      where: { id, organizationId }
    });

    if (!processingActivity) {
      return res.status(404).json({ message: 'Processing activity not found' });
    }

    // Update processing activity fields
    await processingActivity.update({
      activityId,
      description,
      purpose,
      dataSubjects,
      dataTypes,
      legalBasis,
      retentionPeriod,
      securityMeasures,
      dataTransfers,
      riskLevel,
      status
    });

    // Update IT system associations if provided
    if (itSystemIds) {
      // Verify all IT systems belong to the organization
      const itSystems = await ITSystem.findAll({
        where: {
          id: { [Op.in]: itSystemIds },
          organizationId
        }
      });

      if (itSystems.length !== itSystemIds.length) {
        return res.status(400).json({ 
          message: 'One or more IT systems do not exist or do not belong to your organization' 
        });
      }

      await processingActivity.setItSystems(itSystemIds);
    }

    // Return the updated processing activity with associated IT systems
    const updatedProcessingActivity = await ProcessingActivity.findByPk(processingActivity.id, {
      include: [
        {
          model: ITSystem,
          as: 'itSystems',
          attributes: ['id', 'systemId', 'name'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({ 
      message: 'Processing activity updated successfully', 
      processingActivity: updatedProcessingActivity 
    });
  } catch (error) {
    console.error('Update processing activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a processing activity
const deleteProcessingActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Find the processing activity
    const processingActivity = await ProcessingActivity.findOne({
      where: { id, organizationId }
    });

    if (!processingActivity) {
      return res.status(404).json({ message: 'Processing activity not found' });
    }

    // Remove associations with IT systems
    await processingActivity.setItSystems([]);

    // Delete the processing activity
    await processingActivity.destroy();

    res.json({ message: 'Processing activity deleted successfully' });
  } catch (error) {
    console.error('Delete processing activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllProcessingActivities,
  getProcessingActivityById,
  createProcessingActivity,
  updateProcessingActivity,
  deleteProcessingActivity
}; 