const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const app = express();
const projectsRouter = require('./projects/projects-router');
const tasksRouter = require('./tasks/tasks-router');
const authRouter = require('./auth/auth-router');

const morganOpt = 
(NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(
  morgan(
    morganOpt,
    { skip: () => NODE_ENV === 'test' }
  ),
  cors(),
  helmet()
);

app.get('/', (req, res) => {
  res
    .status(200)
    .send('Server is up');
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/tasks', tasksRouter);

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