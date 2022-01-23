import React from 'react';
import PropTypes from 'prop-types';
import { Select, DatePicker, message } from 'antd';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import moment from 'moment';
import { noop as _noop } from 'lodash';

const { Option } = Select;

export default class IntegralValidTime extends React.Component {
  static getDerivedStateFromProps(nextProps) {
    // Should be a controlled component.
    const info = {};
    if (nextProps.selected) {
      info.selected = nextProps.selected;
    }
    if (nextProps.designation) {
      info.designation = nextProps.designation;
    }
    return info;
  }

  static propTypes = {
    selected: PropTypes.string,
    designation: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
  }

  static defaultProps = {
    selected: '',
    designation: '',
    onChange: _noop,
    disabled: false,
  }

  constructor(props) {
    super(props);
    const { selected, designation } = props;
    this.state = {
      selected: selected || undefined,
      designation: designation || undefined,
    };
  }

  handleChangeSelect = (value) => {
    this.setState({ selected: value, designation: undefined });
    this.triggerChange({ selected: value, designation: undefined });
  }

  handleChangeInput = (value) => {
    this.triggerChange({ designation: value });
  }

  handleChangeDate = (date, dateString) => {
    let designation;
    if (date === null) { // 清空
      designation = undefined;
    } else {
      designation = date.format('YYYY-MM-DD');
    }
    if (!('value' in this.props)) {
      this.setState({ designation });
    }
    this.triggerChange({ designation });
  }

  triggerChange = changedValue => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  };

  render() {
    const { designation, selected } = this.state;
    let designationVal = designation;
    if (selected === 'fixed_date' && designationVal !== undefined) {
      designationVal = moment(designation, 'YYYY-MM-DD');
    }
    return (
      <React.Fragment>
        <div>
          <Select
            value={this.state.selected}
            onChange={this.handleChangeSelect}
            style={{ width: 300 }}
            placeholder="請選擇"
            disabled={this.props.disabled}
            allowClear
          >
            <Option value="begin_with">领取之日起</Option>
            <Option value="fixed_date">指定时间</Option>
          </Select>
        </div>
        {
          selected ?
            (
              selected === 'begin_with' ?
                <div style={{ marginTop: 24 }}>
                  <InputToolTipCom
                    min={1}
                    maxNum={366}
                    step={1}
                    value={designationVal}
                    onChange={this.handleChangeInput}
                    style={{ marginRight: 10 }}
                    placeholder="請輸入"
                    disabled={this.props.disabled}
                  />
                  天內有效（截止到最後一天23:59:59過期）
                </div>
                :
                <div style={{ marginTop: 24 }}>
                  <DatePicker
                    disabledDate={(current) => {
                      return current && (current < moment().startOf('day') || current >= moment('2038-01-19'));
                      }
                    }
                    value={designationVal}
                    allowClear
                    onChange={this.handleChangeDate}
                    style={{ marginRight: 10 }}
                    placeholder="請選擇"
                    disabled={this.props.disabled}
                  />
                  之前有效（截止到最後一天23:59:59過期）
                </div>
            )
            : null
        }
      </React.Fragment>
    );
  }
}
