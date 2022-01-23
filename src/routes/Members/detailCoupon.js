/* 用户优惠券 */

import React from 'react';
import { Icon, Alert, Divider } from 'antd';
import Table from 'components/Table';
import moment from 'moment';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import TabRouter from 'components/TabRouter';
import { isUserHasRights } from 'utils/tools';
import {
  APP_TO_JSON,
  COUPON_STATUS,
  USRE_TYPE,
  MEMBER_DETAIL_TABLIST,
} from 'config/ob.config.js';
import './members.less';

const couponListRights = [
  'member_manage',
  'member_detail',
  'coupon_detail',
  'coupon_list',
]; // 查看優惠券列表
const linkRights = [
  'member_manage',
  'member_detail',
  'coupon_detail',
  'order_number_url',
]; // 查看訂單號跳轉鏈接(到訂單詳情)
class UserCoupon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  columns = [
    {
      title: '優惠券編號',
      dataIndex: 'coupon_id',
    },
    {
      title: '優惠券名稱',
      dataIndex: 'name',
    },
    {
      title: '領取時間',
      render: (record) => {
        return moment(record.created_at);
      },
    },
    {
      title: '優惠券使用規則',
      dataIndex: 'use_rule',
    },
    {
      title: '發放渠道',
      render: (record) => {
        return APP_TO_JSON[record.grant_channel];
      },
    },
    {
      title: '相關訂單號',
      dataIndex: 'order_id',
    },
    {
      title: '狀態',
      render: (record) => {
        return (
          <span className={record.status == 1 ? 'use status' : 'un-use status'}>
            {COUPON_STATUS[record.status]}
          </span>
        );
      },
    },
  ];
  render() {
    const { list, total } = this.props.memberInfo.userCouponInfo;
    return (
      <div className="user-detail-wrap">
        <div className="user-coupon-wrap">
          <TabRouter tabList={MEMBER_DETAIL_TABLIST} defaultKey="coupon" />
          <div className="coupon-content">
            {isUserHasRights(couponListRights) ? (
              <Table
                columns={this.columns}
                dataSource={list}
                rowKey="id"
                pagination={{ total }}
              />
            ) : (
              // <p className="no-persission-tips">沒有權限查看優惠券列表</p>
              <Alert message="沒有權限查看優惠券列表" type="error" showIcon />
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ memberInfo, system }) => ({
    memberInfo: memberInfo.toJS(),
    system: system.toJS(),
  }))(UserCoupon)
);
