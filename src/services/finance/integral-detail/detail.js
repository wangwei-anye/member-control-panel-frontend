import qs from 'qs';
import request from 'utils/request';
import { API_BASE, HEADER_TOKEN_NAME } from 'constants';
import { getUserSession } from 'utils/session';

// 积分变动明细
export async function fetchChangeListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_detail/index?${querystring}`);
}

// 积分变动明细 導出
export async function changeListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/point_collect/points_all_detail_export`, option);
}

// 用户积分发放明细
export async function fetchUserListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_detail/user_offer_list?${querystring}`);
}

// 用户积分发放明细 導出
export async function userListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(
    `${API_BASE}/point_collect/points_user_offer_detail_export`,
    option
  );
}

// 积分消费明细
export async function fetchConsumListRequest(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  query = Object.assign({}, { action: 'get' }, query);
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_detail/consume_list?${querystring}`);
}

// 积分消费明细 導出
export async function consumListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(
    `${API_BASE}/point_collect/points_consume_detail_export`,
    option
  );
}

// 积分变动明细-积分明细各列表需加载的下拉搜索配置
export async function fetchPointDetailSearchConfigRequest(query) {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/points_detail/search_config?${querystring}`);
}
