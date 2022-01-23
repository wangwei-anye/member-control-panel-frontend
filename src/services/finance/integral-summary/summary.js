import qs from 'qs';
import request from 'utils/request';
import { API_BASE, HEADER_TOKEN_NAME } from 'constants';
import { getUserSession } from 'utils/session';

// 积分余额变动汇总
export async function fetchBalanceListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/point_collect/balance_list?${querystring}`);
}

// 积分余额变动汇总 導出
export async function balanceListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/point_collect/balance_export`, option);
}

// 应发积分汇总
export async function fetchReleaseListRequest(query) {
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/estimate_offer_statistics/list?${querystring}`);
}

// 应发积分汇总 導出
export async function releaseListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(
    `${API_BASE}/point_collect/release_points_detail_export`,
    option
  );
}

// 应发积分汇总项目列表
export async function fetchProjectListRequest() {
  return request(`${API_BASE}/estimate_offer_statistics/project_list`);
}
// 系统账户 | 积分发放汇总
export async function fetchSystemListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/point_collect/offer_list?${querystring}`);
}

// 系统账户 | 积分发放汇总 導出
export async function systemListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/point_collect/offer_export`, option);
}

// 积分消费汇总
export async function fetchConsumListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/point_collect/transact_list?${querystring}`);
}

// 积分消费汇总 導出
export async function consumListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/point_collect/transact_export`, option);
}

// BU积分变动汇总
export async function fetchBUListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/point_collect/department_list?${querystring}`);
}
// BU 部门账户积分流水汇总列表
export async function fetchBUPartmentListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(
    `${API_BASE}/point_collect/bu_account_points_list?${querystring}`
  );
}
// BU账户积分变动走势
export async function fetchBUTrendRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/point_collect/bu_points_diagram?${querystring}`);
}

// 收分子帳戶餘額變動管理
export async function fetchSubAccountBalanceRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/point_collect/sub_income_account?${querystring}`);
}
