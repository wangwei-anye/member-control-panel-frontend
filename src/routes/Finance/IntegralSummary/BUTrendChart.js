import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import { Card } from 'antd';
import { fetchBUTrendRequest } from 'services/finance/integral-summary/summary';
import ChartCom from './ChartCom';
import HeaderSelectCom from './components/HeaderSelectCom';
import '../finance.less';

const defaultPartmentList = [
  {
    name: '全部展示',
    id: 0
  },
  {
    name: '合併展示',
    id: 'and'
  }
];
const dayTypeList = [
  {
    label: '近7天',
    value: 'week'
  },
  {
    label: '近30天',
    value: 'month'
  }
];
const findPartment = list => {
  let result = [];
  list.forEach(item => {
    if (item.child && Array.isArray(item.child) && item.child.length) {
      result = result.concat(findPartment(item.child));
    } else {
      result = result.concat({ name: item.name, id: item.id });
    }
  });
  return result;
};
const list2Json = list => {
  const result = {};
  list.forEach(item => {
    result[item.id] = item.name;
    result[item.name] = item.id;
  });
  return result;
};
// 创建默认的value
const createDefaultValue = (length, value = 0) => {
  return Array.from({ length }, (item, index) => value);
};
const oneDayMs = 24 * 60 * 60 * 1000;
// 创建默认从当前时间 近 7 / 30 天
const createDayList = (length = 7) => {
  const dayList = [];
  const current = Date.now();
  for (let i = length - 1; i > 0; i -= 1) {
    const day = current - (length - i) * oneDayMs;
    dayList.push(moment(day).format('YYYY-MM-DD'));
  }
  return dayList.reverse();
};
class BUTrendChartPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      offerPartment: defaultPartmentList[0].id,
      offerDayType: dayTypeList[0].value,
      offerLoading: false,
      consumePartment: defaultPartmentList[0].id,
      consumeDayType: dayTypeList[0].value,
      consumeLoading: false,
      partmentList: defaultPartmentList.concat(
        findPartment(props.system.partmentList)
      ),
      partmentJson: list2Json(findPartment(props.system.partmentList)),
      offerChartValueList: [],
      consumeChartValueList: []
    };
  }
  componentDidMount() {
    this.updateStateByProps(this.props);
    Promise.all([
      this.fetchData('offerPartment'),
      this.fetchData('consumePartment')
    ]);
  }
  componentWillReceiveProps(nextProps) {
    this.updateStateByProps(nextProps);
  }
  updateStateByProps(newProps) {
    const { partmentList } = this.props.system;
    const newParmentList = newProps.system.partmentList;
    if (newParmentList.length !== partmentList.length) {
      this.setState({
        partmentList: defaultPartmentList.concat(findPartment(newParmentList)),
        partmentJson: list2Json(findPartment(newParmentList))
      });
    }
  }
  handleSelectChange = async (type, value) => {
    await this.setState({
      [type]: value
    });
    await this.fetchData(type);
  };
  handleDateTypeChange = async (type, valueObj) => {
    await this.setState({
      [type]: valueObj.value
    });
    await this.fetchData(type);
  };
  async fetchData(type) {
    const { state } = this;
    const fetchType = type.startsWith('offer') ? 'offer' : 'consume';
    const fetchTypeLoading = `${fetchType}Loading`;
    this.setState({
      [fetchTypeLoading]: true
    });
    const partment = state[`${fetchType}Partment`];
    const dimension = state[`${fetchType}DayType`];
    const { data } = await fetchBUTrendRequest({
      type: fetchType,
      dimension,
      department_id: partment === 'and' ? '' : partment
    });
    if (data.status) {
      const dataInfo = data.data;
      const chartValueList = [];
      if (Array.isArray(dataInfo)) {
        const obj = {
          valueList: [],
          labelList: [],
          name:
            partment === 'and'
              ? '合併展示'
              : state.partmentJson[partment] || '--',
          partmentId: partment
        };
        if (dataInfo.length) {
          dataInfo.forEach(item => {
            obj.valueList.push(+(item.offer_cent || item.pay_cent || 0));
            obj.labelList.push(item.count_date);
          });
        } else {
          // 没有数据，则用默认的数据
          obj.valueList = createDefaultValue(dimension === 'week' ? 7 : 30);
          obj.labelList = createDayList(dimension === 'week' ? 7 : 30);
        }
        chartValueList.push(obj);
      } else {
        Object.keys(dataInfo).forEach(item => {
          const obj = {
            valueList: [],
            labelList: [],
            name: '',
            partmentId: ''
          };
          obj.name = state.partmentJson[item] || '--';
          obj.partmentId = item;
          const valueList = dataInfo[item];
          if (Array.isArray(valueList)) {
            valueList.forEach(key => {
              obj.valueList.push(+(key.offer_cent || key.pay_cent || 0));
              obj.labelList.push(key.count_date);
            });
          }
          chartValueList.push(obj);
        });
      }
      this.setState({
        [`${fetchType}ChartValueList`]: chartValueList
      });
    }
    this.setState({
      [fetchTypeLoading]: false
    });
  }
  render() {
    const {
      offerPartment,
      offerDayType,
      consumePartment,
      consumeDayType,
      offerLoading,
      consumeLoading,
      partmentList,
      offerChartValueList,
      consumeChartValueList
    } = this.state;
    return (
      <div className="p-finance-common-wrap p-BU-trend-chart-wrap">
        <div className="m-trent-item-wrap">
          <Card title="積分發放走勢" bordered={false}>
            <div>
              <div>
                <HeaderSelectCom
                  partmentList={partmentList}
                  dayTypeList={dayTypeList}
                  isDisabled={offerLoading}
                  valueInfo={{ partment: offerPartment, date: offerDayType }}
                  onSelectChange={this.handleSelectChange.bind(
                    this,
                    'offerPartment'
                  )}
                  onDateTypeChange={this.handleDateTypeChange.bind(
                    this,
                    'offerDayType'
                  )}
                />
              </div>
              <div>
                <ChartCom
                  isLoading={offerLoading}
                  valueList={offerChartValueList}
                />
              </div>
            </div>
          </Card>
        </div>
        <div className="m-trent-item-wrap">
          <Card title="積分消費收分走勢" bordered={false}>
            <div>
              <HeaderSelectCom
                partmentList={partmentList}
                dayTypeList={dayTypeList}
                isDisabled={consumeLoading}
                valueInfo={{ partment: consumePartment, date: consumeDayType }}
                onSelectChange={this.handleSelectChange.bind(
                  this,
                  'consumePartment'
                )}
                onDateTypeChange={this.handleDateTypeChange.bind(
                  this,
                  'consumeDayType'
                )}
              />
            </div>
            <div>
              <ChartCom
                isLoading={consumeLoading}
                valueList={consumeChartValueList}
              />
            </div>
          </Card>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ system }) => {
    return {
      system: system.toJS()
    };
  })(BUTrendChartPage)
);
