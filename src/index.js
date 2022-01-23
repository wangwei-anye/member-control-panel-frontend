import dva from 'dva';
import * as history from 'history';
import authModel from 'models/auth';
import systemModel from 'models/system';
import { BROWSER_HISTORY } from './constants';
import router from './router';

import './index.less';

const appOptions = {
  onError(e, dispatch) {
    console.log('接口调用异常：', e);
  }
};

if (BROWSER_HISTORY) {
  appOptions.history = history.createBrowserHistory();
}

// 1. Initialize
const app = dva(appOptions);

// 2. Plugins
// app.use({});

// 3. Model
app.model(authModel);
app.model(systemModel);

// 4. Router
app.router(router);

// 5. Start
app.start('#root');
const MCP_01 = {
  version: '1.2.0 积分专区',
  env: process.env.environment
};

window.MCP_01 = MCP_01;
window.isProduction = process.env.environment === 'production';
