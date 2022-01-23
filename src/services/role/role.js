/**
 * 角色管理接口
 */
import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询角色列表
export async function getRoles(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/admin_group/list?${querystring}`);
}
// 查询所有角色列表（下拉列表专用）
export async function getRolesAll(query) {
  return request(`${API_BASE}/admin_group/all_list`);
}
// 查询角色权限列表
export async function getRights() {
  return request(`${API_BASE}/admin_group/right_menu`);
}
// 创建角色
export async function createRole(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/admin_group/create`, option);
}
// 修改角色
export async function updateRole(formData) {
  const option = {
    method: 'POST',
    body: JSON.stringify(formData),
  };
  return request(`${API_BASE}/admin_group/update`, option);
}

// 查询账号列表by 角色
export async function getAccount(query, formData) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/admin_group/role_users?${querystring}`);
}

// 查询账号列表by 部门
export async function getAccountByDepart(query, formData) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/admin_user/index?${querystring}`);
}

// 移除账号
export async function removeAccount(query, formData) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/admin_group/removes?${querystring}`);
}

// 添加账号
export async function addAccount(query, formData) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/admin_group/adds?${querystring}`);
}
