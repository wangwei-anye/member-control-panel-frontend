import qs from 'qs';
import request from 'utils/request';
import { API_BASE, HEADER_TOKEN_NAME } from 'constants';
import fetch from 'dva/fetch';
import { getToken } from 'utils/session';

export const fetchList = query => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/qr_code/offer_entry_list?${querystring}`);
};

export const getQrcodeAccountList = query => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/qr_code/account_list?${querystring}`);
};


// 获得
export async function getImgRequest(url) {
  const option = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    headers: {
      [HEADER_TOKEN_NAME]: getToken()
    }
  };
  try {
    const res = await fetch(url, option);
    const blobUrl = await res.blob();
    return blobUrl;
  } catch (error) {
    console.log(error);
    return Promise.reject(url);
  }
}

export async function fileUpload(file) {
  return fetch(`${API_BASE}file_upload`, {
    method: 'POST',
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    body: file,
    headers: {
      [HEADER_TOKEN_NAME]: getToken()
    }
  });
}
