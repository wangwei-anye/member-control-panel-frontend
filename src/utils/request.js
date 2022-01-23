import fetch from 'dva/fetch';
import { message } from 'antd';
import { HEADER_TOKEN_NAME, BROWSER_HISTORY } from 'constants';
import { getToken } from './session';

const expireValveDuration = 10e3; // 接口过期处理后多少秒内保持静默，默认10秒
let expireValveOn = false; // 接口过期处理开关

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const token = getToken();
  // 配置默认headers
  const headers = Object.assign(
    {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    options && options.headers
  );
  if (options && options.body && options.body instanceof FormData) {
    delete headers['Content-Type'];
  }
  if (token) {
    headers[HEADER_TOKEN_NAME] = token;
  }

  // 配置默认设置
  const settings = Object.assign(
    {
      method: 'GET',
      mode: 'cors',
    },
    options,
    { headers }
  );
  // 修复url中多余的斜杠
  const fixUrl = url.replace(/\/\//g, '/').replace(/:\/([^/])/, '://$1');
  // 非GET方式不允许缓存
  if (settings.method.toUpperCase() !== 'GET') {
    settings['Cache-Control'] = 'no-cache';
  }
  return fetch(fixUrl, settings)
    .then(checkStatus)
    .then(parseJSON)
    .then((data) => {
      if (data.code === 4001 && !expireValveOn) {
        // 会话已失效
        expireValveOn = true;
        const returnUrl = window.location.href;
        window.sessionStorage.setItem(
          'MCP_01_RETURN_URL',
          encodeURIComponent(returnUrl)
        );
        if (BROWSER_HISTORY) {
          window.location.href = '/logout';
        } else {
          window.location.hash = '#/logout';
        }
        setTimeout(() => (expireValveOn = false), expireValveDuration);
      }
      if (!data.status && data.code !== 4001) {
        message.destroy();
        message.error(data.message || '服務異常');
      }
      return { data };
    })
    .catch((err) => {
      message.error('服務異常');
      return { err };
    });
}
