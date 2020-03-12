const { Router, json } = require('express');
const path = require('path');
const TasksService = require('./tasks-service');
const { requireAuth } = require('../middleware/jwt-auth');

const jsonBodyParser = json();

const tasksRouter = Router();

tasksRouter
  .route('/')
  .all(requireAuth)
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    TasksService.getTasks(knexInst, req.user.id)
      .then(tasks => {
        let serializedTasks = tasks.map(task => {
          return (
            TasksService.serializeTask(task)
          );
        });
        return (
          res.json(serializedTasks)
        );
      })
      .catch(next)
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { title, content, date_due } = req.body;
    const newTask = { title, date_due };

    for (const [key, value] of Object.entries(newTask))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    if ( content ) {
      newTask.content = req.body.content;
    };

    newTask.user_id = req.user.id;
    TasksService.addTask(
      req.app.get('db'),
      newTask,
      req.user.id
    )
      .then(task => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${task.id}`))
          .json(TasksService.serializeTask(task))
      })
      .catch(next)
    });

tasksRouter
  .route('/:id')
  .all(requireAuth)
  .all(checkTaskExists)
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    TasksService.getTaskById(
      knexInst, 
      req.params.id, 
      req.user.id
    )
      .then(task => {
        return (
          res.json(TasksService.serializeTask(task))
        );
      })
      .catch(next)
  })
  .delete( (req, res, next) => {
    const knexInst = req.app.get('db');
    TasksService.deleteTask(
        knexInst,
        req.params.id
      )
      .then(() => {
        return (
          res
            .status(204)
            .end()
        );
      })
      .catch(next);      
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const knexInst = req.app.get('db');
    const { 
      title,
      content,
      date_due
    } = req.body;
    const taskToUpdate = { 
      title,
      date_due,
      date_modified: new Date()
    };
    for (const [key, value] of Object.entries(taskToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    if ( content ) {
      taskToUpdate.content = content;
    };

    TasksService.updateTask(
      knexInst,
      req.params.id,
      taskToUpdate
    )
      .then(task => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${task.id}`))
          .json(TasksService.serializeTask(task))
      })
      .catch(next);
    });

/* async/await syntax for promises */
async function checkTaskExists(req, res, next) {
  const knexInst = req.app.get('db');
  try {
    const task = await TasksService.getTaskById(
      knexInst,
      req.params.id,
      req.user.id
    );

    if (!task)
      return res.status(404).json({
        error: `Task doesn't exist`
      })
    res.task = task;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = tasksRouter;