import React from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Spin } from 'antd';
import _map from 'lodash/map';
import _slice from 'lodash/slice';
import _get from 'lodash/get';
import { thousandFormat } from 'utils/tools';
import './summarytable.less';

export default class SummaryTable extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    loading: PropTypes.bool,
  }
  static defaultProps = {
    data: [],
    loading: true
  }
  render() {
    const data = this.props.data;
    const len = data.length;
    return (
      <Card
        style={{ marginTop: 24 }}
        bodyStyle={{ padding: '24px 24px 34px' }}
        bordered={false}
        title={null}
      >
        <React.Fragment>
          <p className="member-analysic__chart__title">{this.props.title}</p>
          <Spin spinning={this.props.loading}>
            <Row className="summary-table" gutter={0} type="flex">
              <Col className="summary-table--left" span={14}>
                <Row className="summary-table__title" justify="space-between">
                  <Col span={12} className="summary-table__time">計算時段（單日）</Col>
                  <Col span={12} className="summary-table__value">人數</Col>
                </Row>
                {
                  _map(_slice(data, 0, len - 1), (item, index) => {
                    return (
                      <Row className="summary-table__item" key={item.time} type="flex">
                        <Col className="summary-table__time" span={12}>{item.time}</Col>
                        <Col className="summary-table__value" span={12}>{item.value}</Col>
                      </Row>
                    );
                  })
                }
              </Col>
              <Col className="summary-table--right" span={10}>
                <div className="summary-table__total">
                  <div className="summary-table__time">截止目前為止 總數</div>
                  <div className="summary-table__value">
                    {thousandFormat(_get(_slice(data, len - 1, len)[0], 'value'))}
                  </div>
                </div>
              </Col>
            </Row>
          </Spin>

        </React.Fragment>
      </Card>
    );
  }
}
