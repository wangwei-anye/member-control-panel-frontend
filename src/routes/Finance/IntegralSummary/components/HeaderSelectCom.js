import React from 'react';
import { Select } from 'antd';
import moment from 'moment';

const Option = Select.Option;
const formatDateList = (length = 7) => {
  const dateList = [];
  const oneDayMs = 24 * 60 * 60 * 1000;
  const current = Date.now();
  for (let i = length; i >= 0; i -= 1) {
    dateList.push(
      moment(current - (length - i) * oneDayMs).format('YYYY-MM-DD')
    );
  }
  dateList.reverse();
};

class HeaderSelectCom extends React.Component {
  handleDayChange = value => {
    if (this.props.isDisabled) {
      return;
    }
    if (
      this.props.onDateTypeChange &&
      typeof this.props.onDateTypeChange === 'function'
    ) {
      this.props.onDateTypeChange(value);
    }
  };
  handleSelectChange = value => {
    if (
      this.props.onSelectChange &&
      typeof this.props.onSelectChange === 'function'
    ) {
      this.props.onSelectChange(value);
    }
  };
  render() {
    const { partmentList, dayTypeList, valueInfo } = this.props;
    const isDisabled = this.props.isDisabled;
    return (
      <React.Fragment>
        <div className="m-select-wrap">
          <div className="partment-select-wrap">
            <span>所屬部門：</span>
            <span>
              <Select
                style={{ width: 220 }}
                value={valueInfo.partment}
                onChange={this.handleSelectChange}
                disabled={isDisabled}
              >
                {partmentList.map(item => {
                  return (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            </span>
          </div>
          <div
            className={[
              'day-type-select-wrap',
              isDisabled ? 'disabled' : ''
            ].join(' ')}
          >
            {dayTypeList.map(item => {
              return (
                <span
                  key={item.value}
                  className={[
                    'item',
                    valueInfo.date === item.value ? 's-active' : ''
                  ].join(' ')}
                  onClick={this.handleDayChange.bind(this, item)}
                >
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default HeaderSelectCom;
