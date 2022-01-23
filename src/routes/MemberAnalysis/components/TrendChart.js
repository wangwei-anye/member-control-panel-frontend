import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _map from 'lodash/map';
import _first from 'lodash/first';
import _last from 'lodash/last';
import _get from 'lodash/get';
import _debounce from 'lodash/debounce';
import { connect } from 'dva';
import { numChineseFormat } from 'utils/tools';
import { getDateRange, padData } from '../util/index';
import './trendchart.less';
/* eslint-disable */
const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/line');
require('echarts/lib/component/tooltip');
/* eslint-enable */

class TrendChart extends React.Component {
  constructor(props) {
    super(props);
    this.mychart = null;
    this.renderChart = _debounce(this.renderChart, 100);
  }
  static propTypes = {
    isLoading: PropTypes.bool,
    yTick: PropTypes.arrayOf(PropTypes.number).isRequired,
    data: PropTypes.array.isRequired,
    showType: PropTypes.oneOf(['date', 'datetime', 'time']),
  }
  static defaultProps = {
    showType: 'datetime',
  }
  componentDidMount() {
    setTimeout(() => {
      this.renderChart();
    }, 1);
    window.addEventListener('resize', this.resizeChart);
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
    const { yTick, data, showType, active, time } = this.props;
    const min = 0;
    const max = yTick.length ? yTick[yTick.length - 1] : 100;
    const interval = yTick.length > 1 ? yTick[1] - yTick[0] : 10;
    const seriesData = _map(data, (item) => {
      return {
        name: item.name,
        value: [item.name, item.value],
      };
    });

    // 添加空白距离点（用于右边留空）
    const minTime = _get(_first(seriesData), 'name') || moment().startOf('day').format('YYYY-MM-DD HH:mm:ss');
    let maxTime = _get(_last(seriesData), 'name') || moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    const intervalTime = seriesData.length > 1
      ? (moment(seriesData[1].name) - moment(seriesData[0].name)) : (1000 * 60 * 60 * 4);
    const halfOfInterval = parseInt(intervalTime / 2, 10);
    if (seriesData.length > 1) {
      const lastChildTime = seriesData[seriesData.length - 1].value[0];
      const lastChildN_1Time = seriesData[seriesData.length - 2].value[0];
      const pd = moment(lastChildTime) - moment(lastChildN_1Time);
      let finalTime = maxTime;

      // 最后一个
      if (seriesData.length > 9) { // 如果数据达到9个以上直接增加一个间隔空隙
        finalTime = moment(maxTime).add(intervalTime, 'ms').format('YYYY-MM-DD HH:mm:ss');
      } else {
        // eslint-disable-next-line no-lonely-if
        if (pd !== intervalTime && pd > halfOfInterval) {
          // 如果最后两个数据的时间差不是固定间隔并且时间差大于一半间隔
          // showType如果是datetime增加一半间隔
          // 为其他增加 间隔 - 时间差
          if (showType === 'datetime') {
            finalTime = moment(maxTime).add(halfOfInterval, 'ms').format('YYYY-MM-DD HH:mm:ss');
          } else {
            finalTime = moment(maxTime).add(intervalTime - pd - 1000, 'ms').format('YYYY-MM-DD HH:mm:ss');
          }
        } else {
          finalTime = moment(maxTime).add(halfOfInterval, 'ms').format('YYYY-MM-DD HH:mm:ss');
        }
      }
      seriesData.push({
        name: finalTime,
        value: ''
      });
      maxTime = finalTime;
    }

    const namePad = showType === 'datetime' ? 65 : 44;
    let xAxisName = '{b|日期}\n{b|時/分}';
    if (showType === 'date') {
      xAxisName = '{b|日期}';
    } else if (showType === 'time') {
      xAxisName = '{b|時 / 分}';
    }

    const nameRight = -52;

    const option = {
      backgroundColor: '#fff',
      grid: { left: 56, right: 0, top: 56, bottom: 52 },
      xAxis: {
        boundaryGap: false,
        type: 'time',
        name: xAxisName,
        min: minTime,
        max: maxTime,
        interval: intervalTime,
        axisLine: { lineStyle: { color: '#f0f2f5' } },
        data: _map(seriesData, 'name'),
        nameTextStyle: {
          color: 'rgba(0, 0, 0, 0.65)',
          fontSize: 12,
          fontWeight: 'bold',
          padding: [namePad, 0, 0, nameRight],
          rich: {
            b: {
              lineHeight: 20
            }
          }
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          show: seriesData.length > 0,
          formatter: (valTemp, index) => {
            const m = moment(valTemp);
            if (!(seriesData[index] && seriesData[index].value && seriesData[index].value[1] !== '')) { // ‘’ 为最后一个为了间隔的label,不要显示
              return '';
            }

            if (showType === 'date') {
              const date = m.format('MM-DD');
              return `{a|${date}}`;
            }
            if (showType === 'datetime') {
              const date = m.format('YYYY-MM-DD');
              const showTime = m.format('HH:mm');
              return `{a|${date}}\n{a|${showTime}}`;
            }
            if (showType === 'time') {
              const showTime = m.format('HH:mm');
              return `{a|${showTime}}`;
            }
          },
          showMaxLabel: false,
          color: 'rgba(0, 0, 0, 0.65)',
          margin: 12,
          rich: {
            a: {
              lineHeight: 20
            }
          }
        },
        axisTick: { alignWithLabel: true, lineStyle: { color: '#e9e9e9' } }
      },
      yAxis: {
        name: '會員數',
        nameLocation: 'end',
        nameGap: 30,
        min,
        max,
        interval,
        nameTextStyle: {
          padding: [0, 70, 0, 0],
          color: 'rgba(0, 0, 0, 0.65)',
          fontSize: 12,
          fontWeight: 'bold',
        },
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: 'rgba(0, 0, 0, 0.65)',
          margin: 16,
          formatter: (value, index) => {
            const formatVal = numChineseFormat(value, 5, 0);
            return formatVal;
          }
        }
      },
      tooltip: {
        show: seriesData.length > 0,
        trigger: 'axis',
        padding: [8, 12],
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        formatter(params) {
          const { name: timeTemp, value: tempCount, seriesName } = params[0];
          let formatTime = timeTemp;
          const [a, b] = tempCount;
          if (b === '' || b === null) { // '' 和 null 为自构造数据，不需要显示
            return '';
          }
          if (showType === 'date') {
            formatTime = moment(timeTemp).format('YYYY-MM-DD');
          } else if (showType === 'datetime') {
            formatTime = moment(timeTemp).format('YYYY-MM-DD HH:mm');
          } else {
            formatTime = moment(timeTemp).format('HH:mm');
          }
          return `
              <div style="font-weight: normal; line-height: 22px;">
                  <div style="margin-bottom: 4px;">${formatTime}</div>
                  <span style="display:inline-block;margin-right:5px;border-radius:6px;width:6px;height:6px;background-color:#1890ff;"></span>
                  <span style="margin-right: 24px;">${seriesName}</span>
                  ${b}
              </div>
            `;
        },
        axisPointer: {
          lineStyle: {
            color: 'rgba(0, 0, 0, 0.65)'
          }
        }
      },
      series: [{
        data: seriesData,
        type: 'line',
        name: '會員數',
        showSymbol: false,
        smooth: true,
        lineStyle: {
          color: '#1890FF'
        },
        areaStyle: {
          color: '#1890FF',
          opacity: 0.2
        }
      }],
      color: ['#1890ff']
    };
    this.myChart = echarts.init(this.trendChartRef);
    this.myChart.setOption(option);
  }

  render() {
    let cls = 'trend-chart';
    if (this.props.showType === 'datetime') {
      cls += ' trend-chart__datetime';
    }
    return (
      <div className="trend-chart-wrap">
        <div ref={refsNode => this.trendChartRef = refsNode} className={cls} />
      </div>
    );
  }
}
export default connect(({ system }) => ({
  system: system.toJS()
}))(TrendChart);
