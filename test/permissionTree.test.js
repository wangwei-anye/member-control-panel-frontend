// // 登录授权模块单元测试
// const expect = require('chai').expect;
// const Immutable = require('immutable');

// const { convertKeysToJson, convertJsonToKeys } = require('../src/utils/permissionTree');

// describe('Permission Tree Tool', function () {
//   describe('convertKeysToJson()', function () {
//     it('level 1', function () {
//       const keys = ['user', 'vendor'];
//       expect(convertKeysToJson(keys)).to.deep.equal({
//         user: {},
//         vendor: {},
//       });
//     });
//     it('level 2', function () {
//       const keys = ['user', 'user.user'];
//       expect(convertKeysToJson(keys)).to.deep.equal({
//         user: {
//           user: [],
//         },
//       });
//     });
//     it('level 3', function () {
//       const keys = ['user', 'user.user', 'user.user.index'];
//       expect(convertKeysToJson(keys)).to.deep.equal({
//         user: {
//           user: ['index'],
//         },
//       });
//     });
//   });

//   describe('convertJsonToKeys()', function () {
//     it('level 1', function () {
//       const json = {
//         user: {},
//         vendor: {},
//       };
//       expect(convertJsonToKeys(json)).to.deep.equal(['user', 'vendor']);
//     });
//     it('level 2', function () {
//       const json = {
//         user: {
//           user: [],
//         },
//       };
//       expect(convertJsonToKeys(json)).to.deep.equal(['user', 'user.user']);
//     });
//     it('level 3', function () {
//       const json = {
//         user: {
//           user: ['index'],
//         },
//       };
//       expect(convertJsonToKeys(json)).to.deep.equal(['user', 'user.user', 'user.user.index']);
//     });
//   });
// });
