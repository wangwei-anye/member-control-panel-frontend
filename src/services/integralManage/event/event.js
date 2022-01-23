import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询 事件列表
export async function fetchEventListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/event_info/index?${querystring}`);
}
// 新增事件
export async function addEventRequest(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/event_info/add_event`, option);
}

// 更新事件
export async function updateEventRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/event_info/update_event?${querystring}`);
}
// 后台事件管理-恢复已失效的事件
export async function recoverEventRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/event_info/recover_event?${querystring}`);
}
