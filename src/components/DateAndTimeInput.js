import React from 'react';
import { InputNumber, DatePicker } from 'antd';
import moment from 'moment';

export default class DateAndTimeSelect extends React.Component {
  constructor(props) {
    super(props);
    const dateInfo = props.dateInfo;
    const start_time = moment(dateInfo.start_time).format('YYYY-MM-DD');
    const startHour = moment(dateInfo.start_time).format('HH');
    const startMinute = moment(dateInfo.start_time).format('mm');
    const startSecond = moment(dateInfo.start_time).format('ss');
    this.state = {
      start_time,
      startHour,
      startMinute,
      startSecond,
      isShowToday: true,
    };
  }
  componentDidMount() {
    this.onChange();
  }

  onChange() {
    const { start_time, startHour, startMinute, startSecond } = this.state;
    const value = {
      start_time: `${start_time} ${startHour}:${startMinute}:${startSecond}`,
    };
    if (this.props.onChange && typeof this.props.onChange === 'function') {
      this.props.onChange({ ...value });
    }
  }
  async dateChangeAction(date, dateString, type) {
    await this.setState({
      [type]: dateString,
    });
    this.onChange();
  }
  async timeChangeAction(value, type) {
    await this.setState({
      [type]: +value >= 10 ? value : `0${value}`,
    });
    this.onChange();
  }
  render() {
    const { start_time, startHour, startMinute, startSecond, isShowToday } =
      this.state;
    const { disabled } = this.props;
    return (
      <span>
        <span>
          <DatePicker
            disabled={disabled}
            allowClear={false}
            disabledDate={(current) =>
              current && current < moment().subtract(1, 'day')
            }
            style={{ marginRight: '10px' }}
            value={moment(start_time, 'YYYY-MM-DD')}
            onChange={(date, dateString) =>
              this.dateChangeAction(date, dateString, 'start_time')
            }
            showToday={isShowToday}
          />
          <InputNumber
            disabled={disabled}
            style={{ marginRight: '10px' }}
            max={23}
            min={0}
            step={1}
            value={startHour}
            formatter={(value) => {
              const str = value.toString();
              return str[1] ? value : `0${value}`;
            }}
            onChange={(value) => this.timeChangeAction(value, 'startHour')}
          />
          <span style={{ marginRight: '10px' }}>：</span>
          <InputNumber
            disabled={disabled}
            style={{ marginRight: '10px' }}
            max={59}
            min={0}
            step={1}
            value={startMinute}
            formatter={(value) => {
              const str = value.toString();
              return str[1] ? value : `0${value}`;
            }}
            onChange={(value) => this.timeChangeAction(value, 'startMinute')}
          />
          <span style={{ marginRight: '10px' }}>：</span>
          <InputNumber
            disabled={disabled}
            style={{ marginRight: '10px' }}
            max={59}
            min={0}
            step={1}
            value={startSecond}
            formatter={(value) => {
              const str = value.toString();
              return str[1] ? value : `0${value}`;
            }}
            onChange={(value) => this.timeChangeAction(value, 'startSecond')}
          />
        </span>
      </span>
    );
  }
}
