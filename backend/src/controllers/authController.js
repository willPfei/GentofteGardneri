const jwt = require('jsonwebtoken');
const { User, Organization } = require('../models');
const { Op } = require('sequelize');

// Register a new user
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, organizationName, organizationId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let userOrganizationId;

    // If organizationId is provided, use it
    if (organizationId) {
      const organization = await Organization.findByPk(organizationId);
      if (!organization) {
        return res.status(404).json({ message: 'Organization not found' });
      }
      userOrganizationId = organizationId;
    } 
    // If organizationName is provided, create a new organization
    else if (organizationName) {
      const newOrganization = await Organization.create({
        name: organizationName,
      });
      userOrganizationId = newOrganization.id;
    } else {
      return res.status(400).json({ message: 'Either organizationId or organizationName is required' });
    }

    // Check if this is the first user in the organization
    const existingOrgUsers = await User.count({ where: { organizationId: userOrganizationId } });
    const role = existingOrgUsers === 0 ? 'admin' : 'user';

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      organizationId: userOrganizationId,
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
}; 