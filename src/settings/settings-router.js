const { Router, json } = require('express');
const path = require('path')
const SettingsService = require('./settings-service');
const { requireAuth } = require('../middleware/jwt-auth');

const jsonBodyParser = json();

const settingsRouter = Router();

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
    const settingsToUpdate = {
      nickname,
      hydration
    };
    for (const [key, value] of Object.entries(settingsToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    SettingsService.updateSettings(
      knexInst,
      req.user.id,
      settingsToUpdate
    )
      .then(settings => {
        res
          .status(200)
          .location(path.posix.join(req.originalUrl))
          .json(SettingsService.serializeSettings(settings))
      })
      .catch(next);
    });

module.exports = settingsRouter;