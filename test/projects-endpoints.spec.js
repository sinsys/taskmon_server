const app = require('../src/app');
const knex = require('knex');
const helpers = require('./test-helpers');

describe(`Projects Endpoints`, () => {
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

  describe(`GET /api/projects`, () => {

    context(`Given no projects`, () => {

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

      it(`Responds 200 with an empty list`, () => {
        return (
          supertest(app)
            .get(`/api/projects`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, [])
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
      it(`Responds with 200 with an array of projects`, () => {
        const expectedProjects = 
          testProjects
            .filter(project => project.user_id === testUsers[0].id )
            .map(project => {
              return (
                helpers.makeExpectedProject(project)
              );
            });
        
        return (
          supertest(app)
            .get('/api/projects')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, expectedProjects)
        );
      });

    });

  });

  describe(`GET /api/projects/:id`, () => {

    context(`Given no projects`, () => {

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
            .get(`/api/projects/1`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, {
              error: `Project doesn't exist`
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

      it(`Responds with 200 and the specified project`, () => {
        const projectId = 1;
        const expectedProject = makeExpectedProject(testProjects[projectId - 1]);
        return (
          supertest(app)
            .get(`/api/projects/${projectId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(200, expectedProject)
        );
      });

    });

  });

  describe(`POST /api/projects`, () => {
    
    context(`Given no projects`, () => {

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

      it(`Responds with 201 and the new project`, function() {
        this.retries(3);
        const testUser = testUsers[0];
        const newProject = {
          title: "Test Project",
          date_due: new Date()
        };
        return (
          supertest(app)
            .post(`/api/projects`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newProject)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.title).to.eql(newProject.title);
              expect(res.body.user_id).to.eql(testUser.id);
              expect(res.headers.location).to.eql(`/api/projects/${res.body.id}`);
              const expectedDate = new Date().toLocaleString();
              const actualDate = new Date(res.body.date_due).toLocaleString();
              expect(expectedDate).to.eql(actualDate);
            })
        );
      });
    
    });

  });

  describe(`DELETE /api/projects/:id`, () => {

    context(`Given project does not exist`, () => {

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
        const projectId = 9001;
        return (
          supertest(app)
            .delete(`/api/projects/${projectId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(404, {
              error: `Project doesn't exist`
            })
        )
      });

    });

    context(`Given project exists`, () => {

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
      
      it(`Responds with 204 and the project is deleted`, () => {
        const projectId = 1;
        return (
          supertest(app)
            .delete(`/api/projects/${projectId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .expect(204)
            .then(()=> {
              // We verify that we get a 404 when querying the project
              supertest(app)
                .get(`/api/project/${projectId}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(404, {
                  error: `Project doesn't exist`
                })
            })
        );
      });
      
    });

  });

  describe(`PATCH /api/projects/:id`, () => {

    context(`Given project does not exist`, () => {

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
        const projectId = 9001;
        const updatedProject = {
          title: 'New title',
          content: 'New content',
          date_due: new Date()
        };
        return (
          supertest(app)
            .patch(`/api/projects/${projectId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(updatedProject)
            .expect(404, {
              error: `Project doesn't exist`
            })
        )
      });

    });

    context(`Given project exists`, () => {

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
      
      it(`Responds with 204 and the project is updated`, function() {
        this.retries(3);
        const projectId = 1;
        const updatedProject = {
          title: 'New title',
          content: 'New content',
          date_due: new Date()
        };
        const expectedProject = {
          ...testProjects[projectId - 1],
          ...updatedProject,
          date_due: new Date(updatedProject.date_due).toLocaleString(),
          date_modified: new Date().toLocaleString(),
          date_created: new Date(testProjects[projectId - 1].date_created).toLocaleString()
        };

        return (
          supertest(app)
            .patch(`/api/projects/${projectId}`)
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(updatedProject)
            .expect(201)
            .then(res => {
              return (
                supertest(app)
                  .get(`/api/projects/${projectId}`)
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .expect(200)
                  .expect(res => {
                    const actualDateDue = new Date(res.body.date_due).toLocaleString();
                    const actualDateCreated = new Date(res.body.date_created).toLocaleString();
                    const actualDateModified = new Date(res.body.date_modified).toLocaleString();
                    expect(expectedProject.date_due).to.eql(actualDateDue);      
                    expect(expectedProject.date_created).to.eql(actualDateCreated);   
                    expect(expectedProject.date_modified).to.eql(actualDateModified);                 
                  })
              );
            })
        );
      });
      
    });
    
  });

});