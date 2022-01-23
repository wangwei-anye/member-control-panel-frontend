import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import BarChart from 'components/echarts/BarChartCom';
import moment from 'moment';
import { DatePicker, message } from 'antd';
import { fetchIntegralData } from 'services/integral/integral';
import './index.less';

const oneDayMs = 24 * 60 * 60 * 1000;
// 定义 今日 ，本周，本月 list字段
const dayWeekMonthList = [
  {
    name: '昨日',
    key: 'day'
  },
  {
    name: '近7天',
    key: 'week'
  },
  {
    name: '近30天',
    key: 'month'
  }
];
const random = (minNum, maxNum) => {
  return Math.ceil(Math.random() * (maxNum - minNum)) + minNum;
};
const createRandomNum = (num = 10, minNum = 1000, maxNum = 100000) => {
  const arr = [];
  for (let i = 0; i < num; i += 1) {
    const randomNum = random(minNum, maxNum);
    arr.push(randomNum);
  }
  return arr;
};
class IntegralPage extends React.Component {
  state = {
    activeUserLoading: true,
    allUserLoading: true,
    selectDate: moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD'), // 当前日期的前一天
    currentItem: 'day',
    allUserIntegralData: [], // 全部註冊會員積分 数据
    activeUserIntegralData: [], // 活跃会员积分数据
    activeConfigList: [], // 活跃图表 x轴数据
    allConfigList: [] // 所有图表 x轴数据
  };
  async componentWillMount() {
    await this.fetchData();
    this.setState({
      activeUserLoading: false,
      allUserLoading: false
    });
  }
  componentWillUnmount() {
    message.destroy();
  }
  onDateChange = async (date, dateString) => {
    if (dateString && dateString !== this.state.selectDate) {
      this.setState({
        activeUserLoading: true,
        allUserLoading: true
      });
      await this.fetchData('', dateString);
      this.setState({
        selectDate: dateString,
        activeUserLoading: false,
        allUserLoading: false
      });
    }
  };
  async onTabChange(value) {
    if (value && value !== this.state.currentItem) {
      this.setState({
        activeUserLoading: true,
        currentItem: value
      });
      await this.fetchData(value);
      this.setState({
        currentItem: value,
        activeUserLoading: false
      });
    }
  }
  async fetchData(type, date) {
    const getType = type || this.state.currentItem;
    const configDate = date || this.state.selectDate;
    let res = await fetchIntegralData({ getType, configDate });
    res = res.data;
    if (+res.code === 0) {
      const activeData = res.data.active;
      const allData = res.data.all;
      const activeCountList = [];
      const allCountList = [];
      const activeAxisList = [];
      const allAsixList = [];
      if (!((allData && allData.length) || (activeData && activeData.length))) {
        // 如果 全部积分都没有数据则返回
        message.error('可能該時間段暫無統計數據！');
      }
      activeData.forEach(item => {
        activeCountList.push(item.count);
        activeAxisList.push(item.config.join('-'));
      });
      allData.forEach(item => {
        allCountList.push(item.count);
        allAsixList.push(item.config.join('-'));
      });
      this.setState({
        activeUserIntegralData: activeCountList,
        allUserIntegralData: allCountList,
        activeConfigList: activeAxisList,
        allConfigList: allAsixList
      });
    } else {
      this.setState({
        activeUserIntegralData: [],
        allUserIntegralData: [],
        activeConfigList: [],
        allConfigList: []
      });
      message.error(res.message || '可能該時間段暫無統計數據！');
    }
  }

  render() {
    const {
      currentItem,
      selectDate,
      allUserIntegralData,
      activeUserIntegralData,
      allUserLoading,
      activeUserLoading,
      allConfigList,
      activeConfigList
    } = this.state;
    return (
      <div className="p-integral-wrap">
        <div className="integral__content">
          <p className="integral__content--title">註冊會員持有積分情況</p>
          {/* 全部註冊會員積分分佈 */}
          <div className="integral__content--item">
            <div className="common-title">
              <p className="title">全部註冊會員積分分佈</p>
              <div className="extra-wrap">
                <DatePicker
                  defaultValue={moment(selectDate, 'YYYY-MM-DD')}
                  disabledDate={currentDate =>
                    Date.now() < currentDate + oneDayMs
                  }
                  onChange={this.onDateChange}
                />
              </div>
            </div>
            <p className="integral__content--chart-title">會員數</p>
            <div className="integral__content--chart">
              <BarChart
                listData={allUserIntegralData}
                configData={allConfigList}
                isLoading={allUserLoading}
              />
            </div>
          </div>
          {/* 活躍會員積分分佈 */}
          <div className="integral__content--item">
            <div className="common-title">
              <p className="title">活躍會員積分分佈</p>
              <div className="extra-wrap">
                {/* 选择 今日 ，本周，本月 */
                dayWeekMonthList.map(item => {
                  return (
                    <span
                      key={item.key}
                      onClick={() => this.onTabChange(item.key)}
                      className={[
                        'extra-item',
                        currentItem === item.key && 'active'
                      ].join(' ')}
                    >
                      {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
            <p className="integral__content--chart-title">會員數</p>
            <div className="integral__content--chart">
              <BarChart
                configData={activeConfigList}
                listData={activeUserIntegralData}
                isLoading={activeUserLoading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralDistribute, system }) => ({
    integralDistribute: integralDistribute.toJS(),
    system: system.toJS()
  }))(IntegralPage)
);
