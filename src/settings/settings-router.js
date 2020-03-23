// Router - settings
const { Router, json } = require('express');
const settingsRouter = Router();
const jsonBodyParser = json();
const path = require('path');

// Services
const SettingsService = require('./settings-service');

// Middleware
const { requireAuth } = require('../middleware/jwt-auth');

settingsRouter
  .route('/')
  .all(requireAuth)
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    SettingsService.getSettings(
      knexInst,
      req.user.id
    )
      .then(settings => {
        return (
          res.json(SettingsService.serializeSettings(settings))
        );
      })
      .catch(next)
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const knexInst = req.app.get('db');
    const { 
      nickname,
      hydration
    } = req.body;
    const settingsToUpdate = {};
    if ( nickname ) {
      settingsToUpdate.nickname = nickname;
    };
    if ( hydration !== undefined ) {
      settingsToUpdate.hydration = hydration;
    };
    SettingsService.updateSettings(
      knexInst,
      req.user.id,
      settingsToUpdate
    )
      .then(settings => {
        res
          .status(200)
          .location(path.posix.join(req.originalUrl))
          .json(SettingsService.serializeSettings(settingsToUpdate))
      })
      .catch(next);
    });

module.exports = settingsRouter;