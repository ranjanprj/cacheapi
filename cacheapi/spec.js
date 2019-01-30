var request = require('supertest');
describe('loading express', function () {
  var server;
  beforeEach(function () {
    server = require('./app.js');
  });
  afterEach(function () {
    // server.close();
  });
  it('responds to /cacheapi/action/createupdatedata/name', function testSlash(done) {
  request(server)
    .get('/cacheapi/action/get/name')
    .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    request(server)
      .get('/foo/bar')
      .expect(404, done);
  });
});