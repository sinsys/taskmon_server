const { Router, json } = require('express');
const path = require('path')
const ProjectsService = require('./projects-service');
const { requireAuth } = require('../middleware/basic-auth');

const jsonBodyParser = json();

const projectsRouter = Router();

projectsRouter
  .route('/')
  .all(requireAuth)
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    ProjectsService.getProjects(knexInst, req.user.id)
      .then(projects => {
        let serializedProjects = projects.map(project => {
          return (
            ProjectsService.serializeProject(project)
          );
        });
        return (
          res.json(serializedProjects)
        );
      })
      .catch(next)
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { title, content, date_due } = req.body;
    const newProject = { title, date_due };

    for (const [key, value] of Object.entries(newProject))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    if ( content ) {
      newProject.content = req.body.content;
    };

    newProject.user_id = req.user.id;
    ProjectsService.addProject(
      req.app.get('db'),
      newProject,
      req.user.id
    )
      .then(project => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${project.id}`))
          .json(ProjectsService.serializeProject(project))
      })
      .catch(next)
    });

projectsRouter
  .route('/:id')
  .all(requireAuth)
  .all(checkProjectExists)
  .get( (req, res, next) => {
    const knexInst = req.app.get('db');
    ProjectsService.getProjectById(
      knexInst, 
      req.params.id, 
      req.user.id
    )
      .then(project => {
        return (
          res.json(ProjectsService.serializeProject(project))
        );
      })
      .catch(next)
  })
  .delete( (req, res, next) => {
    const knexInst = req.app.get('db');
    ProjectsService.deleteProject(
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
    const projectToUpdate = { 
      title,
      date_due,
      date_modified: new Date()
    };
    for (const [key, value] of Object.entries(projectToUpdate))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    if ( content ) {
      projectToUpdate.content = content;
    };

    ProjectsService.updateProject(
      knexInst,
      req.params.id,
      projectToUpdate
    )
      .then(project => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${project.id}`))
          .json(ProjectsService.serializeProject(project))
      })
      .catch(next);
    });

/* async/await syntax for promises */
async function checkProjectExists(req, res, next) {
  const knexInst = req.app.get('db');
  try {
    const project = await ProjectsService.getProjectById(
      knexInst,
      req.params.id,
      req.user.id
    );

    if (!project)
      return res.status(404).json({
        error: `Project doesn't exist`
      })
    res.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = projectsRouter;