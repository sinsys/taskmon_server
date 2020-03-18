const xss = require('xss');

const TasksService = {

  // Get all projects
  getTasks: (db, user_id) => {
    return (
      db
        .from('tasks AS task')
        .select(
          'task.id',
          'task.title',
          'task.content',
          'task.date_modified',
          'task.date_created',
          'task.date_due',
          'task.user_id',
          'task.project_id',
          'task.completed'
        )
        .where('task.user_id', user_id)
        .orderBy('task.date_due', 'asc')
    );
  },

  getTaskById: (db, id, user_id) => {
    return (
      db
        .from('tasks AS task')
        .select(
          'task.id',
          'task.title',
          'task.content',
          'task.date_modified',
          'task.date_created',
          'task.date_due',
          'task.user_id',
          'task.project_id',
          'task.completed'
        )
        .where('task.id', id)
        .andWhere('task.user_id', user_id)
        .first()
    );
  },

  addTask: (db, newTask, user_id) => {
    return (
      db
        .insert(newTask)
        .into('tasks')
        .returning('*')
        .then(([task]) => task)
        .then(task =>
          TasksService.getTaskById(db, task.id, user_id)
        )
    );
  },

  deleteTask: (db, id) => {
    return (
      db('tasks')
        .where( { id } )
        .delete()
    );
  },

  updateTask: (db, id, updatedTask) => {
    return (
      db('tasks')
        .where( { id } )
        .update(updatedTask)
    );
  },

  // Serialize task
  serializeTask: (task) => {
    return {
      id: task.id,
      title: xss(task.title),
      content: xss(task.content),
      date_modified: task.date_modified,
      date_created: task.date_created,
      date_due: task.date_due,
      user_id: task.user_id,
      project_id: task.project_id,
      completed: task.completed
    };
  }
  
};

module.exports = TasksService;