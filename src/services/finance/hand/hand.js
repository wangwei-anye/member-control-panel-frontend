import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';
import { getToken } from 'utils/session';

// 查询手动发放审批列表
export async function fetchBudgetList(query) {
  // 增加一个类型
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(Object.assign({}, query, { type: 1 }));
  return request(`${API_BASE}/manual/list?${querystring}`);
}
// 审核日志
export async function fetchLogListRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/check_log/detail?${querystring}`);
}
// 审批详情
export async function fetchDetailRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/manual/detail?${querystring}`);
}
// 审批通过或者拒绝
export async function approvePassOrRejectRequst(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/manual/department_check`, option);
}
// 审批通过或者拒绝
export async function approveFinancePassOrRejectRequst(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/manual/finance_department_check`, option);
}
// 预览
export const previewExcelList = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}manual/preview?${querystring}`);
};

// 檢查是否 10000條處理完
export const checkResult = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}manual/get_async_check_result?${querystring}`);
};

/**
 * 下载筛选结果
 * @param {Object} info { id: number, password: md5String, action }
 */
export const download = (info) => {
  const query = {
    'mc-admin-api-key': getToken(),
    action: 'download',
    ...info,
  };
  const querystring = qs.stringify(query);
  const a = document.createElement('a');
  a.setAttribute('download', '');
  a.setAttribute(
    'href',
    `${API_BASE}task_center/download_select_result?${querystring}`
  );
  a.click();
};
