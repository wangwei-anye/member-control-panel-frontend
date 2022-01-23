const expect = require('chai').expect;
const mockStorage = require('./mockStorage');
const session = require('../src/utils/session');

describe('Session', function () {
  // 测试信息
  const testInfo = 'eyJ1c2VyTmFtZSI6ImFkbWluIiwibmlja05hbWUiOiJhZG1pbiIsInVzZXJJZCI6MSwiand0IjoiQzg3MDJBQTE5OTdDRjY2QkVBNTZGQzA3MzUxRDcyQUYifQ==';

  before(function () {
    // 注入必须全局对象
    global.window = {
      addEventListener() {}
    };
    global.localStorage = mockStorage();
    global.sessionStorage = mockStorage();
  });

  after(function () {
    delete global.window;
    delete global.localStorage;
    delete global.sessionStorage;
  });

  beforeEach(function () {
    sessionStorage.removeItem('userInfo');
  });

  it('getUserSession()', function () {
    sessionStorage.setItem('userInfo', testInfo);
    expect(session.getUserSession()).to.be.deep.equal({
      nickName: 'admin',
      jwt: 'C8702AA1997CF66BEA56FC07351D72AF',
      userId: 1,
      userName: 'admin'
    });
  });

  it('getToken()', function () {
    sessionStorage.setItem('userInfo', testInfo);
    expect(session.getToken()).to.be.equal('C8702AA1997CF66BEA56FC07351D72AF');
  });

  it('saveUserSession()', function () {
    session.saveUserSession({ user: 'Lily' });
    expect(sessionStorage.getItem('userInfo')).to.be.equal('eyJ1c2VyIjoiTGlseSJ9');
  });

  it('session joint testing', function () {
    session.saveUserSession({ book: 'Harry Potter and the Sorcerer\'s Stone' });
    expect(session.getUserSession()).to.be.deep.equal({ book: 'Harry Potter and the Sorcerer\'s Stone' });
  });

  it('getLocalUser()', function () {
    localStorage.setItem('userInfo', testInfo);
    expect(session.getLocalUser()).to.be.deep.equal({
      nickName: 'admin',
      jwt: 'C8702AA1997CF66BEA56FC07351D72AF',
      userId: 1,
      userName: 'admin'
    });
  });

  it('saveLocalUser()', function () {
    session.saveLocalUser({ girl: 'Sophia' });
    expect(localStorage.getItem('userInfo')).to.be.equal('eyJnaXJsIjoiU29waGlhIn0=');
  });

  it('localUser joint testing', function () {
    session.saveLocalUser({ name: 'Anna', age: '18' });
    expect(session.getLocalUser()).to.be.deep.equal({ name: 'Anna', age: '18' });
  });
});
