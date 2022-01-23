/**
 * 账号权限管理接口
 */
import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询账号权限列表
export async function getAccount(query, formData) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/admin_user/index?${querystring}`);
}
// 创建用户
export function createAccount(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/admin_user/create`, option);
}

// 編輯用戶
export function editAccount(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/admin_user/edit`, option);
}

// 用戶詳情
export function accountDetail(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/admin_user/detail?${querystring}`);
}

// 修改用户状态
export async function updateAccountStatus(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/admin_user/update_status`, option);
}

// 修改用户权限
export async function updateAccountRights(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/admin_user/set_rights`, option);
}

// 修改用户部门
export async function updateUserPartment(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/admin_user/change_department`, option);
}

// 查詢部門
export function queryDepartment(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/department/list?${querystring}`);
}

// 新增部門
export function addDepartment(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/department/save`, option);
}

// 移動部門
export function moveDepartment(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/department/move?${querystring}`);
}
