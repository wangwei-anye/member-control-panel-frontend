import React, { Component } from 'react';
import { Card, Row, Col, DatePicker, Statistic, Icon, Spin } from 'antd';
import moment from 'moment';
import _get from 'lodash/get';
import { getOverview } from 'services/memberAnalysis';

import '../trend.less';


const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

export default class OverviewCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overViewLoading: true,
      overViewData: {
        register_total: 0,
        yesterday_register: {
          change: '',
          rate: '0%',
          total: 0
        }
      }
    };
  }
  componentDidMount() {
    const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    this.getOverviewDate(yesterday);
  }
  getOverviewDate = async (date) => {
    await this.setState({ overViewLoading: true });
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    getOverview(date).then((res) => {
      if (res.data && res.data.status) {
        this.setState({
          overViewLoading: false,
          overViewData: res.data.data
        });
      }
    });
  }
  disableOverviewDate = (current) => {
    const morning = moment().hour(0).minute(0).second(0);
    if (current.isAfter(morning)) {
      return true;
    }
    return false;
  }
  handleChangeSummeryDate = (date, dateString) => {
    this.getOverviewDate(dateString);
  }
  mapOverViewIcon = () => {
    const change = _get(this.state.overViewData, 'yesterday_register.change') || '';
    const mapTemp = {
      '': 'minus',
      up: 'caret-up',
      down: 'caret-down'
    };
    return mapTemp[change];
  }
  mapOverViewIconColor = () => {
    const change = _get(this.state.overViewData, 'yesterday_register.change') || '';
    const mapTemp = {
      '': 'rgba(0, 0, 0, 0.25)',
      up: '#52c41a',
      down: '#f5222d'
    };
    return mapTemp[change];
  }
  render() {
    const yesterday = moment().subtract(1, 'day');
    return (
      <Card
        bodyStyle={{ padding: '32px 24px 34px' }}
        bordered={false}
        title="會員數據概覽"
        extra={
          <DatePicker
            allowClear={false}
            disabledDate={this.disableOverviewDate}
            defaultValue={yesterday}
            format={dateFormat}
            onChange={this.handleChangeSummeryDate}
          />
        }
      >
        <Spin spinning={this.state.overViewLoading} tip="加載中">
          <Row gutter={16}>
            <Col span={12}>
              <Statistic title="昨日新增註冊會員" value={_get(this.state.overViewData, 'yesterday_register.total')} />
              <div className="member-analysic__trend__updown">
                <Icon
                  type={this.mapOverViewIcon()}
                  style={{
                    color: this.mapOverViewIconColor(),
                    marginRight: 4
                  }}
                />
                {_get(this.state.overViewData, 'yesterday_register.rate')}
              </div>
            </Col>
            <Col span={12}>
              <Statistic title="註冊會員總數" value={_get(this.state.overViewData, 'register_total')} />
            </Col>
          </Row>
        </Spin>
      </Card>
    );
  }
}
