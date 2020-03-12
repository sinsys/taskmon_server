const bcrypt = require('bcryptjs');

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