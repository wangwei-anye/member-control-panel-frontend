import React from 'react';
import PropTypes from 'prop-types';
import { InputNumber, Switch, TimePicker } from 'antd';
import moment from 'moment';
import { bgColorList } from '../constants';

export default class DailyNum extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
  };
  static defaultProps = {
    disabled: false,
  };
  static getDerivedStateFromProps(nextProps) {
    if (nextProps.value !== undefined) {
      return {
        value: nextProps.value.daily_total || '',
        dailyTime: nextProps.value.daily_reset_time || '00:00',
        checked: nextProps.value.check,
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value.daily_total || '',
      dailyTime: props.value.daily_reset_time || '00:00',
      checked: !!props.value.daily_total,
    };
    this.timer = null;
  }
  handleChange = (value) => {
    if (this.props.disabled) {
      return;
    }
    this.setState({ value: value || '' });
    this.triggerChange({
      daily_total: value,
    });
  };

  handleTimePickerChange = (time, timeString) => {
    if (this.props.disabled) {
      return;
    }
    this.setState({ dailyTime: timeString || '' });
    this.triggerChange({
      daily_reset_time: timeString,
    });
  };

  handleBlur = () => {
    if (this.state.value === '' || this.state.value + '' === '0') {
      this.timer = setTimeout(() => {
        this.setState({
          checked: false,
        });
        this.triggerChange({
          daily_total: 0,
          check: false,
        });
      }, 300);
    }
  };
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const { onChange, value } = this.props;
    if (changedValue.daily_reset_time === undefined) {
      changedValue.daily_reset_time = '00:00';
    }
    if (onChange) {
      onChange({
        ...value,
        ...changedValue,
      });
    }
  };

  handleSwitchChange = (checked) => {
    if (this.props.disabled) {
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.setState(
      {
        checked,
      },
      () => {
        if (this.state.checked) {
          this.inputRef.focus();
          this.triggerChange({
            check: checked,
          });
        } else {
          this.triggerChange({
            daily_total: 0,
            daily_reset_time: this.state.daily_reset_time,
            check: checked,
          });
        }
      }
    );
  };
  render() {
    return (
      <React.Fragment>
        <span>
          <InputNumber
            ref={(refNode) => (this.inputRef = refNode)}
            min={1}
            step={1}
            max={100000000}
            style={{ display: 'inline-block', width: '120px' }}
            value={this.state.checked ? this.state.value : ''}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            disabled={!this.state.checked || this.props.disabled}
          />
          <span style={{ display: 'inline-block', marginLeft: 10 }}>份</span>
        </span>
        <span style={{ display: 'inline-block', marginLeft: 30 }}>
          <span style={{ display: 'inline-block', marginRight: 10 }}>限制</span>
          <Switch
            checkedChildren="開"
            unCheckedChildren="關"
            checked={this.state.checked}
            onChange={this.handleSwitchChange}
            disabled={this.props.disabled}
          />
        </span>
        <span style={{ display: 'inline-block', marginLeft: 30 }}>
          <TimePicker
            onChange={this.handleTimePickerChange}
            value={
              this.state.checked
                ? moment(this.state.dailyTime, 'HH:mm')
                : moment('00:00', 'HH:mm')
            }
            disabled={!this.state.checked || this.props.disabled}
            format="HH:mm"
          />
        </span>
      </React.Fragment>
    );
  }
}
