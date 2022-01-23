import {
  result as _result,
  find as _find,
  forEach as _forEach,
  map as _map,
  orderBy as _orderBy,
} from 'lodash';
import moment from 'moment';
import { getHumanDate } from 'utils/time';

export const padData = (range, data) => {
  let [start, end] = range;
  let isToday = false;
  if (end === moment().format('YYYY-MM-DD')) {
    isToday = true;
  }
  start = moment(start).startOf('day');
  end = isToday ? moment() : moment(end).endOf('day');
  const sp = end - start;
  const days = Math.ceil(sp / (1000 * 60 * 60 * 24));
  const result = {};
  const format = 'YYYY-MM-DD HH:mm:ss';
  let addWord = 'hours';
  let ceilCheck = 24 * (days / 10);
  let tempSp = Math.ceil(ceilCheck);

  if (days >= 10) {
    addWord = 'days';
    ceilCheck = days / 10;
    tempSp = Math.ceil(ceilCheck);
  }

  let temp = moment(start);
  // 循环获取x轴间隔值
  while (end.isAfter(temp) || end.isSame(temp)) {
    const resultKey = temp.format(format);
    temp = temp.add(tempSp, addWord);
    result[resultKey] = 0;
  }

  // 由循环获取的最后一个日期
  const lastResult = moment(temp).subtract(tempSp, addWord);

  // 根据后端接口返回的数据填充间隔
  _forEach(data, (item) => {
    const { number, statistics_time } = item;
    const dataTime = moment(statistics_time);

    // 预防后端数据日期错误
    if (!dataTime.isValid()) {
      // continue
      return;
    }
    // number === '' 为数据错误
    // number === null 为数据错误
    if (number !== '' && number !== null) {
      if (days >= 10) {
        // 后台逻辑调整：返回的时候需要减一天
        const actualTime = moment(dataTime).subtract(1, addWord);
        // - 1后超过当前时间不显示
        if (!actualTime.isAfter(moment(end))) {
          const adJustTime = actualTime.startOf('day').format(format);
          result[adJustTime] = number;
        }
      } else {
        result[statistics_time] = number;
      }
    }
  });

  // 如果结束时间不在范围时间内，加多一个间隔范围作为最后一个点
  if (days >= 10) {
    end = end.startOf('day');
  } else {
    end = end.startOf('hour');
  }
  if (end.isAfter(lastResult) && !end.isSame(lastResult)) {
    const finalLast = moment(lastResult).add(tempSp, addWord).format(format);
    if (result[finalLast] === undefined) {
      result[finalLast] = null;
    }
  }

  const buildArr = _map(result, (count, date) => {
    return {
      value: count,
      name: date,
    };
  });

  // 确保时间顺序，进行时间排序
  return _orderBy(buildArr, ['name'], ['asc']);
};

export const getDateRange = (active, time) => {
  if (active !== '') {
    const list = getHumanDate(
      ['yesterday', 'today', 'week', 'month', 'year'],
      'YYYY-MM-DD'
    );
    return _result(_find(list, { value: active }), 'range');
  }
  const [start, end] = time;
  return [start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD')];
};
