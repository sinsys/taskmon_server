const { Router, json } = require('express');
const usersRouter = Router();
const jsonBodyParser = json();
const path = require('path');

const UsersService = require('./users-service');
const SettingsService = require('../settings/settings-service');

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {

    const { 
      password, 
      user_name,
      nickname
    } = req.body;

    for ( const field of ['user_name', 'password', 'nickname']) {
      if ( !req.body[field]) {
        return (
          res
            .status(400)
            .json({
              error: `Missing '${field}' in request body`
            })
        );
      };
    };

    const passwordError = UsersService.validatePassword(password);
    if ( passwordError ) {
      return (
        res
          .status(400)
          .json({
            error: passwordError
          })
      );
    }

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      user_name.toLowerCase()
    )
      .then(hasUserWithUserName => {
        if( hasUserWithUserName ) {
          return (
            res
              .status(400)
              .json({
                error: `Username already taken`
              })
          );
        };

        return (
          UsersService.hashPassword(password)
            .then(hashedPassword => {

              const newUser = {
                user_name: user_name.toLowerCase(),
                password: hashedPassword,
                date_created: 'now()'
              };

              UsersService.insertUser(
                req.app.get('db'),
                newUser
              )
                .then(user => {
                  const newSettings = {
                    user_id: user.id,
                    nickname: nickname
                  };
                  SettingsService.addSettings(
                    req.app.get('db'),
                    newSettings
                  )
                    .then(() => {
                      res
                      .status(201)
                      .location(path.posix.join(req.originalUrl, `/${user.id}`))
                      .json(UsersService.serializeUser(user));
                    })
                });
            })
        );
      })
      .catch(next);
  });

module.exports = usersRouter;