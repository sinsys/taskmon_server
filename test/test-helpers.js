const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Truncate all tables and restart identities for database
cleanTables = (db) => {
  return db.transaction(transaction =>
    transaction.raw(
      `TRUNCATE
        users,
        projects,
        tasks,
        hydration,
        settings
      `
    )
    .then(() =>
      Promise.all([
        transaction.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        transaction.raw(`ALTER SEQUENCE projects_id_seq minvalue 0 START WITH 1`),
        transaction.raw(`ALTER SEQUENCE tasks_id_seq minvalue 0 START WITH 1`),
        transaction.raw(`ALTER SEQUENCE hydration_id_seq minvalue 0 START WITH 1`),
        transaction.raw(`SELECT setval('users_id_seq', 0)`),
        transaction.raw(`SELECT setval('projects_id_seq', 0)`),
        transaction.raw(`SELECT setval('tasks_id_seq', 0)`),
        transaction.raw(`SELECT setval('hydration_id_seq', 0)`)
      ])
    )
  );
};

// Create dummy users for our tests
makeUsersArray = () => {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      password: 'password'
    },
    {
      id: 2,
      user_name: 'test-user-2',
      password: 'password'
    }
  ];
};

// Create dummy projects for our tests
makeProjectsArray = (users) => {
  return [
    {
      id: 1,
      title: 'Project 1',
      content: 'Project 1 description and content',
      date_modified: new Date('2020-01-22T16:28:32.615Z'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      date_due: new Date('2020-05-22T16:28:32.615Z'),
      user_id: users[0].id,
      completed: false
    },
    {
      id: 2,
      title: 'Project 2',
      content: 'Project 2 description and content',
      date_modified: new Date('2020-01-22T16:28:32.615Z'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      date_due: new Date('2020-05-22T16:28:32.615Z'),
      user_id: users[0].id,
      completed: false
    },
    {
      id: 3,
      title: 'Project 3',
      content: 'Project 3 description and content',
      date_modified: new Date('2020-01-22T16:28:32.615Z'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      date_due: new Date('2020-05-22T16:28:32.615Z'),
      user_id: users[1].id,
      completed: false
    }
  ];
};

// Create dummy tasks for our tests
makeTasksArray = (users, projects) => {
  return [
    {
      id: 1,
      title: 'Task 1',
      content: 'Task 1 desciption and content',
      date_modified: new Date('2020-01-22T16:28:32.615Z'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      date_due: new Date('2020-05-22T16:28:32.615Z'),
      user_id: users[0].id,
      project_id: projects[0].id,
      completed: false
    },
    {
      id: 2,
      title: 'Task 2 - No project',
      content: 'Task 2 desciption and content',
      date_modified: new Date('2020-01-22T16:28:32.615Z'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      date_due: new Date('2020-05-22T16:28:32.615Z'),
      user_id: users[0].id,
      project_id: null,
      completed: false
    },
    {
      id: 3,
      title: 'Task 3',
      content: 'Task 3 desciption and content',
      date_modified: new Date('2020-01-22T16:28:32.615Z'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      date_due: new Date('2020-05-22T16:28:32.615Z'),
      user_id: users[1].id,
      project_id: projects[1].id,
      completed: false
    },
    {
      id: 4,
      title: 'Task 4',
      content: 'Task 4 desciption and content',
      date_modified: new Date('2020-01-22T16:28:32.615Z'),
      date_created: new Date('2020-01-22T16:28:32.615Z'),
      date_due: new Date('2020-05-22T16:28:32.615Z'),
      user_id: users[1].id,
      project_id: null,
      completed: false
    }
  ];
};

// Create dummy settings for our tests
makeSettingsArray = (users) => {
  return [
    {
      id: 1,
      user_id: users[0].id,
      nickname: 'Test user',
      hydration: true
    }
  ];
};

// Create dummy hydration entries for our tests
makeHydrationsArray = (users) => {
  return [
    {
      id: 1,
      length: 7200000,
      start_time: new Date('2020-01-22T16:28:32.615Z'),
      end_time: new Date('2020-01-22T18:28:32.615Z'),
      user_id: users[0].id
    },
    {
      id: 1,
      length: 7200000,
      start_time: new Date('2020-01-22T16:28:32.615Z'),
      end_time: new Date('2020-01-22T18:28:32.615Z'),
      user_id: users[0].id
    },
    {
      id: 1,
      length: 7200000,
      start_time: new Date('2020-01-22T16:28:32.615Z'),
      end_time: new Date('2020-01-22T18:28:32.615Z'),
      user_id: users[1].id
    }
  ]
};

seedTables = (db, users, projects, tasks, settings, hydration) => {

  return db.transaction(async trx => {

    if ( users.length > 0 ) {
      const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
      }));
      await trx.into('users').insert(preppedUsers);
      await trx.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id]
      );
    };

    if ( projects.length > 0 ) {
      await trx.into('projects').insert(projects);
      await trx.raw(
        `SELECT setval('projects_id_seq', ?)`,
        [projects[projects.length - 1].id]
      );
    };
    
    if( tasks.length > 0 ) {
      await trx.into('tasks').insert(tasks);
      await trx.raw(
        `SELECT setval('tasks_id_seq', ?)`,
        [tasks[tasks.length - 1].id]
      );
    };

    if( settings.length > 0 ) {
      await trx.into('settings').insert(settings);
      await trx.raw(
        `SELECT setval('settings_id_seq', ?)`,
        [settings[settings.length - 1].id]
      );
    };    

    if( hydration.length > 0 ) {
      await trx.into('hydration').insert(hydration);
      await trx.raw(
        `SELECT setval('tasks_id_seq', ?)`,
        [hydration[hydration.length - 1].id]
      );
    };
  });
};

makeExpectedProject = (project) => {
  return {
    id: project.id,
    title: project.title,
    content: project.content,
    date_modified: project.date_modified.toISOString(),
    date_created: project.date_created.toISOString(),
    date_due: project.date_due.toISOString(),
    user_id: project.user_id,
    completed: project.completed
  }
};

makeExpectedTask = (task) => {
  return {
    id: task.id,
    title: task.title,
    content: task.content,
    date_modified: task.date_modified.toISOString(),
    date_created: task.date_created.toISOString(),
    date_due: task.date_due.toISOString(),
    user_id: task.user_id,
    project_id: task.project_id,
    completed: task.completed
  }
};

makeExpectedSetting = (setting) => {
  return {
    id: setting.id,
    user_id: setting.user_id,
    nickname: setting.nickname,
    hydration: setting.hydration
  }
};

makeExpectedHydration = (hydration) => {
  return {
    id: hydration.id,
    length: hydration.length,
    start_time: start_time.toISOString(),
    end_time: end_time.toISOString(),
    user_id: hydration.user_id
  }
};

makeMaliciousProject = (user) => {
  const maliciousProject = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    date_created: new Date(),
    date_modified: new Date(),
    date_due: new Date(),
    user_id: user.id,
    completed: false
  }
  const expectedProject = {
    ...makeExpectedProject([user], maliciousProject),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousProject,
    expectedProject,
  }  
};

// Create JS objects representing database
makeFixtures = () => {
  const testUsers = makeUsersArray();
  const testProjects = makeProjectsArray(testUsers);
  const testTasks = makeTasksArray(testUsers, testProjects);
  const testSettings = makeSettingsArray(testUsers);
  const testHydrations = makeHydrationsArray(testUsers);
  return { testUsers, testProjects, testTasks, testSettings, testHydrations };
};

// Creates our authorization header for testing
makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
  // const token = Buffer.from(`${user.name}:${user.password}`).toString('base64');
  const token = jwt.sign(
    { user_id: user.id },
    secret,
    {
      subject: user.user_name,
      algorithm: 'HS256'
    }
  );
  return `Bearer ${token}`;
};

// Export our helper functions
module.exports = {
  makeAuthHeader,
  makeFixtures,
  cleanTables,
  seedTables,

  makeUsersArray,
  makeProjectsArray,
  makeTasksArray,
  makeSettingsArray,
  makeHydrationsArray,
  makeExpectedProject,
  makeExpectedTask,
  makeExpectedSetting,
  makeExpectedHydration,
  makeMaliciousProject
};