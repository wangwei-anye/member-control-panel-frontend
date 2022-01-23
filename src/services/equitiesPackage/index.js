import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';
import { getToken } from 'utils/session';

export const getList = query => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_offer_package/list?${querystring}`);
};

export const getDetail = query => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_offer_package/detail?${querystring}`);
};

export const setStatus = query => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_offer_package/status?${querystring}`);
};

export const getHistoryList = query => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_offer_package/offer_list?${querystring}`);
};

export const createPackage = query => {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/points_offer_package/add`, option);
};

export const updatePackage = query => {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/points_offer_package/update`, option);
};

/**
 * 下载筛选结果
 * @param {Object} info { id: number, password: md5String, action }
 */
export const download = info => {
  const query = {
    'mc-admin-api-key': getToken(),
    action: 'download',
    ...info
  };
  const querystring = qs.stringify(query);
  const a = document.createElement('a');
  a.setAttribute('download', '');
  a.setAttribute(
    'href',
    `${API_BASE}points_offer_package/download?${querystring}`
  );
  a.click();
};
