import React from 'react';
import LineChart from 'components/echarts/LineChart';
import moment from 'moment';
import { getItemData } from 'services/statistics';
import StatisticsNav from './StatisticsNav';

export default class StackComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentItem: props.navList[0],
      dataInfo: {},
      isLoading: false
    };
  }
  async componentDidMount() {
    if (!this.props.navList) {
      setTimeout(() => {
        this.fetchItemData(this.props.navList[0].url);
      }, 500);
    } else {
      await this.fetchItemData(this.props.navList[0].url);
    }
  }
  handleChange = async value => {
    this.setState({
      currentItem: value
    });
    await this.fetchItemData(value.url);
  };
  async fetchItemData(detail, type = this.props.name) {
    if (!detail) {
      return;
    }
    this.setState({
      isLoading: true
    });
    const res = await getItemData({ type, detail });
    this.setState({
      isLoading: false
    });
    const resData = res.data;
    if (resData.status) {
      this.setState({
        dataInfo: resData.data
      });
    }
  }
  render() {
    const yesterday = moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    const beforeYesterday = moment()
      .subtract(2, 'day')
      .format('YYYY-MM-DD');
    const title = `${
      this.state.currentItem.name
    }--${yesterday}對比${beforeYesterday}`;
    return (
      <div style={{ paddingLeft: 24, paddingRight: 24 }}>
        {/* @remove 2019-05-09 antd升級
          此处 margin-top 为 -15px
          是因为 在 index.less ant-card-wider-padding .ant-card-body padding-top:20px */}
        <StatisticsNav
          timeRange={[yesterday, beforeYesterday]}
          navList={this.props.navList}
          dataInfo={this.props.dataInfo}
          onChange={this.handleChange}
        />
        <div className="sta-chart-wrap">
          <p className="sta-title">{title}</p>
          <div className="chart-legend">
            <div className="legend-item">
              <p className="legend-title">{yesterday}</p>
            </div>
            <div className="legend-item">
              <p className="legend-title">{beforeYesterday}</p>
            </div>
          </div>
          <div>
            {Object.keys(this.state.dataInfo).length ? (
              <LineChart
                timeRange={[yesterday, beforeYesterday]}
                isLoading={this.state.isLoading}
                dataInfo={this.state.dataInfo}
                itemInfo={this.state.currentItem}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
