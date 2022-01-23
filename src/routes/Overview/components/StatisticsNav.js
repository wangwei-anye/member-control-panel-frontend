import React from 'react';
import moment from 'moment';
import { thousandFormat } from 'utils/tools';

const Style = {
  itemHeader: {
    fontWeight: 400
  }
};
export default class StatisticsNav extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: props.navList[0].name
    };
  }
  handleClick(item) {
    if (item.name === this.state.currentTab) {
      return;
    }
    this.setState({
      currentTab: item.name
    });
    if (this.props.onChange) {
      this.props.onChange(item);
    }
  }
  /*
  把时间类型转化成数字 00:34:45 -> 34*60+45
  */
  dateToNum(str) {
    if (typeof str === 'number') {
      return str;
    }
    const arr = str.split(':');
    let num = 0;
    const msList = [3600, 60, 1];
    arr.forEach((item, index) => {
      num += parseFloat(item) * msList[index];
    });
    return num;
  }
  /*
   判断数据的大小
  */
  judge(num1, num2) {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
      return parseFloat(num1) >= parseFloat(num2);
    }
    const sum1 = this.dateToNum(num1);
    const sum2 = this.dateToNum(num2);
    return sum1 >= sum2;
  }

  createNav(list) {
    const self = this;
    if (!this.props.dataInfo) {
      return;
    }
    const { today, yesterday } = this.props.dataInfo;
    return list.map((item, index) => {
      const className =
        self.state.currentTab === item.name ? 'list-item active' : 'list-item';
      return (
        <div
          className={className}
          key={index}
          onClick={() => self.handleClick(item)}
        >
          <p className="item-value item-title">{item.name}</p>
          <p
            className={
              this.judge(today[item.en] || 0, yesterday[item.en] || 0)
                ? 'item-value current-value up'
                : 'item-value current-value down'
            }
          >
            {thousandFormat(today[item.en]) || 0}
          </p>
          <p className="item-value">
            {thousandFormat(yesterday[item.en]) || 0}
          </p>
        </div>
      );
    });
  }
  render() {
    const yesterday =
      this.props.timeRange[0] ||
      moment()
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
    const beforeYesterday =
      this.props.timeRange[1] ||
      moment()
        .subtract(2, 'day')
        .format('YYYY-MM-DD');
    return (
      <div className="list-wrap">
        <div className={`list-item item-header ${Style.itemHeader}`}>
          <p className="item-title">XX</p>
          <p className="item-value">{yesterday}</p>
          <p className="item-value">{beforeYesterday}</p>
        </div>
        {this.createNav(this.props.navList)}
      </div>
    );
  }
}
