const { Vendor, ITSystem, Organization } = require('../models');
const { Op } = require('sequelize');

// Get all vendors for an organization
const getAllVendors = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { search, status, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    
    // Build query conditions
    const whereConditions = { organizationId };
    
    if (search) {
      whereConditions[Op.or] = [
        { vendorId: { [Op.iLike]: `%${search}%` } },
        { vendorName: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) {
      whereConditions.status = status;
    }

    // Get vendors with pagination
    const { count, rows: vendors } = await Vendor.findAndCountAll({
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
      vendors,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Get all vendors error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single vendor by ID
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    const vendor = await Vendor.findOne({
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

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error('Get vendor by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new vendor
const createVendor = async (req, res) => {
  try {
    const { 
      vendorId, 
      vendorName, 
      startDate, 
      endDate, 
      description, 
      value, 
      currency, 
      status, 
      documentUrl,
      itSystemIds 
    } = req.body;
    
    const { organizationId } = req.user;

    // Create vendor
    const vendor = await Vendor.create({
      vendorId,
      vendorName,
      startDate,
      endDate,
      description,
      value,
      currency,
      status,
      documentUrl,
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

      await vendor.setItSystems(itSystemIds);
    }

    // Return the created vendor with associated IT systems
    const createdVendor = await Vendor.findByPk(vendor.id, {
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
      message: 'Vendor created successfully', 
      vendor: createdVendor 
    });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a vendor
const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;
    const { 
      vendorId, 
      vendorName, 
      startDate, 
      endDate, 
      description, 
      value, 
      currency, 
      status, 
      documentUrl,
      itSystemIds 
    } = req.body;

    // Find the vendor
    const vendor = await Vendor.findOne({
      where: { id, organizationId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Update vendor fields
    await vendor.update({
      vendorId,
      vendorName,
      startDate,
      endDate,
      description,
      value,
      currency,
      status,
      documentUrl
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

      await vendor.setItSystems(itSystemIds);
    }

    // Return the updated vendor with associated IT systems
    const updatedVendor = await Vendor.findByPk(vendor.id, {
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
      message: 'Vendor updated successfully', 
      vendor: updatedVendor 
    });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a vendor
const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { organizationId } = req.user;

    // Find the vendor
    const vendor = await Vendor.findOne({
      where: { id, organizationId }
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Remove associations with IT systems
    await vendor.setItSystems([]);

    // Delete the vendor
    await vendor.destroy();

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
}; 