import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// list
export async function fetchDivisionListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/hot_activity/list?${querystring}`);
}

// detail
export async function fetchDivisionDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/hot_activity/detail?${querystring}`);
}

export async function updateOrAddDivisionRequest(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/hot_activity/addAndUpdate`, option);
}

export async function publistOrCancelDivisionRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/hot_activity/publish?${querystring}`);
}

export async function deleteDivisionRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/hot_activity/delete?${querystring}`);
}

export async function fetchTaskDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_task/detail?${querystring}`);
}

export async function addOrUpdateTaskRequest(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query)
  };
  return request(`${API_BASE}/points_task/addAndUpdate`, option);
}
