import React, { Component } from 'react';
import { Row, Col } from 'antd';
import AuthWrapCom from 'components/AuthCom';
import TrendChartCard from './components/TrendChartCard';
import SourceChart from './components/SourceChart';
import OverviewCard from './components/OverviewCard';
import SourceChartCard from './components/SourceChartCard';
import RecommendMember from './components/RecommendMember';
import MergeMember from './components/MergeMember';

import './trend.less';

const OVERVIEW_RIGHT = ['member_analysis', 'member_trend', 'member_overview'];
const MERGE_RIGHT = ['member_analysis', 'member_trend', 'merge'];
const RECOMMEND_RIGHT = ['member_analysis', 'member_trend', 'referral'];
const CHART_RIGHT = ['member_analysis', 'member_trend', 'register_chart'];
const SOURCE_RIGHT = ['member_analysis', 'member_trend', 'register_source'];

export default class MemberTrend extends Component {
  render() {
    return (
      <div className="member-analysic__trend">
        <AuthWrapCom
          authList={OVERVIEW_RIGHT}
        >
          <OverviewCard />
        </AuthWrapCom>
        <AuthWrapCom
          authList={CHART_RIGHT}
        >
          <TrendChartCard />
        </AuthWrapCom>
        <AuthWrapCom
          authList={SOURCE_RIGHT}
        >
          <SourceChartCard />
        </AuthWrapCom>
        <Row gutter={24}>
          <AuthWrapCom
            authList={RECOMMEND_RIGHT}
          >
            <Col span={12}>
              <RecommendMember />
            </Col>
          </AuthWrapCom>
          <AuthWrapCom
            authList={MERGE_RIGHT}
          >
            <Col span={12}>
              <MergeMember />
            </Col>
          </AuthWrapCom>
        </Row>
      </div>
    );
  }
}
