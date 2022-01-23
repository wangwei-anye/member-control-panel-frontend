import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询 手动发放列表
export async function fetchHandListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/manual/list?${querystring}`);
}
export async function fetchHandDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/manual/detail?${querystring}`);
}
// 查找用户
export async function fetchMemberRequest(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/member/search`, option);
}
// 创建手动发放
export async function createHandRequest(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/manual/create`, option);
}
// 删除手动发放
export async function deleteHandRequest(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/manual/delete`, option);
}

// 自定义发放list
export async function fetchCustomListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/offer_entry/custom_index?${querystring}`);
}

// 更改自定义发放项的各种状态
export async function updateCustomStatusRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/offer_entry/change_status?${querystring}`);
}
// 自定义配置 事件实列 list
export async function eventExampleListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/event_info/instance_list?${querystring}`);
}
// 后台发放项管理-获取发放项详情
export async function fetchCustomDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/offer_entry/entry_detail?${querystring}`);
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
  return request(`${API_BASE}/event_info/add_instance`, option);
}

// 自定义配置 更新或删除事件实列
export async function updateEventExampleRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/event_info/update_instance`, option);
}
// 查询主账户积分
export async function fetchAccoutDetail(id) {
  return request(`${API_BASE}/business_account/detail?account_id=${id}`);
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
  return request(`${API_BASE}/offer_entry/add_entry`, option);
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
  return request(`${API_BASE}/offer_entry/update_entry`, option);
}

// 固定發放項list
export async function fetchFixedListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/offer_entry/entry_group?${querystring}`);
}

// 固定发放详情list
export async function fetchFixedDetailListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/offer_entry/index?${querystring}`);
}

// 后台发放项管理-新增固定发放项分渠道配置
export async function addFixedChannelEntryRequest(query) {
  const option = {
    method: 'POST',
    body: qs.stringify(query),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };
  return request(`${API_BASE}/offer_entry/operate_channel_entry`, option);
}
