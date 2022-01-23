import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';
import { getToken } from 'utils/session';

export const addTask = (query) => {
  const options = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}task_center/add_task`, options);
};

// 批量导出列表
export const fetchList = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}task_center/index?${querystring}`);
};

// 任务中心列表
export const fetchTaskList = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}task_flow/list?${querystring}`);
};

// 修改任务状态
export const changeStatus = (info) => {
  const querystring = qs.stringify(info);
  return request(`${API_BASE}task_center/change_status?${querystring}`);
};

// 预览
export const previewExcelList = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}task_center/preview?${querystring}`);
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
  if (query.action === 'check_pw') {
    return request(
      `${API_BASE}task_center/download_select_result?${querystring}`
    );
  }
  const a = document.createElement('a');
  a.setAttribute('download', '');
  a.setAttribute(
    'href',
    `${API_BASE}task_center/download_select_result?${querystring}`
  );
  a.click();
};
