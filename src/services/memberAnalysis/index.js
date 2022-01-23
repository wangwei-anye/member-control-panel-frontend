import qs from 'qs';
import request from 'utils/request';
import { API_BASE } from 'constants';

// 会员画像
export const getPortrait = () => {
  return request(`${API_BASE}member/portrait`);
};

// 会员趋势-会员概览
export const getOverview = date => {
  return request(`${API_BASE}member/overview?date=${date}`);
};

// 会员趋势-会员注册来源分析
export const getRegisterSource = (start, end) => {
  return request(`${API_BASE}member/register_source?start_time=${start}&end_time=${end}`);
};

// 会员趋势-推荐会员情况
export const getReferral = () => {
  return request(`${API_BASE}member/referral`);
};

// 会员趋势-合并会员情况
export const getMerge = () => {
  return request(`${API_BASE}member/merge`);
};

// 会员趋势-会员注册走势图
export const getRegisterChart = (start, end) => {
  return request(`${API_BASE}member/register_chart?start_date=${start}&end_date=${end}`);
};
