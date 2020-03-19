const app = require('../src/app');
const knex = require('knex');
const bcrypt = require('bcryptjs');
const helpers = require('./test-helpers');

describe(`Users Endpoints`, () => {
  let db;
  
  const { 
    testUsers, 
    testSettings 
  } = helpers.makeFixtures();

  const testUser = testUsers[0];

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

  describe(`POST /api/users`, () => {

    context(`Given there are users`, () => {

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

      const requiredFields = ['user_name', 'password', 'nickname'];

      requiredFields.forEach(field => {

        const registerAttemptBody = {
          user_name: 'test username',
          password: 'test password',
          nickname: 'test nickname',
        };

        it(`Responds 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]
          return (
            supertest(app)
              .post('/api/users')
              .send(registerAttemptBody)
              .expect(400, {
                error: `Missing '${field}' in request body`,
              })
          );
        });

      });

      it(`Responds 400 'Password must be longer than 8 characters' when empty password'`, () => {
        const userShortPassword = {
          user_name: 'test username',
          password: '1234567',
          nickname: 'test nickname'
        };
        return (
          supertest(app)
            .post('/api/users')
            .send(userShortPassword)
            .expect(400, {
              error: `Password must be longer than 8 characters`
            })
        );
      });

      it(`Responds 400 'Password must be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          user_name: 'test username',
          password: '*'.repeat(73),
          nickname: 'test nickname'
        };

        return (
          supertest(app)
            .post('/api/users')
            .send(userLongPassword)
            .expect(400, {
              error: `Password must be less than 72 characters`
            })
        );
      });

      it(`Responds 400 'Password must not start with spaces' when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          user_name: 'test username',
          password: ' 1A! 2B@ 3c 4D ',
          nickname: 'test nickname'
        };

        return (
          supertest(app)
            .post('/api/users')
            .send(userPasswordStartsSpaces)
            .expect(400, {
              error: `Password must not start or end with empty spaces`
            })
        );
      });

      it(`Responds 400 'Password is not complex enough' when password does not contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character`, () => {
        const userPasswordNotComplex = {
          user_name: 'test username',
          password: '11aabbcc22',
          nickname: 'test nickname'
        };

        return (
          supertest(app)
            .post('/api/users')
            .send(userPasswordNotComplex)
            .expect(400, {
              error: `Password must contain 1 upper case, lower case, number and special character`
            })
        );
      });

      it(`Responds 400 'Username already taken' when username isn't unique`, () => {
        const duplicateUser = {
          user_name: testUser.user_name,
          password: '11AAaa!!',
          nickname: 'test nickname'
        };

        return (
          supertest(app)
            .post('/api/users')
            .send(duplicateUser)
            .expect(400, {
              error: `Username already taken`
            })
        );
      });

    });

    context(`Given new user validations pass`, () => {

      it(`Responds 201 with the serialized user, storing bcrypted password`, function() {
        this.retries(3);
        const newUser = {
          user_name: 'test user_name',
          password: '11AAaa!!',
          nickname: 'test nickname'
        };
        return (
          supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property('id');
              expect(res.body.user_name).to.eql(newUser.user_name);
              expect(res.body).to.not.have.property('password');
              expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
              const expectedDate = new Date().toLocaleString();
              const actualDate = new Date(res.body.date_created).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
            .expect(res => {
              db
                .from('users')
                .select('*')
                .where({ id: res.body.id })
                .first()
                .then(row => {
                  expect(row.user_name).to.eql(newUser.user_name);
                  const expectedDate = new Date().toLocaleString();
                  const actualDate = new Date(row.date_created).toLocaleString();
                  expect(actualDate).to.eql(expectedDate);
                  return (
                    bcrypt.compare(
                      newUser.password,
                      row.password
                    )
                  )
                })
                .then(compareMatch => {
                  expect(compareMatch).to.be.true;
                });
              db
                .from('settings')
                .select('*')
                .where({ user_id: res.body.id })
                .first()
                .then(row => {
                  expect(row.user_id).to.eql(res.body.id);
                  expect(row.nickname).to.eql(newUser.nickname);
                })
            })
        );
      });

    });

  });

});
