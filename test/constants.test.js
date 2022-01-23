process.env.BROWSER_HISTORY = 'false';
const expect = require('chai').expect;
const constants = require('../src/constants');

describe('Constants testing', function () {
  describe('Basic testing', function () {
    it('all uppercase required', function () {
      Object.keys(constants).forEach(key => {
        expect(key).to.equal(key.toUpperCase());
      });
    });
    it('must not be function', function () {
      Object.keys(constants).forEach(key => {
        expect(constants[key]).to.not.a('function');
      });
    });
    it('must not be object', function () {
      Object.keys(constants).forEach(key => {
        expect(constants[key]).to.not.an('object');
      });
    });
  });
  describe('Members testing', function () {
    it('have API_BASE', function () {
      expect(constants).to.have.property('API_BASE');
    });
    it('have DEFAULT_PAGE_SIZE', function () {
      expect(constants).to.have.property('DEFAULT_PAGE_SIZE');
    });
    it('have BROWSER_HISTORY', function () {
      expect(constants).to.have.property('BROWSER_HISTORY');
    });
    it('have HEADER_TOKEN_NAME', function () {
      expect(constants).to.have.property('HEADER_TOKEN_NAME');
    });
    it('have DEFAULT_EMPOWER_DISABLE_TYPE', function () {
      expect(constants).to.have.property('DEFAULT_EMPOWER_DISABLE_TYPE');
    });
  });
});
