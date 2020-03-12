const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const AuthService = {

  // Get the user's information from the DB
  getUser: (db, user_name) => {
    return (
      db('users')
        .where({ user_name })
        .first()
    );
  },

  // Compare hashed password
  comparePasswords: (password, hash) => {
    return (
      bcrypt.compare(password, hash)
    );
  },

  // Create a JWT for the user
  createJwt: (subject, payload) => {
    return (
      jwt.sign(
        payload, 
        config.JWT_SECRET,
        {
          subject,
          algorithm: 'HS256'
        }
      )
    );
  },

  // Verify JWT token
  verifyJwt: (token) => {
    return (
      jwt.verify(
        token,
        config.JWT_SECRET,
        {
          algorithms: ['HS256']
        }
      )
    );
  },
  
  // Convert their token back into credentials
  parseBasicToken: (token) => {
    return (
      Buffer
        .from(token, 'base64')
        .toString()
        .split(':')
    );
  }

};

module.exports = AuthService;