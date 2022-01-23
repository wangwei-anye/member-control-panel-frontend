import qs from 'qs';
import request from 'utils/request';
import { API_BASE, HEADER_TOKEN_NAME } from 'constants';
import fetch from 'dva/fetch';
import { getToken } from 'utils/session';

// 事件上报渠道
export async function fetchReportChannelListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/event_info/report_channels?${querystring}`);
}

// 部门列表
export async function fetchDepartmentList() {
  return request(`${API_BASE}/department`);
}

export async function getImgRequest(url) {
  const postUrl = url;
  const option = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    headers: {
      [HEADER_TOKEN_NAME]: getToken()
    }
  };
  return fetch(postUrl, option).then(res => {
    return res.blob();
  });
}
export async function downloadFileRequest(url, data, name = '') {
  data = Object.assign({}, { action: 'export' }, data);
  const querystring = qs.stringify(data);
  const postUrl = `${API_BASE}${url}?${querystring}`;
  const option = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    headers: {
      [HEADER_TOKEN_NAME]: getToken()
    }
  };
  return fetch(postUrl, option)
    .then(res => {
      return res.blob();
    })
    .then(res => {
      const _url = URL.createObjectURL(res);
      const a = document.createElement('a');
      a.download = name;
      a.rel = 'noopener';
      a.href = _url;
      // 触发模拟点击
      a.dispatchEvent(new MouseEvent('click'));
      URL.revokeObjectURL(_url);
    });
}

// 部门列表
export async function updateAccountStatus(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/account_ban/status?${querystring}`);
}
