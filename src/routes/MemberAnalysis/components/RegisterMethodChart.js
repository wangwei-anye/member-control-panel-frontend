import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'dva';
import _map from 'lodash/map';
import _slice from 'lodash/slice';
import _find from 'lodash/find';
import { numChineseFormat } from 'utils/tools';
import './chartcommon.less';

const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/pie');

export class RegisterMethodChart extends React.Component {
  color = ['#3ba0ff', '#36cbcb', '#f04864', '#fad337', '#4dcb73', '#f2637b', '#975fe4', '#5990ff'];
  constructor(props) {
    super(props);
    this.mychart = null;
    this.state = {
      activeIndex: null
    };
  }
  static propTypes = {
    ydata: PropTypes.array,
    isLoading: PropTypes.bool,
    total: PropTypes.number
  }
  static defaultProps = {
    ydata: [],
    total: 0,
    isLoading: false
  }
  componentDidMount() {
    setTimeout(() => {
      this.renderChart();
    }, 1);
    window.addEventListener('resize', this.resizeChart);
  }
  componentWillReceiveProps(nextProps) {
    const loading = this.props.isLoading && !nextProps.isLoading;
    if (loading) {
      setTimeout(() => {
        this.renderChart();
      }, 1);
    }
    if (this.props.system.menuCollapsed !== nextProps.system.menuCollapsed) {
      this.resizeChart();
    }
  }
  resizeChart = () => {
    if (this.myChart) {
      setTimeout(() => {
        this.myChart.resize();
      }, 220);
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
    const color = this.color;
    const radius = [90, 120];
    const center = ['50%', '50%'];
    const ydata = this.props.ydata;
    const rich = {
      text: {
        color: 'rgba(0,0,0,0.45)',
        fontSize: 14,
        align: 'center',
        verticalAlign: 'middle',
        padding: 8
      },
      value: {
        color: 'rgba(0,0,0,0.85)',
        fontSize: 30,
        align: 'center',
        marginTop: 3,
        verticalAlign: 'middle',
      },
    };
    const total = this.props.total;
    const option = {
      backgroundColor: '#ffffff',
      color,
      grid: {
        right: 0,
        left: 0,
        top: 0,
        bottom: 0
      },
      series: [{
        id: 'bg',
        type: 'pie',
        clockwise: false, // 饼图的扇区是否是顺时针排布
        radius,
        center,
        avoidLabelOverlap: false,
        itemStyle: { // 图形样式
          normal: {
            borderColor: '#ffffff',
            borderWidth: 4,
          },
        },
        label: {
          show: true,
          position: 'center',
          formatter: (obj) => {
            return `{text|總計}\n{value|${numChineseFormat(obj.value)}}`;
          },
          rich
        },
        silent: true,
        data: [{
          value: total,
          name: 'bg',
          selected: false,
          itemStyle: {
            color: ydata.length ? 'transparent' : 'rgba(0, 0, 0, 0.45)'
          }
        }]
      }, {
        type: 'pie',
        bg: 'actual',
        clockwise: false, // 饼图的扇区是否是顺时针排布
        minAngle: 2, // 最小的扇区角度（0 ~ 360）
        radius,
        center,
        avoidLabelOverlap: false,
        itemStyle: { // 图形样式
          normal: {
            borderColor: '#ffffff',
            borderWidth: 4,
          },
        },
        label: {
          show: false,
          position: 'center',
          formatter: '{text|{b}}\n{value|{c}}',
          rich,
          emphasis: {
            show: false
          }
        },
        data: ydata
      }]
    };
    this.myChart = echarts.init(this.registerMethodRef);
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

  handleItemOver = (index) => {
    this.setState({
      activeIndex: index
    });
    this.myChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 1,
      dataIndex: index
    });
  }
  handleItemLeave = (index) => {
    this.setState({
      activeIndex: null
    });
    this.myChart.dispatchAction({
      type: 'downplay',
      seriesIndex: 1,
      dataIndex: index
    });
  }

  render() {
    return (
      <div className="register-method-chart-wrap">
        <div ref={refsNode => this.registerMethodRef = refsNode} className="register-method-chart" />
        <div className="register-method__legend">
          {
            _map(this.props.ydata, (item, index) => {
              const isActive = this.state.activeIndex === index;
              const nameStyle = {
                color: 'rgba(0, 0, 0, 0.65)'
              };
              const seperatorStyle = {
                color: '#d9d9d9'
              };
              const valueStyle = {
                color: 'rgba(0, 0, 0, 0.45)'
              };
              if (isActive) {
                nameStyle.color = this.color[index];
                valueStyle.color = this.color[index];
              }
              let itemVal = (item.value / 100);
              if (itemVal === 0) {
                itemVal = '<0.01';
              }
              itemVal += '%';
              return (
                <div
                  key={index}
                  className="register-method__legend__item"
                  onMouseOver={() => this.handleItemOver(index)}
                  onMouseLeave={() => this.handleItemLeave(index)}
                  onFocus={() => {}}
                >
                  <span
                    className="register-method__legend__icon"
                    style={{ backgroundColor: this.color[index] }}
                  />
                  <span
                    className="register-method__legend__name"
                    style={nameStyle}
                  >{item.name}
                  </span>
                  <span
                    className="register-method__legend__seperator"
                    style={seperatorStyle}
                  >|
                  </span>
                  <span
                    className="register-method__legend__value"
                    style={valueStyle}
                  >{itemVal}
                  </span>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
export default connect(({ system }) => ({
  system: system.toJS()
}))(RegisterMethodChart);
