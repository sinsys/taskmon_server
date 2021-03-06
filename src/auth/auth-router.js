// Router - Authentication
const { Router, json } = require('express');
const authRouter = Router();
const jsonBodyParser = json();

// Services
const AuthService = require('./auth-service');

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {

    const { user_name, password } = req.body;
    const loginUser = { user_name, password };

    // Verifies both user_name and password exist
    for ( const [key, value] of Object.entries(loginUser) ) {
      if ( value == null ) {
        return (
          res
            .status(400)
            .json({
              error: `Missing '${key}' in request body`
            })
        );
      };
    };

    AuthService.getUser(
      req.app.get('db'),
      loginUser.user_name.toLowerCase()
    )
      .then(dbUser => {
        if ( !dbUser ) {
          return (
            res
              .status(400)
              .json({
                error: 'Incorrect username or password'
              })
          );
        };
        return (
          AuthService.comparePasswords(loginUser.password, dbUser.password)
            .then(compareMatch => {
              if ( !compareMatch ) {
                return (
                  res
                    .status(400)
                    .json({
                      error: 'Incorrect username or password'
                    })
                );
              };
              const sub = dbUser.user_name;
              const payload = { user_id: dbUser.id };
              res.send({
                authToken: AuthService.createJwt(sub, payload)
              });
            })
        );
      })
      .catch(next);
  });

module.exports = authRouter;