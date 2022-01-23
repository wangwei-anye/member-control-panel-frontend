import React from 'react';
import { connect } from 'dva';
import _map from 'lodash/map';
import _reduce from 'lodash/reduce';
import { numChineseFormat } from 'utils/tools';
import { RegisterMethodChart } from './RegisterMethodChart';

const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/pie');
require('echarts/lib/component/legend');

class CoinMemberChart extends RegisterMethodChart {
  color = ['#3ba0ff', '#facc14']
  constructor(props) {
    super(props);
    this.mychart = null;
    this.state = {
      activeIndex: null,
      sum: 1
    };
  }
  renderChart = () => {
    const data = this.props.ydata;
    const sum = _reduce(data, (temp, a) => temp + a.value, 0) || 1;
    this.setState({ sum });
    const option = {
      color: this.color,
      backgroundColor: '#fff',
      series: [{
        type: 'pie',
        radius: 120,
        startAngle: 180,
        center: ['50%', '50%'],
        data,
        itemStyle: { // 图形样式
          borderColor: '#fff',
          borderWidth: 4,
        },
        label: {
          show: false
        }
      }]
    };
    this.myChart = echarts.init(this.coinMemberChartRef);
    this.myChart.setOption(option);
    setTimeout(() => {
      this.myChart.on('mouseover', (params) => {
        if (params.seriesIndex === 0) {
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
      seriesIndex: 0,
      dataIndex: index
    });
  }
  handleItemLeave = (index) => {
    this.setState({
      activeIndex: null
    });
    this.myChart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0,
      dataIndex: index
    });
  }
  render() {
    return (
      <div className="coin-member-chart-wrap">
        <div ref={refsNode => this.coinMemberChartRef = refsNode} className="coin-member-chart" />
        <div className="coin-member__legend" style={{ right: '8%' }}>
          {
            _map(this.props.ydata, (item, index) => {
              const isActive = this.state.activeIndex === index;
              const nameStyle = {
                color: 'rgba(0, 0, 0, 0.65)'
              };
              const seperatorStyle = {
                color: '#d9d9d9'
              };
              const perStyle = {
                color: 'rgba(0, 0, 0, 0.45)'
              };
              if (isActive) {
                nameStyle.color = this.color[index];
                perStyle.color = this.color[index];
              }
              const value = item.value;
              let per = item.rate;
              if (per === '0.0%') {
                per = '<0.01%';
              }
              return (
                <div
                  key={index}
                  className="coin-member__legend__item"
                  onMouseOver={() => this.handleItemOver(index)}
                  onMouseLeave={() => this.handleItemLeave(index)}
                  onFocus={() => {}}
                >
                  <span
                    className="coin-member__legend__icon"
                    style={{ backgroundColor: this.color[index] }}
                  />
                  <span
                    className="coin-member__legend__name"
                    style={nameStyle}
                  >{item.name}
                  </span>
                  <span
                    className="coin-member__legend__seperator"
                    style={seperatorStyle}
                  >|
                  </span>
                  <span
                    className="coin-member__legend__per"
                    style={perStyle}
                  >{per}
                  </span>
                  <span
                    className="coin-member__legend__value"
                    style={nameStyle}
                  >{numChineseFormat(value)}
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
}))(CoinMemberChart);
