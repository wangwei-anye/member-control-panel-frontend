module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'wip', 'feat', 'fix', 'docs', 'refactor', 'style', 'test', 'chore', 'revert', 'perf'
    ]]
  }
};
