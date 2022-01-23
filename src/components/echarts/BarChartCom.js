/* eslint-disable */
import React from 'react';
import { connect } from 'dva';
import './chart.less';

const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/bar');
require('echarts/lib/component/tooltip');

// 默认的X轴坐标
const defaultXAixList = [
  '0-10000',
  '10001-20000',
  '20001-30000',
  '30001-40000',
  '40001-50000',
  '50001-60000',
  '60001-70000',
  '70001-80000',
  '80001-90000',
  '90001-100000',
  '100000-',
];
//  默认的Y轴数据，全为 0
const defaultData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myChart: null,
    };
  }

  componentDidMount() {
    this.renderChart();
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

  createTimeMap() {
    return this.props.configData;
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
    let dataList = self.props.listData;
    if (!dataList.length) {
      dataList = defaultData;
    }
    const option = {
      grid: {
        top: 35,
        left: 40,
        right: 40,
        bottom: 30,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(50,50,50,0.9)',
        padding: 15,
        formatter(params) {
          const item = params[0];
          return `${item.data.toLocaleString()}`;
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: ['5%', '5%'],
        data: self.createTimeMap().length
          ? self.createTimeMap()
          : defaultXAixList,
        axisTick: {
          alignWithLabel: true,
        },
        axisLabel: {
          interval: 0,
          color: 'rgba(0,0,0,0.75)',
          margin: 10,
          formatter: function (value, index) {
            if (index < dataList.length - 1) {
              let texts = value.split('-');
              texts = texts.map((item) => {
                let value = parseInt(item, 10);
                return `${value.toLocaleString()}\n`;
              });
              texts.splice(1, 0, '|\n');
              return texts.join('\n');
            }
            return `${parseInt(value, 10)
              .toLocaleString()
              .replace('-', '')}以上`;
          },
          rich: {
            a: {
              color: 'red',
            },
          },
        },
        axisLine: { lineStyle: { color: '#E9E9E9' } },
      },
      yAxis: {
        minInterval: 1,
        max: function (value) {
          if (value.max <= 5) {
            return 5;
          }
          return null;
        },
        type: 'value',
        axisLabel: {
          formatter(value, index) {
            return value.toLocaleString();
          },
          color: 'rgba(0,0,0,0.65)',
        },
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { lineStyle: { color: '#E9E9E9', type: 'dashed' } },
      },
      series: [
        {
          type: 'bar',
          data: dataList,
          showSymbol: false,
          symbolSize: 2,
          smooth: true,
          barWidth: 24,
          itemStyle: { borderWidth: 3, color: '#1890FF' },
          lineStyle: { color: '#1890FF' },
          animationDelay: function (idx) {
            return idx * 10;
          },
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: function (idx) {
        return idx * 5;
      },
    };
    self.myChart = echarts.init(self.refs.barChart);
    self.myChart.setOption(option);
  }

  render() {
    return (
      <div className="chart-wrap">
        <div ref="barChart" className="bar-chart" />
        <span className="xAxis-name">積分數</span>
      </div>
    );
  }
}
export default connect(({ system }) => ({
  system: system.toJS(),
}))(BarChart);
