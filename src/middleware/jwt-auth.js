// Middleware - JWT Authentication
const AuthService = require('../auth/auth-service');

requireAuth = (req, res, next) => {
  const authToken = req.get('Authorization') || '';
  let bearerToken;

  if ( !authToken.toLowerCase().startsWith('bearer ')) {
    return (
      res
        .status(401)
        .json({
          error: `Missing bearer token`
        })
    );
  } else {
    // We slice off the 'bearer ' portion of the token
    bearerToken = authToken.slice(7, authToken.length)
  };

  try {
    const payload = AuthService.verifyJwt(bearerToken);
    AuthService.getUser(
      req.app.get('db'),
      payload.sub
    )
      .then(user => {
        if ( !user ) {
          return (
            res
              .status(401)
              .json({
                error: `Unauthorized request`
              })
          );
        };
        req.user = user;
        next();
      })
      .catch(err => {
        console.error(err);
        next(err);
      });
  } catch(error) {
    return (
      res
        .status(401)
        .json({
          error: `Unauthorized request`
        })
    );
  };
};

module.exports = {
  requireAuth
};