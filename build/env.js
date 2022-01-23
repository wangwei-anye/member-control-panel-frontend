const pkg = require('../package.json');

const setEnv = function(envName) {
  process.env.NODE_ENV = envName;
  if (typeof pkg._env_[envName] === 'object') {
    Object.entries(pkg._env_[envName]).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
};

module.exports = setEnv;
