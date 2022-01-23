import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询用户列表
export async function fetchIntegralData(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/balance_count?${querystring}`);
}
