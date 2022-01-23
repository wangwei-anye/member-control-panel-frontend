import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询用户列表
export async function fetchBudgetList(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  // 增加一个类型
  const querystring = qs.stringify(Object.assign({}, query, { type: 1 }));
  return request(`${API_BASE}/business_account/applications?${querystring}`);
}
// 审核日志
export async function fetchLogListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/check_log/detail?${querystring}`);
}
// 积分额度审批详情
export async function fetchBudgetDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/business_account/app_detail?${querystring}`);
}
// 审批通过或者拒绝
export async function approvePassOrRejectRequst(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/business_account/app_treasure_check`, option);
}
// 审批通过或者拒绝
export async function approveFinancePassOrRejectRequst(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(
    `${API_BASE}/business_account/app_finance_treasure_check`,
    option
  );
}
