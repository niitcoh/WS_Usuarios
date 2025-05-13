const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = {
  generateToken: (userId, email, rol) => {
    return jwt.sign(
      { id: userId, email, rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  },
  
  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
};
