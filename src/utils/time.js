import moment from 'moment';
import _toArray from 'lodash/toArray';
import _pick from 'lodash/pick';

/**
 * 时间段是否相等
 * @param {Moment[] | string[]} aRange a时间段
 * @param {Moment[] | string[]} bRange b时间段
 * @param {string} format 时间格式化
 */
const isTimeRangeSame = (aRange, bRange, format) => {
  const [initStart, now] = aRange;
  const [start, end] = bRange;
  let startCheck = false;
  let endCheck = false;
  if (format) {
    startCheck = moment(initStart).format(format) === moment(start).format(format);
    endCheck = moment(now).format(format) === moment(end).format(format);
    return startCheck && endCheck;
  }
  startCheck = moment(start).isSame(initStart);
  endCheck = moment(end).isSame(now);
  return startCheck && endCheck;
};

/**
 * 检测一个时间是否在给定范围之间 a<= b <= c
 * @param {Date[] | Moment[]} range 时间范围
 * @param {Date | Moment} checkTarget 要检测的时间
 */
export const isBetweenTime = (range, checkTarget) => {
  const [start, end] = range;
  return (!moment(start).isAfter(checkTarget)) && (!moment(end).isBefore(checkTarget));
};

/**
 * 时间范围是否显示为今日
 * @param { Moment | string } now 当前时间
 * @param { Moment | string } start 开始时间
 * @param { Moment | string } end 结束时间
 * @return { boolean }
 */
export const isToday = (now, start, end, format) => {
  const initStart = moment(now).startOf('hour');
  return isTimeRangeSame([initStart, now], [start, end], format);
};

export const isWeek = (now, start, end, format) => {
  const initStart = moment(now).startOf('day');
  return isTimeRangeSame([initStart, now], [start, end], format);
};

export const isMonth = (now, start, end, format) => {
  const initStart = moment(now).startOf('month');
  return isTimeRangeSame([initStart, now], [start, end], format);
};

export const isYear = (now, start, end, format) => {
  const initStart = moment(now).startOf('year');
  return isTimeRangeSame([initStart, now], [start, end], format);
};

/**
 * 一天的开始时间
 * @param {string} format 时间格式化
 */
const earlyMorning = (format) => (momentObj) => {
  const temp = momentObj.startOf('day');
  if (format) {
    return temp.format(format);
  }
  return temp.unix() * 1000;
};

/**
 * 一天的结束时间
 * @param {format} format 时间格式化
 */
const midNight = (format) => (momentObj) => {
  const temp = momentObj.endOf('day');
  if (format) {
    return temp.format(format);
  }
  return temp.unix() * 1000;
};

/**
 * 獲取可讀日期列表
 * @param {Array} list 可讀性日期：yesterday, today, week, month, year
 * @param {string} format 格式化字符串
 * @return {Array}
 */
export function getHumanDate(list, format) {
  const morning = earlyMorning(format);
  const night = midNight(format);
  const now = moment();
  const nowFormat = format ? now.format(format) : now.unix() * 1000;
  const today = moment(now);
  const todayRange = [morning(today), nowFormat];
  const yesterday = moment(now).subtract(1, 'day');
  const yesterdayRange = [morning(yesterday), night(yesterday)];
  const week = moment(now).startOf('week').add(1, 'day');
  const weekRange = [morning(week), nowFormat];
  const month = moment(now).startOf('month');
  const monthRange = [morning(month), nowFormat];
  const year = moment(now).startOf('year');
  const yearRange = [morning(year), nowFormat];
  const humanDate = {
    yesterday: { value: 'yesterday', range: yesterdayRange, name: '昨日' },
    today: { value: 'today', range: todayRange, name: '今日' },
    week: { value: 'week', range: weekRange, name: '本週' },
    month: { value: 'month', range: monthRange, name: '本月' },
    year: { value: 'year', range: yearRange, name: '全年' }
  };
  return _toArray(_pick(humanDate, list));
}
