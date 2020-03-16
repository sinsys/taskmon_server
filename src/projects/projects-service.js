const xss = require('xss');

const ProjectsService = {

  // Get all projects
  getProjects: (db, user_id) => {
    return (
      db
        .from('projects AS project')
        .select(
          'project.id',
          'project.title',
          'project.content',
          'project.date_modified',
          'project.date_created',
          'project.date_due',
          'project.user_id'
        )
        .where('project.user_id', user_id)
        .orderBy('project.date_due', 'asc')
    );
  },

  getProjectById: (db, id, user_id) => {
    return (
      db
        .from('projects AS project')
        .select(
          'project.id',
          'project.title',
          'project.content',
          'project.date_modified',
          'project.date_created',
          'project.date_due',
          'project.user_id'
        )
        .where('project.id', id)
        .andWhere('project.user_id', user_id)
        .first()
    );
  },

  addProject: (db, newProject, user_id) => {
    return (
      db
        .insert(newProject)
        .into('projects')
        .returning('*')
        .then(([project]) => project)
        .then(project =>
          ProjectsService.getProjectById(db, project.id, user_id)
        )
    );
  },

  deleteProject: (db, id) => {
    return (
      db('projects')
        .where( { id } )
        .delete()
    );
  },

  updateProject: (db, id, updatedProject) => {
    return (
      db('projects')
        .where( { id } )
        .update(updatedProject)
    );
  },
  // Serialize project
  serializeProject: (project) => {
    return {
      id: project.id,
      title: xss(project.title),
      content: xss(project.content),
      date_modified: project.date_modified,
      date_created: project.date_created,
      date_due: project.date_due,
      user_id: project.user_id
    };
  }
  
};

module.exports = ProjectsService;