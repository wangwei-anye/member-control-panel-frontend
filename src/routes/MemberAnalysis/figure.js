import React, { Component } from 'react';
import { Row, Col, Empty } from 'antd';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _forEach from 'lodash/forEach';
import { getPortrait } from 'services/memberAnalysis';
import CustomCard from './components/CustomCard';

/* eslint-disable */
import { default as SexChart } from './components/SexChart';
import { default as RegisterMethodChart } from './components/RegisterMethodChart';
/* eslint-enable */

import CoinMemberChart from './components/CoinMemberChart';

export default class MemberFigure extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coinMemberData: [],
      sexData: [],
      registerMemberTotal: 0,
      registerMemberData: [],
      loading: true,
    };
  }
  componentDidMount() {
    getPortrait().then((res) => {
      if (res.data && res.data.status) {
        const data = _get(res, 'data.data');
        this.setState({
          loading: false,
          coinMemberData: this.mappingCoinMember(
            _get(data, 'points_member_rate')
          ),
          sexData: this.mappingSex(_get(data, 'member_sex_rate')),
          registerMemberTotal: _get(data, 'member_register_type_rate.total'),
          registerMemberData: this.mappingRegisterMember(
            _get(data, 'member_register_type_rate.rate')
          ),
        });
      }
    });
  }
  mappingCoinMember = (data) => {
    const result = [];
    const NAME_MAP = {
      general_member: '普通會員',
      points_member: '積分會員',
    };
    _forEach(data, (val, key) => {
      result.push({
        name: NAME_MAP[key],
        value: val.number,
        rate: val.rate,
      });
    });
    return result;
  };
  mappingSex = (data) => {
    const result = [];
    const NAME_MAP = {
      man: '男性',
      woman: '女性',
      unknown: '未知',
      other: '其他',
    };
    _forEach(data, (val, key) => {
      result.push({
        name: NAME_MAP[key],
        value: parseFloat(val) * 100,
      });
    });
    return result;
  };
  mappingRegisterMember = (data) => {
    const result = [];
    const NAME_MAP = {
      1: '郵箱',
      2: 'Facebook',
      3: 'Google',
      4: '用戶名',
      5: '手機號',
      6: '微信',
      7: 'Twitter',
      8: 'Apple',
      null: '未知',
      0: '未知',
    };
    _forEach(data, (val, key) => {
      result.push({
        name: NAME_MAP[key],
        value: parseFloat(val) * 100,
      });
    });
    return result;
  };
  render() {
    return (
      <Row gutter={24} className="member-figure">
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          xl={12}
          style={{ marginBottom: 24 }}
        >
          <CustomCard title="會員性別比例" loading={this.state.loading}>
            {this.state.sexData.length ? (
              <SexChart
                ydata={this.state.sexData}
                isLoading={this.state.loading}
              />
            ) : (
              <Empty className="figure-chart__empty" />
            )}
          </CustomCard>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          xl={12}
          style={{ marginBottom: 24 }}
        >
          <CustomCard title="會員註冊方式佔比" loading={this.state.loading}>
            {this.state.registerMemberData.length ? (
              <RegisterMethodChart
                ydata={this.state.registerMemberData}
                total={this.state.registerMemberTotal}
                isLoading={this.state.loading}
              />
            ) : (
              <Empty className="figure-chart__empty" />
            )}
          </CustomCard>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          xl={12}
          style={{ marginBottom: 24 }}
        >
          <CustomCard title="積分會員佔比" loading={this.state.loading}>
            {this.state.coinMemberData.length ? (
              <CoinMemberChart
                ydata={this.state.coinMemberData}
                isLoading={this.state.loading}
              />
            ) : (
              <Empty className="figure-chart__empty" />
            )}
          </CustomCard>
        </Col>
      </Row>
    );
  }
}
