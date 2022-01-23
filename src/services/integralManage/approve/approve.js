import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询 运营账户申请审批列表
export async function fetchApproveList(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/business_account/applications?${querystring}`);
}
// 根据部门查询账户
export async function fetchAccountByDepartment(query) {
  const querystring = qs.stringify(Object.assign({}, { is_filter: 0 }, query));
  return request(`${API_BASE}/business_account/get_names?${querystring}`);
}
// 查询审评详情
export async function fetchApplicationDetail(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/business_account/app_detail?${querystring}`);
}
export async function addApplication(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/business_account/add_app`, option);
}
// 更新审批
export async function updateApplication(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/business_account/update_app`, option);
}

// 删除审批
export async function deleteApplication(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/business_account/del_app`, option);
}
// 取消 / 撤回 审批
export async function cancelApplication(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/business_account/app_rollback`, option);
}
