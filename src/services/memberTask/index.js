import qs from 'qs';
import request from 'utils/request';
import { API_BASE, HEADER_TOKEN_NAME } from 'constants';
import fetch from 'dva/fetch';
import { getToken } from 'utils/session';

// 自定义发放list
export async function fetchCustomListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member_task/list?${querystring}`);
}

// 新增自定义配置规则第一步 提交基础信息
export async function addCustomBaseRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/member_task/create`, option);
}

// 新增自定义配置规则第一步 更新基础信息
export async function updateCustomBaseRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/member_task/update`, option);
}
// 后台发放项管理-获取发放项详情
export async function fetchCustomDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member_task/detail?${querystring}`);
}

// 查询主账户积分
export async function fetchAccoutDetail(id) {
  return request(`${API_BASE}/business_account/detail?account_id=${id}`);
}
// 自定义配置 事件实列 list
export async function eventExampleListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member_task/event_instance_list?${querystring}`);
}
// 自定义配置 增加事件实列
export async function addEventExampleRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/member_task/add_event_instance`, option);
}

// 自定义配置 删除事件实列
export async function deleteEventExampleRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/member_task/del_event_instance`, option);
}

// 自定义配置 更新事件实列
export async function updateEventExampleRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/member_task/update_event_instance`, option);
}

// 排序
export async function changePositionRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/member_task/custom_sort`, option);
}

// 下架
export async function updateCustomStatusRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/member_task/off`, option);
}
