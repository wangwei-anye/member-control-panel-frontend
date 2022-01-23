import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询手动发放审批列表
export async function fetchListRequest(query) {
  // 增加一个类型
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/approval/index?${querystring}`);
}
// 审核日志
export async function fetchLogListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/check_log/detail?${querystring}`);
}
// 审批详情
export async function fetchDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/approval/detail?${querystring}`);
}
// 审批通过或者拒绝
export async function approvePassOrRejectRequst(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/approval/do_approval?${querystring}`);
}
// 审批通过或者拒绝
export async function approveFinancePassOrRejectRequst(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/approval/finance_do_approval?${querystring}`);
}
