import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 查询列表
export async function fetchBusinessAccountList(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/business_account/list?${querystring}`);
}
// 禁用/解禁运营账户
export async function blockAccout(id) {
  const option = {
    method: 'POST',
    body: JSON.stringify({ account_id: id }),
  };
  return request(`${API_BASE}/business_account/block`, option);
}
// 账户详情
export async function fetchAccoutDetail(id) {
  return request(`${API_BASE}/business_account/detail?account_id=${id}`);
}
// 账户详情积分详情
export async function fetchAccoutPointsDetail(union_id) {
  return request(
    `${API_BASE}/business_account/sub_account_transfer_record?union_id=${union_id}`
  );
}
// 账户详情
export async function fetchAccoutCcConcats() {
  return request(`${API_BASE}/business_balance/cc_contacts`);
}
// 获取抄送列表
export async function fetchAccountNoticeEmails() {
  return request(`${API_BASE}/business_account/notice_emails`);
}
// 追加子賬戶積分
export async function addSubAccountPoint(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/business_account/child_apply`, option);
}
// 编辑抄送列表
export async function updateNoticeEmails(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/business_account/notice_emails`, option);
}
// 删除账户
export async function deleteAccount(id) {
  const option = {
    method: 'POST',
    body: JSON.stringify({ account_id: id }),
  };
  return request(`${API_BASE}/business_account/delete_account`, option);
}
// 新增运营账户
export async function addBusinessAccount(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/business_account/create`, option);
}
// 新增运营账户
export async function updateBusinessAccount(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/business_account/update`, option);
}

// 會員账户积分余额(2.0)
export async function getMemberBalanceList(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/account_balance/balance_account?${querystring}`);
}

// 商家账户积分余额(2.0)
export async function getAccountBalanceList(query) {
  if (query.pageSize) {
    delete query.pageSize;
  }
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/account_balance/balance?${querystring}`);
}

// 用户、商家账户禁用，解禁
export async function blockAccountRequest(query) {
  const option = {
    method: 'POST',
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/account/block`, option);
}

// 查询積分過期餘額
export async function fetchBalanceExpired(query) {
  const querystring = qs.stringify(query);
  return request(
    `${API_BASE}/account_balance/expired_statistics?${querystring}`
  );
}
