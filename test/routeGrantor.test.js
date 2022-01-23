// 登录授权模块单元测试
const { JSDOM } = require('jsdom');
const expect = require('chai').expect;
const Immutable = require('immutable');

const { routeGrantor } = require('../src/utils/routeGrantor');

const { window } = new JSDOM('<!doctype html><html><body></body></html>');

let immutableState = Immutable.fromJS({
  authorized: true,
  permissions: {},
});

const app = {
  _store: {
    getState: () => ({
      auth: immutableState
    }),
  },
  _history: {
    push: () => {},
    replace: () => {},
  }
};

describe('Route Grantor', function () {
  before(function () {
    // eslint-disable-next-line
    const { window } = new JSDOM('<!doctype html><html><body></body></html>');
    // 注入必须全局对象
    global.document = window.document;
    global.window = window;
  });

  after(function () {
    delete global.window;
    delete global.document;
  });

  beforeEach(function () {
    immutableState = Immutable.fromJS({
      authorized: true,
      permissions: {},
    });
  });

  xit('not login', function () {
    const route = {};
    immutableState = immutableState.set('authorized', false);
    expect(routeGrantor(route, app)).to.be.false;
  });

  it('logined', function () {
    const route = {};
    immutableState = immutableState.set('authorized', true);
    expect(routeGrantor(route, app)).to.be.true;
  });

  it('authorized', function () {
    const route = { permit: 'user.list' };
    immutableState = immutableState.set('permissions', Immutable.fromJS({
      user: {
        list: ['index']
      }
    }));
    expect(routeGrantor(route, app)).to.be.true;
  });

  it('unauthorized', function () {
    const route = { permit: 'user.list.add' };
    immutableState = immutableState.set('permissions', Immutable.fromJS({
      user: {
        list: ['index']
      }
    }));
    expect(routeGrantor(route, app)).to.be.false;
  });
});
