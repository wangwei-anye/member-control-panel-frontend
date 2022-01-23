/**
 * 工具函数集
 */
import fecha from 'fecha';
import qs from 'qs';
import Chance from 'chance';
import ExportJsonExcel from 'js-export-excel';
import { message } from 'antd';
import { MD5 } from 'crypto-js';
import moment from 'moment';
import _pick from 'lodash/pick';
import _toArray from 'lodash/toArray';

import { API_BASE, HEADER_TOKEN_NAME } from '../constants';
import { getUserSession } from './session';

export { getHumanDate, isToday, isWeek, isMonth, isYear } from './time';
// hk01 auth认证
const ksort = require('locutus/php/array/ksort');
const sprintf = require('locutus/php/strings/sprintf');
const sha1 = require('locutus/php/strings/sha1');
const rawurlencode = require('locutus/php/url/rawurlencode');

export const genSignature = (params, secret) => {
  ksort(params);
  let str = '';
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value) {
      str += sprintf('%s=%s', rawurlencode(key), rawurlencode(value));
    }
  });
  return sha1(sprintf('%s.%s', str, secret));
};

export function convertValidDateToText(offer_points_valid_date) {
  if (offer_points_valid_date) {
    const { type, period } = offer_points_valid_date;
    if (type === 'fixed_date') {
      return `${period}之前有效`;
    }
    return `領取之日起${period}天内有效`;
  }
  return '-';
}

/**
 * 将key字符串转换成驼峰方式命名（如 "someName"） 的字符串
 * @param key string类型
 * @param separators key分隔符 "-"中划线/"_"下划线
 */
export function camelizeKey(key, separators = ['-', '_']) {
  const out = [];
  let i = 0;
  const separatorsSet = new Set(separators);
  while (i < key.length) {
    if (separatorsSet.has(key[i])) {
      out.push(key[i + 1].toUpperCase());
      i += 1;
    } else {
      out.push(key[i]);
    }
    i += 1;
  }
  return out.join('');
}

/**
 * 将对象键值对中的 key 转换为按照驼峰方式命名的 key
 * @param obj
 */
export function camelize(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (obj instanceof Array) {
    return obj.map((item) => {
      return camelize(item);
    });
  }
  if (typeof obj === 'object') {
    const out = {};
    for (const key in obj) {
      const v = obj[key];
      out[camelizeKey(key)] = camelize(v);
    }
    return out;
  }
  return obj;
}

/**
 * 生成全局唯一标识符
 * @return {string} 16进制唯一标识符
 */
export const createGUID = () => {
  const chance = new Chance();
  return chance.guid();
};

/**
 * 日期格式化函数
 * @param  {Date}   date   将要格式化的日期
 * @param  {String} format 转化格式，默认YYYY-MM-DD hh:mm:ss
 * @return {string}        返回字符串形式的格式化后的日期
 */
export const dateFormat = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return date;
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return fecha.format(date, format);
};

/**
 * 深拷贝
 * 可确保任何情况下，对象都能被正确深拷贝
 * @param  {object} obj 将要拷贝的对象
 * @return {object}     深拷贝后的对象
 */
export const deepCopy = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  let result;
  if (Array.isArray(obj)) {
    result = [];
    obj.forEach((item) => {
      result.push(
        typeof item === 'object' && !(item instanceof Date)
          ? deepCopy(item)
          : item
      );
    });
  } else {
    result = {};
    Object.keys(obj).forEach((key) => {
      result[key] =
        typeof obj[key] === 'object' && !(obj[key] instanceof Date)
          ? deepCopy(obj[key])
          : obj[key];
    });
  }
  // }
  return result;
};

/**
 * 解析url search字符串
 * @param {String}  search 形如：?pageNo=1&pageSize=10
 * @param {Boolean} trim   是否裁剪前后空格，缺省裁剪
 */
export const parseSearch = (search, trim = true) => {
  const querystring = (search || '').replace(/^\?/, '');
  const ret = qs.parse(querystring);
  for (const k in ret) {
    if (ret[k] === '') {
      delete ret[k];
    } else if (trim && typeof ret[k] === 'string') {
      ret[k] = ret[k].trim();
    }
  }
  return ret;
};

/**
 * 格式化表单数据以便提交
 * @param {Object} formData
 * @param {Boolean} trim   是否裁剪前后空格，缺省裁剪
 */
export const formatFormData = (formData, trim = true) => {
  const isArray = Array.isArray(formData);
  const ret = isArray ? [] : {};
  for (const k in formData) {
    const item = formData[k];
    let tmp;
    if (typeof item === 'undefined' || item === null || item === '') continue;
    if (typeof item.utc === 'function' && typeof item.format === 'function') {
      // Moment 对象
      tmp = item.format();
    } else if (typeof item === 'object' && !(item instanceof Date)) {
      // 递归处理
      tmp = formatFormData(item);
    } else if (trim && typeof item === 'string') {
      tmp = item.trim();
    } else {
      tmp = item;
    }
    if (isArray) {
      ret.push(tmp);
    } else {
      ret[k] = tmp;
    }
  }
  return ret;
};

/**
 * 复制字符串到粘贴板
 * @param  {string} str 将要复制的字符串
 */
export const copyString = (str) => {
  const copyDom = document.createElement('input');
  copyDom.setAttribute('type', 'text');
  copyDom.setAttribute('value', str);
  copyDom.setAttribute('style', 'width:1;height:1');
  document.body.appendChild(copyDom);
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        copyDom.select();
        document.execCommand('Copy');
        document.body.removeChild(copyDom);
        resolve(true);
      } catch (err) {
        resolve(false);
      }
    }, 100);
  });
};

/**
 * 将指定节点全屏
 * @param  {DOM} dom 要全屏的dom节点，默认为body
 */
export const fullScreen = (dom = document.body) => {
  if (document.documentElement.requestFullscreen) {
    dom.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullScreen) {
    dom.webkitRequestFullScreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    dom.mozRequestFullScreen();
  } else if (document.documentElement.msRequestFullscreen) {
    dom.msRequestFullscreen();
  }
};

/**
 * 退出全屏
 */
export const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msCancelFullScreen) {
    document.msCancelFullScreen();
  }
};

/**
 * 把数据格式化成 千分位  eg:1232,234.99
 */
export const thousandFormat = (num) => {
  if (!num) {
    return 0;
  }
  const str = typeof num === 'string' ? num : num.toString();
  const re = /\d{1,3}(?=(\d{3})+$)/g;
  const n1 = str.replace(/^(\d+)((\.\d+)?)$/, (s, s1, s2) => {
    return s1.replace(re, '$&,') + s2;
  });
  return n1;
};

/**
 * 格式化數字為 萬，千萬，億 eg: 10000 -> 1萬
 * @param {number|string} num 數字或者字符串數字
 * @param {number} wLen ‘万’ 位数
 * @param {number} wFloat '万'小数位数
 */
export const numChineseFormat = (num, wLen = 6, wFloat = 2) => {
  const str = num.toString();
  const pointIndex = str.indexOf('.');
  const hasPoint = pointIndex > -1;
  let intPart = '';
  let pointPart = '';
  if (hasPoint) {
    intPart = str.slice(0, pointIndex);
    pointPart = str.slice(pointIndex);
  } else {
    intPart = str;
  }
  if (intPart.length >= 9) {
    // 亿
    return (
      thousandFormat((parseInt(intPart, 10) / 100000000).toFixed(2)) + '億'
    );
  } else if (intPart.length >= 8) {
    // 千萬
    return (parseInt(intPart, 10) / 10000000).toFixed(2) + '千萬';
  } else if (intPart.length >= wLen) {
    return (parseInt(intPart, 10) / 10000).toFixed(wFloat) + '萬';
  }
  // 6位數以下
  if (pointPart.length) {
    return thousandFormat(parseInt(num, 10).toFixed(2));
  }
  return thousandFormat(num);
};

// 根据 urllink 地址判断是不是 图片，这里只是根据后缀来判断
export const isImgByUrlLing = (str) => {
  // const imgTypeList = ['png', 'jpg', 'bmp', 'jpeg'];
  // const strArr = str.split('.');
  // const strType = strArr[1] ? strArr[1] : '';
  // return imgTypeList.includes(strType);
  return /\.(png|jpg|bmp|jpeg)$/.test(str);
};

// list  -> 需要遍历的list，  id -> 二级部门id
export const findPartmentById = (list, id) => {
  return findPartmentByIdDandle(list, id);
};

const findPartmentByIdDandle = (list, id) => {
  let name = '';
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].id === id) {
      name = list[i].name;
    }
    if (list[i].child) {
      const tempName = findPartmentByIdDandle(list[i].child, id);
      if (tempName != '') {
        name = list[i].name + '-' + tempName;
      }
    }
  }
  return name;
};

/**
 * 判断是否有权限操作某项
 * @param {权限list}} rightList  ['app_info','app_info','index']
 */
export const isUserHasRights = (rightList) => {
  if (!getUserSession()) {
    return false;
  }
  const userPermissions = getUserSession().permissions;
  let permissionInfo = userPermissions;
  let hasPermission = true;
  for (let i = 0; i < rightList.length; i += 1) {
    const item = rightList[i];
    if (Array.isArray(permissionInfo)) {
      hasPermission = permissionInfo.includes(item);
      break;
    } else if (permissionInfo[item]) {
      permissionInfo = permissionInfo[item];
      hasPermission = true;
    } else {
      hasPermission = false;
      break;
    }
  }
  return hasPermission;
};

export const export2Excel = (options) => {
  options.datas.forEach((item, index, arr) => {
    const obj = Object.assign(
      {},
      {
        sheetName: 'sheet',
        columnWidths: Array.from({ length: item.sheetHeader.length }, () => 5),
      },
      item
    );
    arr[index] = obj;
  });
  const toExcel = new ExportJsonExcel(options);
  toExcel.saveExcel();
};

export const addWaterMarker = (str, el) => {
  const contentWrapDom = el || document.body;
  const waterMarkerLength = 50;
  const waterMarkerWrap = document.createElement('div');
  waterMarkerWrap.className = 'watermarker-wrap';
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < waterMarkerLength; i += 1) {
    const waterMarkerItem = document.createElement('span');
    waterMarkerItem.className = 'watermarker-item';
    waterMarkerItem.innerHTML = str;
    fragment.appendChild(waterMarkerItem);
  }
  waterMarkerWrap.appendChild(fragment);
  contentWrapDom.appendChild(waterMarkerWrap);
};

// 下载文件
export const downLoadFile = (url, postData, name = '', type) => {
  const doDownload = () => {
    const session = getUserSession();
    const query = Object.assign(
      {},
      { action: 'export', [HEADER_TOKEN_NAME]: session.jwt },
      postData
    );
    const querystring = qs.stringify(query);
    const _url = `${API_BASE}${url}?${querystring}`;
    const a = document.createElement('a');
    a.download = name;
    a.rel = 'noopener';
    a.href = _url;
    // 触发模拟点击
    a.dispatchEvent(new MouseEvent('click'));
  };
  const {
    start_time,
    end_time,
    start_date,
    end_date,
    grant_start_time,
    grant_end_time,
  } = postData;
  if (!(start_time || start_date || grant_start_time)) {
    message.error(
      '由於數據量的問題，請選擇導出的時間，並且僅支持導出同一個月內的數據'
    );
    return;
  }

  if (
    (grant_start_time && grant_start_time === grant_end_time) ||
    (start_time && start_time === end_time) ||
    (start_date && start_date === end_date)
  ) {
    message.error('導出的開始時間和結束時間不能相同!');
    return;
  }
  // if (!grant_start_time && type === 'record') {
  //   doDownload();
  //   return;
  // }
  const newStartDate = new Date(start_time || start_date || grant_start_time);
  const newEndDate = new Date(end_time || end_date || grant_end_time);
  if (
    !(
      newStartDate.getMonth() === newEndDate.getMonth() &&
      newStartDate.getFullYear() === newEndDate.getFullYear()
    )
  ) {
    message.error('僅支持導出同一個月內的數據，請優化篩選條件');
    return;
  }
  doDownload();
};

// 下载文件  2個時間  必須有一個在一個月內
export const downLoadFileUser = (url, postData, name = '', type) => {
  const doDownload = () => {
    const session = getUserSession();
    const query = Object.assign(
      {},
      { action: 'export', [HEADER_TOKEN_NAME]: session.jwt },
      postData
    );
    const querystring = qs.stringify(query);
    const _url = `${API_BASE}${url}?${querystring}`;
    const a = document.createElement('a');
    a.download = name;
    a.rel = 'noopener';
    a.href = _url;
    // 触发模拟点击
    a.dispatchEvent(new MouseEvent('click'));
  };
  const { start_time, end_time, begin_expire_at, end_expire_at } = postData;
  let hasTime = false;
  let inOneMonth = false;
  if (start_time) {
    hasTime = true;
    if (start_time === end_time) {
      message.error('導出的開始時間和結束時間不能相同!');
      return;
    }
    const newStartDate = new Date(start_time);
    const newEndDate = new Date(end_time);
    if (
      newStartDate.getMonth() === newEndDate.getMonth() &&
      newStartDate.getFullYear() === newEndDate.getFullYear()
    ) {
      inOneMonth = true;
    }
  }
  if (begin_expire_at) {
    hasTime = true;
    if (begin_expire_at === end_expire_at) {
      message.error('導出的開始時間和結束時間不能相同!');
      return;
    }
    const newStartDate = new Date(begin_expire_at);
    const newEndDate = new Date(end_expire_at);
    if (
      newStartDate.getMonth() === newEndDate.getMonth() &&
      newStartDate.getFullYear() === newEndDate.getFullYear()
    ) {
      inOneMonth = true;
    }
  }

  if (!hasTime) {
    message.error(
      '由於數據量的問題，請選擇導出的時間，並且僅支持導出同一個月內的數據'
    );
    return;
  }

  if (!inOneMonth) {
    message.error('僅支持導出同一個月內的數據，請優化篩選條件');
    return;
  }
  doDownload();
};

// 下载文件  一年內
export const downLoadFileOneYearLimit = (url, postData, name = '', type) => {
  const doDownload = () => {
    const session = getUserSession();
    const query = Object.assign(
      {},
      { action: 'export', [HEADER_TOKEN_NAME]: session.jwt },
      postData
    );
    const querystring = qs.stringify(query);
    const _url = `${API_BASE}${url}?${querystring}`;
    const a = document.createElement('a');
    a.download = name;
    a.rel = 'noopener';
    a.href = _url;
    // 触发模拟点击
    a.dispatchEvent(new MouseEvent('click'));
  };
  const {
    start_time,
    end_time,
    start_date,
    end_date,
    grant_start_time,
    grant_end_time,
  } = postData;
  if (!(start_time || start_date || grant_start_time)) {
    message.error('僅僅支持輸入搜索條件後的數據導出');
    return;
  }

  if (
    (grant_start_time && grant_start_time === grant_end_time) ||
    (start_time && start_time === end_time) ||
    (start_date && start_date === end_date)
  ) {
    message.error('導出的開始時間和結束時間不能相同!');
    return;
  }

  const newStartDate = new Date(start_time || start_date || grant_start_time);
  const newEndDate = new Date(end_time || end_date || grant_end_time);

  if (
    !(
      !moment(newStartDate).add(1, 'years').isBefore(newEndDate) &&
      moment(newStartDate).isBefore(newEndDate)
    )
  ) {
    message.error('僅支持導出一年內的數據，請優化篩選條件');
    return;
  }
  doDownload();
};

// 下载文件  無日期限制
export const downLoadFileNoTimeLimit = (url, postData, name = '', type) => {
  const doDownload = () => {
    const session = getUserSession();
    const query = Object.assign(
      {},
      { action: 'export', [HEADER_TOKEN_NAME]: session.jwt },
      postData
    );
    const querystring = qs.stringify(query);
    const _url = `${API_BASE}${url}?${querystring}`;
    const a = document.createElement('a');
    a.download = name;
    a.rel = 'noopener';
    a.href = _url;
    // 触发模拟点击
    a.dispatchEvent(new MouseEvent('click'));
  };
  doDownload();
};

/**
 * 獲取中英文字符串的長度
 * @param {string} str 要獲取長度的字符串
 */
export const getLen = (str) => {
  let len = str.length;
  for (let i = 0; i < len; i += 1) {
    // eslint-disable-line
    const charCode = str.charCodeAt(i);
    if (charCode >= 0xd800 && charCode <= 0xdbff) {
      len--; // eslint-disable-line
      i++; // eslint-disable-line
    }
  }
  return len;
};

/**
 * md5加密
 * @param {string} str 需要加密的字符串
 * @param {number} digit md5機密位數
 * @param {enum} wordCase md5大小寫加密
 * @return {string}
 */
export const str2Md5 = (str, digit = 16, wordCase = 'upper') => {
  const md5Str = MD5(str).toString();
  const result =
    wordCase === 'upper' ? md5Str.toUpperCase() : md5Str.toLowerCase();
  if (digit === 16) {
    return result.substring(8, 24);
  }
  return result;
};

/**
 * 向给定 url 后添加 query 参数
 */
export function addUrlArgs(url, args) {
  // eslint-disable-next-line prefer-const
  let [baseUrl, hash] = url.split('#');
  const parts = [];
  for (const k in args) {
    const v = args[k];
    if (v !== undefined && v !== null) {
      parts.push(k + '=' + encodeURIComponent(v.toString()));
    }
  }
  if (baseUrl.indexOf('?') > -1) {
    baseUrl += '&' + parts.join('&');
  } else {
    baseUrl += '?' + parts.join('&');
  }
  if (hash) {
    return baseUrl + '#' + hash;
  }
  return baseUrl;
}

/**
 * 将key字符串转换成中划线方式命名 (如 "some-name") 的字符串
 * @param key 对象字符串
 * @param ignoreFirst 是否忽略第一个大写字母，如果忽略，会将其当成小写字母处理
 */
export function middlelizeKey(key, ignoreFirst = false) {
  const out = [];
  let i = 0;
  const lowerCasedStr = key.toString().toLowerCase();
  while (i < key.length) {
    if (key[i] !== lowerCasedStr[i]) {
      if (!ignoreFirst || i !== 0) {
        out.push('-');
        out.push(lowerCasedStr[i]);
        i += 1;
        continue;
      }
    }
    out.push(key[i].toLocaleLowerCase());
    i += 1;
  }
  return out.join('');
}
