const app = require('../src/app');

describe('App tests', () => {

  it(`GET / responds with 200 containing 'Server is up'`, () => {
    return (
      supertest(app)
        .get('/')
        .expect(200, 'Server is up')
    );
  });

});