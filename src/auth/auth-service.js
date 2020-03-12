const AuthService = {

  // Get the user's information from the DB
  getUser: (db, name) => {
    return (
      db('users')
        .where({ name })
        .first()
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