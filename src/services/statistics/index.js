/**
 * 用户信息管理接口
 */
import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询用户列表
export async function getIndexData() {
  return request(`${API_BASE}/app_info/index`);
}
export async function getItemData(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/app_info/list_detail`, option);
}
