import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import _map from 'lodash/map';
import _slice from 'lodash/slice';
import _noop from 'lodash/noop';
import { thousandFormat } from 'utils/tools';
import './sourcechart.less';

const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/pie');

const color = ['#3ba0ff', '#36cbcb', '#4dcb73', '#fad337', '#f2637b', '#975fe4', '#5990ff', '#88ce1e', '#f7774c', '#f95eb3'];
const { Paragraph } = Typography;

class SourceChart extends React.Component {
  constructor(props) {
    super(props);
    this.mychart = null;
    this.state = {
      activeIndex: null
    };
  }
  static propTypes = {
    ydata: PropTypes.array,
    total: PropTypes.number
  }
  static defaultProps = {
    ydata: [],
    total: 0
  }
  componentDidMount() {
    setTimeout(() => {
      this.renderChart();
    }, 1);
    window.addEventListener('resize', this.resizeChart);
  }
  componentWillReceiveProps(nextProps) {
    const loading = this.props.isLoading && !nextProps.isLoading;
    const totalChange = this.props.total !== undefined && this.props.total !== nextProps.total;
    if (loading || totalChange) {
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
    const radius = [90, 120];
    const center = ['50%', '50%'];
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
    const option = {
      backgroundColor: '#ffffff',
      color,
      tooltip: {
        show: true,
        padding: 8,
        borderWidth: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        textStyle: {},
        formatter: (params) => {
          if (params.seriesName === 'sourceChartSeries') {
            const tooltipData = params.data;
            return `
              <div>
                <div>
                <span style="display:inline-block;margin-right:5px;border-radius:6px;width:6px;height:6px;background-color:${params.color};"></span>
                ${tooltipData.name}</div>
                <span style="padding-left: 13px;">
                  <span style="margin-right: 35px;">${tooltipData.rate}</span>
                  ${thousandFormat(tooltipData.value)}
                </span>
              </div>
            `;
          }
        }
      },
      grid: { right: 0, left: 0 },
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
            const str = obj.value.toLocaleString('en-US');
            return `{text|時段總計}\n{value|${str}}`;
          },
          rich
        },
        silent: true,
        data: [{
          value: this.props.total,
          name: 'bg',
          selected: false,
          itemStyle: {
            color: this.props.ydata.length ? 'transparent' : 'rgba(0, 0, 0, 0.45)'
          }
        }]
      }, {
        type: 'pie',
        bg: 'actual',
        name: 'sourceChartSeries',
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
          show: false
        },
        data: this.props.ydata
      }]
    };
    this.myChart = echarts.init(this.sourceChartRef);
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
    this.myChart.dispatchAction({
      type: 'showTip',
      seriesIndex: 1,
      dataIndex: index,
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
    this.myChart.dispatchAction({
      type: 'hideTip',
      seriesIndex: 1,
      dataIndex: index,
    });
  }

  render() {
    const { menuCollapsed } = this.props.system;
    const groupStyle = {};
    if (menuCollapsed) {
      groupStyle.marginLeft = 60;
    }
    return (
      <div className="source-chart-wrap">
        <div className="source-chart-top">
          <div ref={refsNode => this.sourceChartRef = refsNode} className="source-chart" />
          <div className="source-chart__legend">
            {
              this.props.ydata.length > 0 ?
                <div className="source-chart__legend__group">
                  <p className="source-chart__legend__title">TOP 01-05</p>
                  <div className="source-chart__legend__list">
                    {
                      _slice(this.props.ydata, 0, 5).map((item, index) => {
                        const isActive = this.state.activeIndex === index;
                        const normalStyle = {
                          color: 'rgba(0, 0, 0, 0.65)'
                        };
                        const perStyle = {
                          color: 'rgba(0, 0, 0, 0.45)'
                        };
                        if (isActive) {
                          normalStyle.color = color[index];
                          perStyle.color = color[index];
                        }
                        return (
                          <div
                            key={item.name}
                            className="source-chart__legend__item"
                            onMouseOver={() => this.handleItemOver(index)}
                            onMouseLeave={() => this.handleItemLeave(index)}
                            onFocus={_noop}
                          >
                            <span className="source-chart__legend__badge" style={{ background: color[index] }} />
                            <span
                              className="source-chart__legend__name"
                              style={normalStyle}
                            >
                              <Paragraph ellipsis style={{ marginBottom: 0, ...normalStyle }}>
                                {item.name}
                              </Paragraph>
                            </span>
                            <span className="source-chart__legend__seperator">|</span>
                            <span
                              className="source-chart__legend__per"
                              style={perStyle}
                            >{item.rate === '0.0%' ? '<0.01%' : item.rate}
                            </span>
                            <span
                              className="source-chart__legend__val"
                              style={normalStyle}
                            >{thousandFormat(item.value)}
                            </span>
                          </div>
                        );
                      })
                    }
                  </div>
                </div> : null
            }
            {
              this.props.ydata.length > 5 ?
                <div className="source-chart__legend__group" style={groupStyle}>
                  <p className="source-chart__legend__title">TOP 06-10</p>
                  <div className="source-chart__legend__list">
                    {
                      _slice(this.props.ydata, 5, 10).map((item, index) => {
                        const isActive = this.state.activeIndex === index + 5;
                        const normalStyle = {
                          color: 'rgba(0, 0, 0, 0.65)'
                        };
                        const perStyle = {
                          color: 'rgba(0, 0, 0, 0.45)'
                        };
                        if (isActive) {
                          normalStyle.color = color[index + 5];
                          perStyle.color = color[index + 5];
                        }
                        return (
                          <div
                            key={item.name}
                            className="source-chart__legend__item"
                            onMouseOver={() => this.handleItemOver(index + 5)}
                            onMouseLeave={() => this.handleItemLeave(index + 5)}
                            onFocus={_noop}
                          >
                            <span className="source-chart__legend__badge" style={{ background: color[index + 5] }} />
                            <span
                              className="source-chart__legend__name"
                              style={normalStyle}
                            >{item.name}
                            </span>
                            <span className="source-chart__legend__seperator">|</span>
                            <span
                              className="source-chart__legend__per"
                              style={perStyle}
                            >{item.rate === '0.0%' ? '<0.01%' : item.rate}
                            </span>
                            <span
                              className="source-chart__legend__val"
                              style={normalStyle}
                            >{thousandFormat(item.value)}
                            </span>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
                : null
            }
          </div>
        </div>
        <div className="source-chart__desc">截止於當前時間 30分鐘前的數據</div>
      </div>
    );
  }
}
export default connect(({ system }) => ({
  system: system.toJS()
}))(SourceChart);
