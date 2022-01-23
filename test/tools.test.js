// tools工具函数单元测试
const expect = require('chai').expect;

const tools = require('../src/utils/tools');

describe('Utils Tools', function () {
  describe('createGUID()', function () {
    it('36 characters', function () {
      expect(tools.createGUID().length).to.be.equal(36);
    });
    it('must be random', function () {
      expect(tools.createGUID()).to.not.equal(tools.createGUID());
    });
  });

  describe('dateFormat()', function () {
    const date = new Date('Thu Apr 12 2018 12:01:01');
    it('default', function () {
      expect(tools.dateFormat(date)).to.be.equal('2018-04-12 12:01:01');
    });
    it('can customized', function () {
      expect(tools.dateFormat(date, 'YY-M-D')).to.be.equal('18-4-12');
    });
  });

  describe('deepCopy()', function () {
    let source;
    let target;
    beforeEach(function () {
      source = {
        arr: [{ a: 1 }],
        obj: { b: 2 },
      };
      target = tools.deepCopy(source);
    });
    it('deep equal', function () {
      expect(target).to.deep.equal(source);
    });
    it('not itself', function () {
      expect(target).to.not.equal(source);
    });
    it('deep copy', function () {
      source.arr[0].a = 3;
      expect(source.arr[0].a).to.not.equal(target.arr[0].a);
    });
  });

  describe('parseSearch()', function () {
    const str = '?username= Lily &age=18';
    it('parse', function () {
      expect(tools.parseSearch(str)).to.deep.equal({
        username: 'Lily',
        age: '18',
      });
    });
    it('not trim', function () {
      expect(tools.parseSearch(str, false)).to.deep.equal({
        username: ' Lily ',
        age: '18',
      });
    });
  });
});
