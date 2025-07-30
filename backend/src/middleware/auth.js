const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to authenticate JWT tokens
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

// Middleware to check if user belongs to the same organization
const isSameOrganization = (req, res, next) => {
  const organizationId = req.params.organizationId || req.body.organizationId;
  
  if (!organizationId) {
    return res.status(400).json({ message: 'Organization ID is required' });
  }

  if (req.user.organizationId === organizationId || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: You can only access data from your organization' });
  }
};

module.exports = {
  authenticate,
  isAdmin,
  isSameOrganization
}; 