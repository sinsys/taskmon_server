const xss = require('xss');

const SettingsService = {

  // Get user settings
  getSettings: (db, user_id) => {
    return (
      db
        .from('settings AS setting')
        .select(
          'setting.id',
          'setting.user_id',
          'setting.nickname',
          'setting.hydration'
        )
        .where('setting.id', user_id)
        .first()
    );
  },

  updateSettings: (db, user_id, updatedSettings) => {
    return (
      db('settings')
        .where('settings.user_id', user_id)
        .update(updatedSettings)
    );
  },
  

  serializeSettings: (settings) => {
    return {
      ...settings,
      nickname: xss(settings.nickname)
    };
  }
  
};

module.exports = SettingsService;

//   (1, 'Test user', true);

// INSERT INTO hydration (length, start_time, end_time, user_id)
// VALUES
//   (3600000, NOW(), (NOW() + interval '2 hours'), 1),
//   (3600000, NOW(), (NOW() + interval '2 hours'), 1);

  // getProjectById: (db, id, user_id) => {
  //   return (
  //     db
  //       .from('projects AS project')
  //       .select(
  //         'project.id',
  //         'project.title',
  //         'project.content',
  //         'project.date_modified',
  //         'project.date_created',
  //         'project.date_due',
  //         'project.user_id'
  //       )
  //       .where('project.id', id)
  //       .andWhere('project.user_id', user_id)
  //       .first()
  //   );
  // },

  // addProject: (db, newProject, user_id) => {
  //   return (
  //     db
  //       .insert(newProject)
  //       .into('projects')
  //       .returning('*')
  //       .then(([project]) => project)
  //       .then(project =>
  //         ProjectsService.getProjectById(db, project.id, user_id)
  //       )
  //   );
  // },

  // deleteProject: (db, id) => {
  //   return (
  //     db('projects')
  //       .where( { id } )
  //       .delete()
  //   );
  // },

  // updateProject: (db, id, updatedProject) => {
  //   return (
  //     db('projects')
  //       .where( { id } )
  //       .update(updatedProject)
  //   );
  // },
  // Serialize settings