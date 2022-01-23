import React from 'react';
import { Card, DatePicker, Spin, message, Empty } from 'antd';
import moment from 'moment';
import _get from 'lodash/get';
import _map from 'lodash/map';

import { getRegisterChart } from 'services/memberAnalysis';
import { isToday, isWeek, isMonth, isYear } from 'utils/tools';
import HumanDateList from './HumanDateList';
import { getDateRange, padData } from '../util/index';
import TrendChart from './TrendChart';
import '../trend.less';

const { RangePicker } = DatePicker;

export default class TrendChartCard extends React.Component {
  dateFormat = 'YYYY-MM-DD';
  constructor(props) {
    super(props);
    this.state = {
      active: 'today',
      loading: true,
      yTick: [0, 40, 80, 120, 160, 200], // y轴的刻度
      data: [],
      time: [],
    };
  }
  componentDidMount() {
    const start = moment().format(this.dateFormat);
    const end = moment().format(this.dateFormat);
    this.getData(start, end);
  }
  getData = async (start, end) => {
    getRegisterChart(start, end).then((res) => {
      if (res.data && res.data.status) {
        this.setState({
          loading: false,
          yTick: res.data.data.registration_num_node,
          data: res.data.data.register_data,
        });
      }
    });
  };
  handleChangeHumanDate = (range, value) => {
    this.setState(
      {
        time: [],
        loading: true,
        active: value,
      },
      () => {
        const [start, end] = range;
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
  disableDate = (current) => {
    return current && current > moment().endOf('day');
  };
  getShowType = () => {
    const [startTime, endTime] = this.state.time;
    let showType = 'datetime';
    if (startTime && endTime) {
      let today = false;
      if (endTime === moment().format('YYYY-MM-DD')) {
        today = true;
      }
      const start = moment(startTime).startOf('day');
      const end = today ? moment() : moment(endTime).endOf('day');
      const pad = end - start;
      const days = Math.ceil(pad / (1000 * 60 * 60 * 24));
      if (days <= 1) {
        showType = 'time';
      } else if (days < 10) {
        showType = 'datetime';
      } else {
        showType = 'date';
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (this.state.active === 'today' || this.state.active === 'yesterday') {
        showType = 'time';
      } else if (
        this.state.active === 'month' ||
        this.state.active === 'year'
      ) {
        showType = 'date';
      } else if (this.state.active === 'week') {
        showType = 'datetime';
      }
    }
    return showType;
  };
  render() {
    const showType = this.getShowType();
    const dateRange = getDateRange(this.state.active, this.state.time);
    const data = padData(dateRange, this.state.data);
    return (
      <Card
        style={{ marginTop: 24 }}
        bodyStyle={{ padding: '24px 24px 34px' }}
        bordered={false}
        className={
          this.state.time.length ? '' : 'member-analysic__trend__time--empty'
        }
        title={
          <HumanDateList
            active={this.state.active}
            list={['today', 'week', 'month']}
            format={this.dateFormat}
            onChange={this.handleChangeHumanDate}
          />
        }
        extra={
          <RangePicker
            allowClear={false}
            disabledDate={this.disableDate}
            value={this.state.time}
            format={this.dateFormat}
            placeholder={['請選擇', '']}
            separator={this.state.time.length ? '~' : ''}
            onChange={this.handleChangeDate}
          />
        }
      >
        <Spin spinning={this.state.loading} tip="加載中">
          <React.Fragment>
            <p className="member-analysic__chart__title">會員註冊走勢圖</p>
            {data.length && !this.state.loading ? (
              <TrendChart
                isLoading={this.state.loading}
                yTick={this.state.yTick}
                data={data}
                showType={showType}
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
