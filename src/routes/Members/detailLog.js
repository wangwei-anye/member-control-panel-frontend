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

const couponListRights = ['member_manage', 'member_detail', 'update_log']; // 查看優惠券列表

const profileName = {
  username: '會員名稱',
  nick_name: '暱稱',
  email: '電郵',
  telephone: '電話',
  gender: '性別',
  date_of_birth: '出生日期',
  id_place: '居住地區',
  promotion: '接收會員優惠及活動咨詢信息',
  create_account: '創建會員帳號',
};

const genderName = {
  0: '未知',
  1: '男',
  2: '女',
  3: '其他',
};

const promotionName = {
  0: '不接收資訊',
  1: '接收資訊',
};

class UserLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  columns = [
    {
      title: '日期/時間',
      dataIndex: 'updated_at',
    },
    {
      title: '更改資料',
      render: (record) => {
        if (profileName[record.updated_profile_field]) {
          return profileName[record.updated_profile_field];
        }
        return record.updated_profile_field;
      },
    },
    {
      title: '更改後',
      render: (record) => {
        if (
          record.updated_profile_field === 'gender' &&
          record.data_after &&
          genderName[record.data_after]
        ) {
          return genderName[record.data_after];
        }
        if (
          record.updated_profile_field === 'promotion' &&
          record.data_after &&
          promotionName[record.data_after]
        ) {
          return promotionName[record.data_after];
        }
        if (
          record.updated_profile_field === 'date_of_birth' &&
          record.data_after
        ) {
          return record.data_after.substr(0, 10);
        }
        return record.data_after;
      },
    },
    {
      title: '來自',
      dataIndex: 'updated_channel',
    },
  ];
  render() {
    const { data, total } = this.props.memberInfo.userLogInfo;
    return (
      <div className="user-detail-wrap">
        <div className="user-coupon-wrap">
          <TabRouter tabList={MEMBER_DETAIL_TABLIST} defaultKey="log" />
          <div className="coupon-content">
            {isUserHasRights(couponListRights) ? (
              <Table
                columns={this.columns}
                dataSource={data}
                rowKey="id"
                pagination={{ total }}
              />
            ) : (
              // <p className="no-persission-tips">沒有權限查看優惠券列表</p>
              <Alert message="沒有權限查看更改日誌列表" type="error" showIcon />
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
  }))(UserLog)
);
