import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询 事件列表
export async function fetchLogListRequset(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/offer_rule/index?${querystring}`);
}
