import React from 'react';
import { Card, DatePicker, Spin, Empty, message } from 'antd';
import moment from 'moment';
import _get from 'lodash/get';
import _map from 'lodash/map';
import _debounce from 'lodash/debounce';
import _isArray from 'lodash/isArray';
import { getRegisterSource } from 'services/memberAnalysis';
import HumanDateList from './HumanDateList';
import { getDateRange } from '../util/index';
import TrendChartCard from './TrendChartCard';
import SourceChart from './SourceChart';

const { RangePicker } = DatePicker;

function range(start, end) {
  const result = [];
  // eslint-disable-next-line no-plusplus
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

export default class SourceChartCard extends TrendChartCard {
  dateFormat = 'YYYY-MM-DD HH:mm';
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      active: 'yesterday',
      data: [],
      total: 0,
      time: [],
    };
    this.getData = _debounce(this.getData, 1000);
  }
  componentDidMount() {
    const yesterday = moment().subtract(1, 'day');
    const start = moment(yesterday)
      .hour(0)
      .minute(0)
      .second(0)
      .format(this.dateFormat);
    const end = moment(yesterday)
      .hour(23)
      .minute(59)
      .second(59)
      .format(this.dateFormat);
    this.getData(start, end);
  }
  getData = async (start, end) => {
    const sendStart = moment(start).format('YYYY-MM-DD HH:mm:ss');
    const sendEnd = moment(end).endOf('m').format('YYYY-MM-DD HH:mm:ss');
    getRegisterSource(sendStart, sendEnd).then((res) => {
      if (res.data && res.data.status) {
        const data = _map(res.data.data.source_data, (item) => {
          return {
            name: item.name,
            value: item.total,
            rate: item.rate,
          };
        });
        this.setState({
          loading: false,
          data,
          total: res.data.data.reg_total,
        });
      }
    });
  };

  disabledDateTime = (dates, type) => {
    const now = moment();
    const hours = now.hour();
    const mins = now.minute();
    const result = {
      disabledHours: () => range(0, 24).splice(hours + 1),
    };
    if (_isArray(dates) && dates.length === 2) {
      if (type === 'start') {
        const m = dates[0];
        const h = m.hour();
        if (hours <= h) {
          result.disabledMinutes = () => range(0, 59).splice(mins + 1);
        }
      } else {
        const m = dates[1];
        const h = m.hour();
        if (hours <= h) {
          result.disabledMinutes = () => range(0, 59).splice(mins + 1);
        }
      }
    }
    return result;
  };

  handleChangeHumanDate = (rangeDate, value) => {
    this.setState(
      {
        time: [],
        loading: true,
        active: value,
      },
      () => {
        const [start, end] = rangeDate;
        this.getData(start, end);
      }
    );
  };

  handleChangeDate = (date, dateString) => {
    if (date.length === 2) {
      const [s, e] = date;
      const isIn = moment(s).add(1, 'year').isAfter(moment(e));
      if (!isIn) {
        message.warn('最大搜索範圍不能超過一年');
        return;
      }
    }
    this.setState(
      {
        time: date,
        loading: true,
        active: '',
      },
      () => {
        const [start, end] = dateString;
        this.getData(start, end);
      }
    );
  };

  render() {
    const dateRange = getDateRange(this.state.active, this.state.time);
    return (
      <Card
        style={{ marginTop: 24 }}
        bodyStyle={{ padding: '24px 24px 32px' }}
        bordered={false}
        className={
          this.state.time.length ? '' : 'member-analysic__trend__time--empty'
        }
        title={
          <HumanDateList
            active={this.state.active}
            list={['yesterday', 'week', 'month', 'year']}
            format={this.dateFormat}
            onChange={this.handleChangeHumanDate}
          />
        }
        extra={
          <RangePicker
            allowClear={false}
            format={this.dateFormat}
            showTime={{ format: 'HH:mm', hideDisabledOptions: true }}
            value={this.state.time}
            disabledTime={this.disabledDateTime}
            disabledDate={this.disableDate}
            placeholder={['請選擇', '']}
            separator={this.state.time.length ? '~' : ''}
            onChange={this.handleChangeDate}
          />
        }
      >
        <Spin spinning={this.state.loading} tip="加載中">
          <React.Fragment>
            <p className="member-analysic__chart__title">會員註冊來源分析</p>
            {this.state.data.length ? (
              <SourceChart
                ydata={this.state.data}
                isLoading={this.state.loading}
                total={this.state.total}
              />
            ) : (
              <Empty className="chart__empty" />
            )}
          </React.Fragment>
        </Spin>
        <div style={{ marginTop: 20, float: 'right' }}>
          統計週期：{dateRange[0]} ~ {dateRange[1]}
        </div>
      </Card>
    );
  }
}
