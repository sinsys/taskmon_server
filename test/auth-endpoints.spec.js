const app = require('../src/app');
const knex = require('knex');
const helpers = require('./test-helpers');

describe.only(`Auth Endpoints`, () => {
  let db;

  const { testUsers } = helpers.makeFixtures();
  const testUser = testUsers[0];

  before(`make database connection`, () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
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

  describe(`POST /api/auth/login`, () => {

    beforeEach(`insert users`, () => {
      return (
        helpers.seedTables(
          db,
          testUsers,
          [],
          []
        )
      );
    });

    const requiredFields = ['user_name', 'password'];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password
      };

      it(`responds 400 'required' error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];
        return (
          supertest(app)
            .post(`/api/auth/login`)
            .send(loginAttemptBody)
            .expect(
              400,
              { error: `Missing '${field}' in request body` }
            )
        );
      });

    });

    it(`responds 400 'invalid username or password' when bad username exists`, () => {
      const userInvalidUser = { user_name: 'user-not', password: 'wrong' };
      return (
        supertest(app)
          .post(`/api/auth/login`)
          .send(userInvalidUser)
          .expect(
            400,
            { error: `Incorrect username or password` }
          )
      );
    });

    it(`responds 400 'invalid username or password' when bad password exists`, () => {
      const userInvalidPass = { user_name: testUser.user_name, password: 'wrong' };
      return (
        supertest(app)
          .post(`/api/auth/login`)
          .send(userInvalidPass)
          .expect(
            400,
            { error: `Incorrect username or password` }
          )
      );
    });
    
  });
});