const app = require('../src/app');
const knex = require('knex');
const helpers = require('./test-helpers');

describe(`Tasks Endpoints`, () => {
  let db;

  // Create database schema as JS objects
  const {
    testUsers,
    testProjects,
    testTasks
  } = helpers.makeFixtures();

  before('connect to database', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after(`disconnect from database`, () => {
    return db.destroy();
  });

  before(`truncate database and restart identities`, () => {
    return helpers.cleanTables(db)
  });

  afterEach(`truncate database and restart identities`, () => {
    return helpers.cleanTables(db)
  });

  describe(`GET /api/tasks`, () => {

    context(`Given no tasks`, () => {

      beforeEach('seed database', () =>
        helpers.seedTables(
          db,
          testUsers,
          [],
          []
        )
      );

      it(`Responds 200 with an empty list`, () => {
        return (
          supertest(app)
            .get(`/api/tasks`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, [])
        );
      });

    });

    context(`Given there are tasks`, () => {

      beforeEach('seed database', () =>
        helpers.seedTables(
          db,
          testUsers,
          testProjects,
          testTasks
        )
      );

      it(`Responds with 200 with an array of projects`, () => {
        const expectedTasks = 
          testTasks
            .filter(task => task.user_id === testUsers[0].id )
            .map(task => {
              return (
                helpers.makeExpectedTask(task)
              );
            });

        return (
          supertest(app)
            .get('/api/tasks')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, expectedTasks)
        );
      });

    });

  });

  describe(`GET /api/tasks/:id`, () => {

    context(`Given no tasks`, () => {

      beforeEach('seed database', () =>
        helpers.seedTables(
          db,
          testUsers,
          [],
          []
        )
      );

      it(`Responds with 404`, () => {
        return (
          supertest(app)
            .get(`/api/tasks/1`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, {
              error: `Task doesn't exist`
            })
        );
      });

    });

    context(`Given there are projects`, () => {

      beforeEach('seed database', () =>
        helpers.seedTables(
          db,
          testUsers,
          testProjects,
          testTasks
        )
      );

      it(`Responds with 200 and the specified task`, () => {
        const taskId = 1;
        const expectedTask = makeExpectedTask(testTasks[taskId - 1]);
        return (
          supertest(app)
            .get(`/api/tasks/${taskId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, expectedTask)
        );
      });

    });

  });

  describe(`POST /api/tasks`, () => {
    
    context(`Given no tasks`, () => {

      beforeEach('seed database', () => {
        return (
          helpers.seedTables(
            db,
            testUsers,
            [],
            []
          )
        );
      });

      it(`Responds with 201 and the new task`, function() {
        this.retries(3);
        const testUser = testUsers[0];
        const newTask = {
          title: "Test Task",
          date_due: new Date()
        };
        return (
          supertest(app)
            .post(`/api/tasks`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newTask)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.title).to.eql(newTask.title);
              expect(res.body.user_id).to.eql(testUser.id);
              expect(res.headers.location).to.eql(`/api/tasks/${res.body.id}`);
              const expectedDate = new Date().toLocaleString();
              const actualDate = new Date(res.body.date_due).toLocaleString();
              expect(expectedDate).to.eql(actualDate);
            })
        );
      });
    
    });

  });

  describe(`DELETE /api/tasks/:id`, () => {

    context(`Given task does not exist`, () => {

      beforeEach('seed database', () => {
        return (
          helpers.seedTables(
            db,
            testUsers,
            [],
            []
          )
        );
      });
      
      it(`Responds with 404`, () => {
        const taskId = 9001;
        return (
          supertest(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, {
              error: `Task doesn't exist`
            })
        )
      });

    });

    context(`Given task exists`, () => {

      beforeEach('seed database', () => {
        return (
          helpers.seedTables(
            db,
            testUsers,
            testProjects,
            testTasks
          )
        );
      });
      
      it(`Responds with 204 and the task is deleted`, () => {
        const taskId = 1;
        return (
          supertest(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(204)
            .then(()=> {
              // We verify that we get a 404 when querying the task
              return (
                supertest(app)
                  .get(`/api/tasks/${taskId}`)
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .expect(404)
              );
            })
        );
      });
      
    });

  });

  describe(`PATCH /api/tasks/:id`, () => {

    context(`Given task does not exist`, () => {

      beforeEach('seed database', () => {
        return (
          helpers.seedTables(
            db,
            testUsers,
            [],
            []
          )
        );
      });
      
      it(`Responds with 404`, () => {
        const taskId = 9001;
        const updatedTask = {
          title: 'New title',
          content: 'New content',
          date_due: new Date()
        };
        return (
          supertest(app)
            .patch(`/api/tasks/${taskId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(updatedTask)
            .expect(404, {
              error: `Task doesn't exist`
            })
        )
      });

    });

    context(`Given task exists`, () => {

      beforeEach('seed database', () => {
        return (
          helpers.seedTables(
            db,
            testUsers,
            testProjects,
            testTasks
          )
        );
      });
      
      it(`Responds with 204 and the task is updated`, function() {
        this.retries(3);
        const taskId = 1;
        const updatedTask = {
          title: 'New title',
          content: 'New content',
          date_due: new Date()
        };
        const expectedTask = {
          ...testTasks[taskId - 1],
          ...updatedTask,
          date_due: new Date(updatedTask.date_due).toLocaleString(),
          date_modified: new Date().toLocaleString(),
          date_created: new Date(testTasks[taskId - 1].date_created).toLocaleString()
        };

        return (
          supertest(app)
            .patch(`/api/tasks/${taskId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(updatedTask)
            .expect(201)
            .then(res => {
              return (
                supertest(app)
                  .get(`/api/tasks/${taskId}`)
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .expect(200)
                  .expect(res => {
                    const actualDateDue = new Date(res.body.date_due).toLocaleString();
                    const actualDateCreated = new Date(res.body.date_created).toLocaleString();
                    const actualDateModified = new Date(res.body.date_modified).toLocaleString();
                    expect(expectedTask.date_due).to.eql(actualDateDue);      
                    expect(expectedTask.date_created).to.eql(actualDateCreated);   
                    expect(expectedTask.date_modified).to.eql(actualDateModified);                 
                  })
              );
            })
        );
      });
      
    });
    
  });

});
