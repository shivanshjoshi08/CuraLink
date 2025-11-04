const jwt = require('jsonwebtoken');
const User = require('../models/User'); // We need the User model
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- THIS IS THE MONGOOSE WAY ---
    // Get the user from the ID in the token and attach it to the request.
    // We 'select(-password)' to ensure the password hash is never part of req.user
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
       return res.status(401).json({ message: 'User not found' });
    }

    next();

  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;