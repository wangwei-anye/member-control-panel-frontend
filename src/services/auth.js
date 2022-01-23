/**
 * 用户授权相关接口
 */
import qs from 'qs';
import request from 'utils/request';
import { API_AUTH_BASE } from 'constants';

// 授权链接
export const authApi = `${API_AUTH_BASE}login/index`;

// 查询用户登录信息
export async function getLoginInfo(query) {
  const querystring = qs.stringify(query);
  return request(`/api/login/info?${querystring}`);
}
