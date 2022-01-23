/**
 * 用户信息管理接口
 */
import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询用户列表
export async function fetchUserList(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  if (query.register_time) {
    query.register_time = parseInt(
      new Date(query.register_time).getTime() / 1000,
      10
    );
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/index?${querystring}`);
}

export async function fetchUserRecord(query) {
  return request(`${API_BASE}/member/details?id=${parseInt(query.id, 10)}`);
}

export async function fetchUserAction(query) {
  return request(`${API_BASE}/member/action?id=${parseInt(query.id, 10)}`);
}

export async function fetchUserIntegral(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/integral_flow?${querystring}`);
}

export async function fetchUserCoupon(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/coupon_list?${querystring}`);
}

export async function fetchUserLog(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/update_log?${querystring}`);
}

// 获取用户搜索框筛选权限
export async function fetchUserSearchRightRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/select?${querystring}`);
}

// 會員畫像
export async function fetchMemberAnalysis(id) {
  return request(`${API_BASE}/member/personal_portray?id=${id}`);
}

// 積分有效期
export async function getPointsValidList(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/points_valid?${querystring}`);
}
// 凍結積分
export async function getFreezeRecord(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/member/freeze_record?${querystring}`);
}

export async function getMemberUserInfo(id) {
  return request(`${API_BASE}/member/user_info?id=${id}`);
}
