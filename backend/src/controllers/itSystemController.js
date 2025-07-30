const { ITSystem, Contract, ProcessingActivity, Organization } = require('../models');
const { Op } = require('sequelize');

// Get all IT systems for an organization
const getAllITSystems = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { search, status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    
    // Build query conditions
    const whereConditions = { organizationId };
    
    if (search) {
      whereConditions[Op.or] = [
        { systemId: { [Op.iLike]: `%${search}%` } },
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { responsibleParty: { [Op.iLike]: `%${search}%` } },
        { vendor: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }

    // Get IT systems with pagination
    const { count, rows: itSystems } = await ITSystem.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Contract,
          as: 'contracts',
          attributes: ['id', 'contractId', 'vendorName'],
          through: { attributes: [] }
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      itSystems,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get all IT systems error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single IT system by ID
const getITSystemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const itSystem = await ITSystem.findOne({
      where: { id, organizationId },
      include: [
        {
          model: Contract,
          as: 'contracts',
          attributes: ['id', 'contractId', 'vendorName', 'startDate', 'endDate'],
          through: { attributes: [] }
        },
        {
          model: ProcessingActivity,
          as: 'processingActivities',
          attributes: ['id', 'activityId', 'description'],
          through: { attributes: [] }
        },
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!itSystem) {
      return res.status(404).json({ message: 'IT system not found' });
    }

    res.json({ itSystem });
  } catch (error) {
    console.error('Get IT system by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new IT system
const createITSystem = async (req, res) => {
  try {
    const { 
      systemId, 
      name, 
      description, 
      responsibleParty, 
      vendor, 
      version, 
      hostingType, 
      status, 
      dataClassification,
      contractIds 
    } = req.body;
    
    const { organizationId } = req.user;

    // Create IT system
    const itSystem = await ITSystem.create({
      systemId,
      name,
      description,
      responsibleParty,
      vendor,
      version,
      hostingType,
      status,
      dataClassification,
      organizationId
    });

    // Associate contracts if provided
    if (contractIds && contractIds.length > 0) {
      // Verify all contracts belong to the organization
      const contracts = await Contract.findAll({
        where: {
          id: { [Op.in]: contractIds },
          organizationId
        }
      });

      if (contracts.length !== contractIds.length) {
        return res.status(400).json({ 
          message: 'One or more contracts do not exist or do not belong to your organization' 
        });
      }

      await itSystem.setContracts(contractIds);
    }

    // Return the created IT system with associated contracts
    const createdITSystem = await ITSystem.findByPk(itSystem.id, {
      include: [
        {
          model: Contract,
          as: 'contracts',
          attributes: ['id', 'contractId', 'vendorName'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({ 
      message: 'IT system created successfully', 
      itSystem: createdITSystem 
    });
  } catch (error) {
    console.error('Create IT system error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an IT system
const updateITSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { 
      systemId, 
      name, 
      description, 
      responsibleParty, 
      vendor, 
      version, 
      hostingType, 
      status, 
      dataClassification,
      contractIds 
    } = req.body;

    // Find the IT system
    const itSystem = await ITSystem.findOne({
      where: { id, organizationId }
    });

    if (!itSystem) {
      return res.status(404).json({ message: 'IT system not found' });
    }

    // Update IT system fields
    await itSystem.update({
      systemId,
      name,
      description,
      responsibleParty,
      vendor,
      version,
      hostingType,
      status,
      dataClassification
    });

    // Update contract associations if provided
    if (contractIds) {
      // Verify all contracts belong to the organization
      const contracts = await Contract.findAll({
        where: {
          id: { [Op.in]: contractIds },
          organizationId
        }
      });

      if (contracts.length !== contractIds.length) {
        return res.status(400).json({ 
          message: 'One or more contracts do not exist or do not belong to your organization' 
        });
      }

      await itSystem.setContracts(contractIds);
    }

    // Return the updated IT system with associated contracts
    const updatedITSystem = await ITSystem.findByPk(itSystem.id, {
      include: [
        {
          model: Contract,
          as: 'contracts',
          attributes: ['id', 'contractId', 'vendorName'],
          through: { attributes: [] }
        }
      ]
    });

    res.json({ 
      message: 'IT system updated successfully', 
      itSystem: updatedITSystem 
    });
  } catch (error) {
    console.error('Update IT system error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an IT system
const deleteITSystem = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Find the IT system
    const itSystem = await ITSystem.findOne({
      where: { id, organizationId }
    });

    if (!itSystem) {
      return res.status(404).json({ message: 'IT system not found' });
    }

    // Remove associations with contracts and processing activities
    await itSystem.setContracts([]);
    await itSystem.setProcessingActivities([]);

    // Delete the IT system
    await itSystem.destroy();

    res.json({ message: 'IT system deleted successfully' });
  } catch (error) {
    console.error('Delete IT system error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllITSystems,
  getITSystemById,
  createITSystem,
  updateITSystem,
  deleteITSystem
}; 