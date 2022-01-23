// 登录授权模块单元测试
const { JSDOM } = require('jsdom');
const expect = require('chai').expect;
const Mitm = require('mitm');
const mockStorage = require('./mockStorage');

const request = require('../src/utils/request').default;

describe('Request Testing', function () {
  before(function () {
    const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost'
    });
    // 注入必须全局对象
    global.document = window.document;
    global.window = {
      addEventListener() { },
      ...window
    };
    global.localStorage = mockStorage();
    global.sessionStorage = mockStorage();
  });

  after(function () {
    delete global.window;
    delete global.document;
    delete global.localStorage;
    delete global.sessionStorage;
  });


  beforeEach(function () {
    this.mitm = Mitm();
  });

  afterEach(function () {
    this.mitm.disable();
  });

  describe('Basic Testing', function () {
    it('GET', function (done) {
      request('http://127.0.0.1/abc?id=100');
      this.mitm.on('request', function (req, res) {
        expect(req.method + req.url).to.be.equal('GET/abc?id=100');
        res.end('{}');
        done();
      });
    });

    it('POST', function (done) {
      const option = {
        method: 'POST',
      };
      this.mitm.on('request', function (req, res) {
        expect(req.method + req.url).to.be.equal('POST/create');
        res.end('{}');
        done();
      });
      request('http://127.0.0.1/create', option);
    });

    it('PUT', function (done) {
      const option = {
        method: 'PUT',
      };
      this.mitm.on('request', function (req, res) {
        expect(req.method + req.url).to.be.equal('PUT/update');
        res.end('{}');
        done();
      });
      request('http://127.0.0.1/update', option);
    });

    it('DELETE', function (done) {
      const option = {
        method: 'DELETE',
      };
      this.mitm.on('request', function (req, res) {
        expect(req.method + req.url).to.be.equal('DELETE/delete?id=102');
        res.end('{}');
        done();
      });
      request('http://127.0.0.1/delete?id=102', option);
    });
  });

  describe('Business Testing', function () {
    it('JSON Response', function (done) {
      const responseJSON = JSON.stringify({
        code: 0,
        data: {},
      });
      this.mitm.on('request', function (req, res) {
        res.end(responseJSON);
      });
      request('http://127.0.0.1/abc').then(res => {
        expect(res.data).to.deep.equal({
          code: 0,
          data: {},
        });
        done();
      });
    });

    it('add token', function (done) {
      const option = {
        method: 'GET',
        headers: {
          Token: 'sdfaljl',
        }
      };
      this.mitm.on('request', function (req, res) {
        expect(req.headers.token).to.be.equal('sdfaljl');
        res.end('{}');
        done();
      });
      request('http://127.0.0.1/get?id=102', option);
    });
  });
});
