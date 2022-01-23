const Bundler = require('parcel-bundler');
const setEnv = require('./env');

// parcel-bundler配置
const options = {
  watch: false,
  minify: true,
  cache: true,
  sourceMaps: true,
  publicUrl: './',
  hmr: true, // 请勿关闭此项，必须开启hmr才能正常生产
};

if (process.argv[2] === '--prod') {
  // 生产环境
  setEnv('production');
  options.cache = false;
  options.sourceMaps = false; // 生产环境关闭sourceMaps
} else if (process.argv[2] === '--test') {
  // 测试环境
  setEnv('testing');
  process.env.NODE_ENV = 'production'; // 保证代码和生产环境一致
} else {
  // 开发环境
  setEnv('development');
}

const bundler = new Bundler('index.html', options);
bundler.bundle();
