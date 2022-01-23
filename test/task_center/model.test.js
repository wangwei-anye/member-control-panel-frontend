const expect = require('chai').expect;
const taskModel = require('../../src/routes/TaskCenter/model');

describe('task center model testing', function () {
  it('model should be exist', () => {
    expect(taskModel).to.be.exist();
  });

  it('namespace should equal taskCenter', () => {
    expect(taskModel.namespace).to.be.equal('taskCenter');
  });

  describe('effects', () => {
    beforeEach(() => {

    });
  });

  describe('reducers', () => {

  });
});
