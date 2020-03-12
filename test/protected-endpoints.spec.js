const app = require('../src/app.js');
const knex = require('knex');
const helpers = require('./test-helpers.js');

describe('Protected endpoints', () => {
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

  beforeEach('seed database', () =>
    helpers.seedTables(
      db,
      testUsers,
      testProjects,
      testTasks,
    )
  );

  const protectedEndpoints = [
    {
      name: `GET /api/projects`,
      path: `/api/projects`,
      method: supertest(app).get
    },
    {
      name: `POST /api/projects`,
      path: `/api/projects`,
      method: supertest(app).post
    },
    {
      name: `GET /api/projects/:id`,
      path: `/api/projects/:id`,
      method: supertest(app).get
    },
    {
      name: `PATCH /api/projects/:id`,
      path: `/api/projects/:id`,
      method: supertest(app).patch
    },
    {
      name: `DELETE /api/projects/:id`,
      path: `/api/projects/:id`,
      method: supertest(app).delete
    },
    {
      name: `GET /api/tasks`,
      path: `/api/tasks`,
      method: supertest(app).get
    },
    {
      name: `POST /api/tasks`,
      path: `/api/tasks`,
      method: supertest(app).get
    },
    {
      name: `GET /api/tasks/:id`,
      path: `/api/tasks/:id`,
      method: supertest(app).get,
    },
    {
      name: `PATCH /api/tasks/:id`,
      path: `/api/tasks/:id`,
      method: supertest(app).patch
    },
    {
      name: `DELETE /api/tasks/:id`,
      path: `/api/tasks/:id`,
      method: supertest(app).delete
    },
  ];

  protectedEndpoints.forEach(endpoint => {

    describe(endpoint.name, () => {

      it(`responds 401 'Missing basic token' when no basic token`, () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: `Missing basic token` })
      });

      it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
        const userNoCreds = { name: '', password: '' }
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userNoCreds))
          .expect(401, { error: `Unauthorized request` })
      });

      it(`responds 401 'Unauthorized request' when invalid user`, () => {
        const userInvalidCreds = { name: 'user-not', password: 'existy' }
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
          .expect(401, { error: `Unauthorized request` })
      });

      it(`responds 401 'Unauthorized request' when invalid password`, () => {
        const userInvalidPass = { name: testUsers[0].name, password: 'wrong' }
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userInvalidPass))
          .expect(401, { error: `Unauthorized request` })
      });

    });

  });

});