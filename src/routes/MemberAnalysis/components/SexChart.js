import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'dva';
import _map from 'lodash/map';
import _slice from 'lodash/slice';
import './chartcommon.less';
/* eslint-disable */
const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/pie');
/* eslint-enable */

export class SexChart extends React.Component {
  constructor(props) {
    super(props);
    this.mychart = null;
    this.state = {
      activeIndex: null
    };
  }
  static propTypes = {
    ydata: PropTypes.array,
    isLoading: PropTypes.bool
  }
  static defaultProps = {
    isLoading: false,
    ydata: []
  }
  componentDidMount() {
    setTimeout(() => {
      this.renderChart();
    }, 1);
    window.addEventListener('resize', this.resizeChart);
  }
  resizeChart = () => {
    if (this.myChart) {
      setTimeout(() => {
        this.myChart.resize();
      }, 220);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.isLoading && !nextProps.isLoading) {
      setTimeout(() => {
        this.renderChart();
      }, 1);
    }
    if (this.props.system.menuCollapsed !== nextProps.system.menuCollapsed) {
      this.resizeChart();
    }
  }
  componentWillUnmount() {
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
    window.removeEventListener('resize', this.resizeChart);
  }

  renderChart = () => {
    const data = this.props.ydata;
    const option = {
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      color: ['#1890ff', '#f04864', '#13c2c2', '#facc14'],
      backgroundColor: '#fff',
      series: [{
        type: 'pie',
        radius: 120,
        startAngle: 180,
        center: ['center', 'center'],
        data,
        itemStyle: { // 图形样式
          normal: {
            borderColor: '#fff',
            borderWidth: 4,
          },
        },
        label: {
          show: true,
          formatter: (obj) => {
            let rate = obj.data.value / 100;
            if (rate === 0) {
              rate = '<0.01%';
            } else {
              rate += '%';
            }
            return `{name|${obj.data.name}} {per|${rate}}`;
          },
          marginBottom: 4,
          position: 'outside',
          lineHeight: 14,
          fontWeight: 'normal',
          rich: {
            name: {
              color: 'rgba(0, 0, 0, 0.65)',
              fontSize: 14
            },
            per: {
              color: 'rgba(0, 0, 0, 0.45)',
              fontSize: 14
            },
          }
        },
        labelLine: {
          length: 10
        },
        emphasis: {
          label: {
            formatter: (obj) => {
              let rate = obj.data.value / 100;
              if (rate === 0) {
                rate = '<0.01%';
              } else {
                rate += '%';
              }
              return `${obj.data.name} ${rate}`;
            },
            fontSize: 14,
            fontWeight: 'normal',
            marginBottom: 4
          }
        }
      }]
    };
    this.myChart = echarts.init(this.sexChartRef);
    this.myChart.setOption(option);
    setTimeout(() => {
      this.myChart.on('mouseover', (params) => {
        if (params.seriesIndex === 1) {
          this.setState({
            activeIndex: params.dataIndex
          });
        }
      });
      this.myChart.on('mouseout', (params) => {
        this.setState({
          activeIndex: null
        });
      });
    }, 500);
  }

  render() {
    return (
      <div className="sex-chart-wrap">
        <div ref={refsNode => this.sexChartRef = refsNode} className="sex-chart" />
      </div>
    );
  }
}
export default connect(({ system }) => ({
  system: system.toJS()
}))(SexChart);
