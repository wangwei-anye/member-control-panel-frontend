import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 积分专区各列表
export const getListRequest = (query) => {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_area/list?${querystring}`);
};

// 积分专区-任务/推荐内容详情
export const getDetailRequest = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_area/detail?${querystring}`);
};

// 积分专区-发布/取消发布数据
export const publishOrCancelRequest = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_area/publish?${querystring}`);
};

// 推薦专区-批量-发布/取消发布数据
export const bitchPublishOrCancelRequest = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/special_area/recommond_status?${querystring}`);
};

// 积分专区-删除活动/任務
export const deleteRequest = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_area/delete?${querystring}`);
};

// 新增/更新内容
export const addOrUpdateDetailRequest = (query) => {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/points_area/addAndUpdate`, option);
};

// 更改排序位置
export const changePositionRequest = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_area/change_position?${querystring}`);
};

// 新增/更新推广活动(彩蛋)
export const addOrUpdateDiscountConfigRequest = (query) => {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/points_area/put_promotional_activity`, option);
};

// 推广活动详情
export const getPromotionalActivityDetailRequest = (query) => {
  const querystring = qs.stringify(query);
  return request(
    `${API_BASE}/points_area/promotional_activity_detail?${querystring}`
  );
};

// 推广活动列表
export const getPromotionalActivityListRequest = (query) => {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(
    `${API_BASE}/points_area/promotional_activity_list?${querystring}`
  );
};
