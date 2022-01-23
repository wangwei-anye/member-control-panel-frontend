// model单元测试
const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const walkSync = require('walk-sync');
const Immutable = require('immutable');

const routePatt = /\broute.js$/;
const modelPatt1 = /\bmodel:\s*(\w+)\b/g;
const modelPatt2 = /\bmodels:\s*\[([^\]]+)\]/g;
const basePath = 'src/routes';

const files = walkSync(basePath);
// 取出route文件
const routeFiles = files.filter(f => routePatt.test(f));
const modelFiles = [];
// 导入全局model
modelFiles.push(path.resolve('src/models/system'));

// 从route文件中取出model文件
routeFiles.map((f, i) => {
  const file = path.resolve(basePath + '/' + f);
  const text = fs.readFileSync(file, 'utf-8');
  const vn = new Set();
  let result;
  while ((result = modelPatt1.exec(text)) != null) {
    vn.add(result[1]);
  }
  while ((result = modelPatt2.exec(text)) != null) {
    try {
      const arr = result[1].split(',');
      arr.forEach(it => {
        if (it) vn.add(it.trim());
      });
    } catch (err) {
      console.log(err);
    }
  }
  Array.from(vn).forEach(n => {
    const patt = new RegExp(`\\b${n}\\s*\\=\\s*import\\(['"]?([\\w\\.\\/]+)['"]?\\)`);
    const mat = text.match(patt);
    if (mat) {
      modelFiles.push(path.resolve(path.dirname(file), mat[1]));
    }
  });
});

// 加载model
const models = modelFiles.map(file => {
  try {
    return {
      file: path.relative(__dirname, file),
      model: require(file).default // eslint-disable-line
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}).filter(it => it !== null);

describe('Model testing', function () {
  describe('Namespace testing', function () {
    it('must include namespace', function () {
      models.forEach(it => {
        expect(it.model, it.file).to.have.property('namespace');
      });
    });
    it('cannot be repeated', function () {
      const rep = new Set();
      models.forEach(it => {
        const errMsg = `conflict namespace "${it.model.namespace}" at ${it.file}`;
        expect(!rep.has(it.model.namespace), errMsg).to.be.true;
        rep.add(it.model.namespace);
      });
    });
  });

  describe('State testing', function () {
    it('must include state', function () {
      models.forEach(it => {
        expect(it.model, it.file).to.have.property('state');
      });
    });
    it('must be immutable', function () {
      models.forEach(it => {
        const isImmutable = Immutable.Iterable.isIterable(it.model.state);
        expect(isImmutable, `State is not immutable at ${it.file}`).to.be.true;
      });
    });
  });

  describe('Reducers testing', function () {
    it('must include reducers', function () {
      models.forEach(it => {
        expect(it.model, it.file).to.have.property('reducers');
      });
    });
    it('member must be function', function () {
      models.forEach(it => {
        const members = it.model.reducers;
        Object.keys(members).forEach(key => {
          expect(members[key], `${key} is not a function at reducers \n at ${it.file}`).to.be.a('function');
        });
      });
    });
  });
});
