import React from 'react';
import { connect } from 'dva';
/* eslint-disable */
const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
// require('echarts/lib/component/legend');

class ChartCom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.myChart = null;
  }
  componentDidMount() {
    this.initChart();
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
    if (this.props.isLoading !== nextProps.isLoading && !nextProps.isLoading) {
      if (this.myChart) {
        this.myChart.dispose();
      }
      setTimeout(() => {
        this.initChart();
      }, 150);
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
  createChartOptions() {
    const { valueList } = this.props;
    if (!valueList.length) {
      return;
    }
    const xAxisData = valueList[0].labelList || [];
    const defaultOptions = {
      grid: {
        left: 75,
        right: 35,
        top: 50,
        bottom: xAxisData.length > 10 ? 46 : 22
      },
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLabel: {
          interval: 0,
          color: 'rgba(0,0,0,0.75)',
          margin: 11,
          rotate: xAxisData.length > 10 ? 30 : 0
        },
        axisLine: { lineStyle: { color: '#E9E9E9' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { show: true, lineStyle: { type: 'dashed' } },
        axisLine: { show: false },
        axisTick: { lineStyle: { color: '#E9E9E9', type: 'dashed' } }
      },
      series: []
    };

    const series = valueList.map(item => {
      return {
        name: item.name,
        type: 'line',
        data: item.valueList
      };
    });
    const result = Object.assign({}, defaultOptions, { series });
    console.log('result=%O', result);
    return result;
  }
  initChart() {
    const self = this;
    const chartOptions = self.createChartOptions();
    if (chartOptions) {
      self.myChart = echarts.init(self.refs.jsChartDom);
      self.myChart.setOption(chartOptions);
    }
  }
  render() {
    return (
      <div className="m-chart-com-wrap">
        <div
          className="js-chart-dom"
          ref="jsChartDom"
          style={{ height: 350 }}
        />
      </div>
    );
  }
}
export default connect(({ system }) => {
  return {
    system: system.toJS()
  };
})(ChartCom);
