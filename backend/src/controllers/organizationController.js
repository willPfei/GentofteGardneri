const { Organization, User } = require('../models');

// Get organization details
const getOrganization = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const organization = await Organization.findByPk(organizationId, {
      attributes: { exclude: ['createdAt', 'updatedAt'] }
    });

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ organization });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update organization details
const updateOrganization = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { name, address, phone, email, website, industry, size } = req.body;

    const organization = await Organization.findByPk(organizationId);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Update organization fields
    await organization.update({
      name,
      address,
      phone,
      email,
      website,
      industry,
      size
    });

    res.json({ 
      message: 'Organization updated successfully', 
      organization 
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get organization users (admin only)
const getOrganizationUsers = async (req, res) => {
  try {
    const { organizationId } = req.user;

    const users = await User.findAll({
      where: { organizationId },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Get organization users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const { organizationId } = req.user;

    // Find the user
    const user = await User.findOne({
      where: { id: userId, organizationId },
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role
    await user.update({ role });

    res.json({ 
      message: 'User role updated successfully', 
      user 
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  getOrganizationUsers,
  updateUserRole
}; 