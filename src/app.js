// Main express root
const express = require('express');
const app = express();

// Configuration
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const morganOpt = 
(NODE_ENV === 'production') ? 'tiny' : 'common';

// Middleware
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');


// Routers
const projectsRouter = require('./projects/projects-router');
const tasksRouter = require('./tasks/tasks-router');
const authRouter = require('./auth/auth-router');
const settingsRouter = require('./settings/settings-router');
const usersRouter = require('./users/users-router');

// Initialize middleware
app.use(
  morgan(
    morganOpt,
    { skip: () => NODE_ENV === 'test' }
  ),
  cors({
    origin: CLIENT_ORIGIN
  }),
  helmet()
);

// Basic root path to ensure server is running
app.get('/', (req, res) => {
  res
    .status(200)
    .send('Server is up');
});


// Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/users', usersRouter);

errorHandler = (err, req, res, next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = { 
      error: { 
        message: 'server error' 
      }
    };
  } else {
    console.error(err);
    response = {
      message: err.message, err
    };
  }
  res.status(500).json(response)
};

app.use(errorHandler);

module.exports = app;