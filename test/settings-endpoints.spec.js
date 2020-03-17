const app = require('../src/app');
const knex = require('knex');
const helpers = require('./test-helpers');

describe(`Settings Endpoints`, () => {
  let db;

  // Create database schema as JS objects
  const {
    testUsers,
    testSettings
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

  beforeEach('seed database', () =>
    helpers.seedTables(
      db,
      testUsers,
      [],
      [],
      testSettings,
      []
    )
  );

  afterEach(`truncate database and restart identities`, () => {
    return helpers.cleanTables(db)
  });

  describe(`GET /api/settings`, () => {

    it(`Responds with 200 and the user's settings`, () => {
      const settingsId = testUsers[0].id;
      const expectedSettings = makeExpectedSetting(testSettings[settingsId - 1]);
      return (
        supertest(app)
          .get(`/api/settings`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedSettings)
      );
    });

  });

  describe(`PATCH /api/settings`, () => {

    it(`Responds with 204 and the settings are updated`, () => {
      const settingsId = testSettings[0].id;
      const updatedSettings = {
        nickname: 'New nickname',
        hydration: false
      };
      const expectedSettings = {
        id: testSettings[settingsId - 1].id,
        user_id: testUsers[settingsId - 1].id,
        ...updatedSettings
      };

      return (
        supertest(app)
          .patch(`/api/settings`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updatedSettings)
          .expect(200)
          .then(res => {
            return (
              supertest(app)
                .get(`/api/settings`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(
                  200,
                  expectedSettings
                )
            );
          })
      );
    });

  });

});

