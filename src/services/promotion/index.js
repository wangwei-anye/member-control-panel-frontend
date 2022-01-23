import qs from 'qs';
import request from 'utils/request';
import { API_BASE, HEADER_TOKEN_NAME } from 'constants';
import fetch from 'dva/fetch';
import { getToken, getUserSession } from 'utils/session';

// 推广活动列表
export const fetchList = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/activity/list?${querystring}`);
};

// 推广活动详情
export const fetchDetail = (id) => {
  const querystring = qs.stringify({ id });
  return request(`${API_BASE}/activity/detail?${querystring}`);
};

// 新增或者更新模板
export const saveDetail = (info) => {
  const options = {
    method: 'POST',
    body: JSON.stringify(info),
  };
  return request(`${API_BASE}/activity/save`, options);
};

// 保存答题设置
export const saveQuestion = (info) => {
  const options = {
    method: 'POST',
    body: JSON.stringify(info),
  };
  return request(`${API_BASE}/activity/question_save`, options);
};

// 删除活动详情
export const deletePromotion = (id) => {
  const querystring = qs.stringify({ id });
  return request(
    `${API_BASE}/points_area/delete_promotional_activity?${querystring}`
  );
};

// 获得题干列表
export const getStemList = () => {
  return request(`${API_BASE}/question_data/get_stem_list`);
};

// 获得题干选项列表
export const getStemOptions = (id) => {
  return request(`${API_BASE}/question_data/get_options?id=${id}`);
};

// 推广活动更新
export const changePromotionStatus = (id, status) => {
  const querystring = qs.stringify({ id, status });
  return request(`${API_BASE}/activity/status?${querystring}`);
};

// 根据活动id获得该活动的答题数据
export const getActivityQuestion = (id) => {
  const querystring = qs.stringify({ activity_id: id });
  return request(
    `${API_BASE}/question_data/get_activity_question?${querystring}`
  );
};

// 推广活动状态更新
export const changeActivityStatus = (id, status) => {
  const querystring = qs.stringify({ id, status });
  return request(`${API_BASE}/activity/status?${querystring}`);
};

// 获取领取记录
export const getRecordList = (query) => {
  const querystring = qs.stringify(query);
  return request(
    `${API_BASE}/points_area/promotional_activity_record?${querystring}`
  );
};

// 获取领取记录  導出
export async function recordListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(
    `${API_BASE}/points_area/promotional_activity_record_export`,
    option
  );
}
// 領取記錄-停止發放
export const stopGrant = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/activity/stop_grant?${querystring}`);
};

// 領取記錄-停止發放
export const resend = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/activity/resend?${querystring}`);
};

// 到处领取记录
export const exportRecordList = (query) => {
  const querystring = qs.stringify(query);
  return request(
    `${API_BASE}/points_area/promotional_activity_export_record?${querystring}`
  );
};

// 题库列表
export const getOriginQuestionList = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/origin_question/list?${querystring}`);
};

// 题库詳情
export const getOriginQuestionDeatil = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/origin_question/detail?${querystring}`);
};

// 题库編輯
export const originQuestionEdit = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/origin_question/edit?${querystring}`);
};

// 答题统计
export const getAnswerTotal = (query) => {
  const querystring = qs.stringify(query);
  return request(`${API_BASE}/question/answer_total?${querystring}`);
};

// 答题统计  導出
export async function answerListExport(query) {
  const session = getUserSession();
  const option = {
    method: 'POST',
    headers: {
      [HEADER_TOKEN_NAME]: session.jwt,
    },
    body: JSON.stringify(query),
  };
  return request(`${API_BASE}/question/answer_total_export`, option);
}

// 获得
export async function getImgRequest(url) {
  const option = {
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    headers: {
      [HEADER_TOKEN_NAME]: getToken(),
    },
  };
  try {
    const res = await fetch(url, option);
    const blobUrl = await res.blob();
    return blobUrl;
  } catch (error) {
    console.log(error);
    return Promise.reject(url);
  }
}

export async function fileUpload(file) {
  return fetch(`${API_BASE}file_upload`, {
    method: 'POST',
    mode: 'cors',
    cache: 'default',
    credentials: 'include',
    body: file,
    headers: {
      [HEADER_TOKEN_NAME]: getToken(),
    },
  });
}
