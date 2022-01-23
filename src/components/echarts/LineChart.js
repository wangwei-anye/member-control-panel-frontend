import React from 'react';
import moment from 'moment';
import { connect } from 'dva';
import './chart.less';
/* eslint-disable */
const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');

let defaultList = [];
let defaultListForTime = [];
class LineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = { myChart: null };
  }
  componentDidMount() {
    setTimeout(() => {
      this.renderChart();
    }, 1);
  }
  componentWillReceiveProps(nextProps) {
    if (this.myChart) {
      if (nextProps.isLoading) {
        this.myChart.showLoading();
      } else {
        setTimeout(() => {
          this.myChart.hideLoading();
        }, 500);
      }
    }
    if (this.props.isLoading && !nextProps.isLoading) {
      setTimeout(() => {
        this.renderChart();
      }, 1);
    }
    if (this.props.system.menuCollapsed !== nextProps.system.menuCollapsed) {
      if (this.myChart) {
        setTimeout(() => {
          this.myChart.resize();
        }, 220);
      }
    }
  }
  componentWillUnmount() {
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
  }
  random(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
  }
  dateToNum(str) {
    if (typeof str === 'number') {
      return str;
    }
    const arr = str.split(':');
    let num = 0;
    const msList = [3600, 60, 1];
    arr.forEach((item, index) => {
      num += parseInt(item, 10) * msList[index];
    });
    return num;
  }
  numToDate(value) {
    if (typeof value !== 'number') {
      return value;
    }
    const hour = this.toDouble(parseInt(value / 3600, 10));
    const min = this.toDouble(parseInt((value % 3600) / 60, 10));
    const ms = this.toDouble((value % 3600) % 60);
    return `${hour}:${min}:${ms}`;
  }
  createTimeMap() {
    const arr = [];
    for (let i = 0; i <= 23; i++) {
      arr.push(`${this.toDouble(i)}:00-${this.toDouble(i)}:59`);
      defaultList.push(0);
      defaultListForTime.push('00:00:00');
    }
    return arr;
  }
  toDouble(num = 1) {
    if (typeof num === 'string') {
      return num.length < 2 ? `0${num}` : num;
    }
    if (typeof num === 'number') {
      return num < 10 ? `0${num}` : num;
    }
    return num;
  }

  renderChart() {
    const self = this;
    let isForTime = false; // 是否是显示时间格式的 例如 时长 等
    const { dataInfo, itemInfo } = self.props;
    if (!dataInfo || !dataInfo.today) {
      return;
    }
    if (
      (dataInfo.yesterday.length &&
        typeof dataInfo.yesterday[0] === 'string' &&
        dataInfo.yesterday[0].indexOf(':') >= 0) ||
      (dataInfo.today.length &&
        typeof dataInfo.today[0] === 'string' &&
        dataInfo.today[0].indexOf(':') >= 0)
    ) {
      isForTime = true;
      dataInfo.today = (dataInfo.today.length
        ? dataInfo.today
        : isForTime
        ? defaultListForTime
        : defaultList
      ).map((item, index) => {
        return self.dateToNum(item);
      });
      dataInfo.yesterday = (dataInfo.yesterday.length
        ? dataInfo.yesterday
        : isForTime
        ? defaultListForTime
        : defaultList
      ).map((item, index) => {
        return self.dateToNum(item);
      });
    }
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
    const option = {
      grid: { top: 15, left: isForTime ? 60 : 50, right: 10, bottom: 85 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(50,50,50,0.9)',
        padding: 15,
        formatter(params) {
          const todayParams = params[0];
          const yesterdayParams = params[1];
          return `${
            todayParams.axisValueLabel
          }&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${
            itemInfo.chartTipName
          }<br/> 
              ${todayParams.marker} ${
            todayParams.seriesName
          } &nbsp;&nbsp;&nbsp;${
            isForTime ? self.numToDate(todayParams.data) : todayParams.data
          } <br/>  
              ${yesterdayParams.marker} ${
            yesterdayParams.seriesName
          } &nbsp;&nbsp;&nbsp;${
            isForTime
              ? self.numToDate(yesterdayParams.data)
              : yesterdayParams.data
          }`;
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: self.createTimeMap(),
        axisLabel: {
          interval: 1,
          color: 'rgba(0,0,0,0.75)',
          margin: 8,
          formatter: function(value) {
            let texts = value.split('-');
            texts = texts.map(item => {
              let value = item;
              return `${value}\n`;
            });
            texts.splice(1, 0, '|\n');
            return texts.join('\n');
          }
        },
        axisLine: { lineStyle: { color: '#E9E9E9' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter(value) {
            if (!isForTime) {
              return value;
            }
            return self.numToDate(value);
          },
          color: 'rgba(0,0,0,0.65)'
        },
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { lineStyle: { color: '#E9E9E9', type: 'dashed' } }
      },
      series: [
        {
          name: yesterday,
          type: 'line',
          data: dataInfo.today.length
            ? dataInfo.today
            : isForTime
            ? defaultListForTime
            : defaultList,
          showSymbol: false,
          symbolSize: 2,
          smooth: true,
          itemStyle: { borderWidth: 3, color: '#1890FF' },
          lineStyle: { color: '#1890FF' }
        },
        {
          name: beforeYesterday,
          type: 'line',
          data: dataInfo.yesterday.length
            ? dataInfo.yesterday
            : isForTime
            ? defaultListForTime
            : defaultList,
          showSymbol: false,
          symbolSize: 2,
          smooth: true,
          itemStyle: { borderWidth: 3, color: '#52C41A' },
          lineStyle: { color: '#52C41A' }
        }
      ]
    };
    self.myChart = echarts.init(self.refs.lineChart);
    self.myChart.setOption(option);
  }

  render() {
    return (
      <div className="chart-wrap">
        <div ref="lineChart" className="line-chart" />
      </div>
    );
  }
}
export default connect(({ system }) => ({
  system: system.toJS()
}))(LineChart);
