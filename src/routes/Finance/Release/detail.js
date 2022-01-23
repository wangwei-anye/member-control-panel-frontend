import React from 'react';
import { Card, Button, message, Modal, Input, Spin } from 'antd';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import Table from 'components/Table';
import LoadingCom from 'components/LoadingCom';
import AuthWrapCom from 'components/AuthCom';
import GetImgByAuthCom from 'components/GetImgByAuthCom';
import {
  approvePassOrRejectRequst,
  approveFinancePassOrRejectRequst,
} from 'services/finance/release/release';
import { fetchAccoutDetail } from 'services/integralManage/give/give';
import moment from 'moment';
import {
  isUserHasRights,
  thousandFormat,
  convertValidDateToText,
} from 'utils/tools';
import { dimenssion2Json } from 'config/ob.config';
import ReleaseRuleCom from './components/ReleaseRuleCom';
import ReleaseEventCom from './components/ReleaseEventCom';
import '../finance.less';

const { TextArea } = Input;
const status2Json = {
  '-1': {
    name: '審批通過',
    className: 'status-give',
  },
  1: {
    name: '審批通過',
    className: 'status-give',
  },
  2: {
    name: '審批中',
    className: 'status-approve',
  },
  3: {
    name: '審批通過',
    className: 'status-give',
  },
  5: {
    name: '審批通過',
    className: 'status-give',
  },
  4: {
    name: '審批拒絕',
    className: 'status-reject',
  },
  20: {
    name: '審批中',
    className: 'status-approve',
  },
  21: {
    name: '審批拒絕',
    className: 'status-reject',
  },
  22: {
    name: '審批中',
    className: 'status-approve',
  },
};
// 審批按鈕狀態
const btnStatus2Json = {
  1: {
    name: '審批通過',
    className: 'status-give',
  },
  2: {
    name: '審批中',
    className: 'status-approve',
  },
  3: {
    name: '審批拒絕',
    className: 'status-reject',
  },
};

const entryType2Json = {
  1: '自定義發放',
  2: '固定發放',
};
class DetailPage extends React.Component {
  state = {
    isShowModal: false,
    isReject: false,
    isLoading: false,
    remark: '', // 拒绝或者通过的备注信息
  };
  optionType = 1;
  columns = [
    {
      title: '操作人',
      dataIndex: 'username',
    },
    {
      title: '操作時間',
      render: (text, record) => {
        return moment(record.created_at * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '操作內容',
      dataIndex: 'schedule',
    },
    {
      title: '備註',
      dataIndex: 'remark',
    },
  ];

  // 拒绝
  rejectAction(type) {
    this.optionType = type;
    this.setState({
      isReject: true,
      isShowModal: true,
    });
  }
  // 通过
  async passAction(type) {
    const { detailInfo } = this.props.financeRelease;
    if (detailInfo.account_type === 1) {
      const { data: accountData } = await fetchAccoutDetail(
        detailInfo.offer_account
      );
      if (accountData.status) {
        if (accountData.data.balance_amount >= detailInfo.account_data.points) {
          this.optionType = type;
          this.setState({
            isReject: false,
            isShowModal: true,
          });
        } else {
          message.error('子帳戶請求數額不可大於主帳戶積分結餘');
        }
      }
    } else {
      this.optionType = type;
      this.setState({
        isReject: false,
        isShowModal: true,
      });
    }
  }
  modalCancelAction() {
    this.setState({
      isShowModal: false,
    });
  }

  modalOkAction() {
    const { remark } = this.state;
    if (!remark.trim()) {
      message.error('請填寫備註信息');
      return;
    }
    this.passOrRejectApprove();
  }

  remarkChangeAction = (e) => {
    const { value } = e.target;
    this.setState({
      remark: value,
    });
  };

  toPage = (id) => {
    this.props.history.push(`/activity-config/detail/${id}?action=look`);
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.replace({ ...location, search: `?${querystring}` });
  }

  async passOrRejectApprove() {
    const { isReject, remark } = this.state;
    const { detailInfo } = this.props.financeRelease;
    const id = detailInfo.id;
    if (!id) {
      return;
    }
    this.setState({
      isLoading: true,
    });
    let resultData;
    if (this.optionType === 1) {
      resultData = await approvePassOrRejectRequst({
        id,
        remark: remark.trim(),
        action: isReject ? 'refuse' : 'pass',
        offer_account: detailInfo.offer_account,
        type: this.optionType,
      });
    } else {
      resultData = await approveFinancePassOrRejectRequst({
        id,
        remark: remark.trim(),
        action: isReject ? 'refuse' : 'pass',
        offer_account: detailInfo.offer_account,
        type: this.optionType,
      });
    }
    const { data } = resultData;
    if (data.status) {
      message.success('操作成功！');
      this.setState({
        isShowModal: false,
        isLoading: false,
      });
      this.reloadPage();
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  render() {
    const { isShowModal, isReject, isLoading } = this.state;
    const { logList, detailInfo } = this.props.financeRelease;
    const { reportChannelJson } = this.props.system;
    const exceptionStatus =
      detailInfo.status === 1 && detailInfo.offer_policy_entry_id === 0;
    return (
      <div className="p-finance-common-wrap p-budget-detail-wrap">
        <div>
          <Card title="審批詳情" bordered={false}>
            {!Object.keys(detailInfo).length ? (
              <LoadingCom />
            ) : (
              <div className="detail-content-wrap">
                <div className="detail-info-wrap">
                  <h2 className="detail-no">
                    發放項 ID：
                    {detailInfo.id}
                  </h2>
                  <div>
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">發放類型：</p>
                        <div className="item-value">
                          {entryType2Json[detailInfo.entry_type]}
                        </div>
                      </div>
                      <div className="info-item">
                        <p className="item-title">發放項名稱：</p>
                        <div className="item-value">
                          {detailInfo.entry_name || '--'}
                        </div>
                      </div>
                    </div>
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">發放項描述：</p>
                        <div className="item-value">
                          {detailInfo.entry_desc || '--'}
                        </div>
                        {detailInfo.extend_type === 1 ? (
                          <div
                            className="item-value"
                            style={{ color: '#1890ff', cursor: 'pointer' }}
                            onClick={() => this.toPage(detailInfo.extend_id)}
                          >
                            打開彩蛋頁
                          </div>
                        ) : null}
                      </div>
                      <div className="info-item">
                        <p className="item-title">發起部門：</p>
                        <div className="item-value">
                          {detailInfo.department_name}
                        </div>
                      </div>
                    </div>
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">積分帳戶：</p>
                        <div className="item-value">
                          {detailInfo.account_name}(
                          {detailInfo.offer_account_union_id || '--'})
                        </div>
                      </div>
                      <div className="info-item">
                        <p className="item-title">變動類型：</p>
                        <div className="item-value">
                          {+detailInfo.change_type === 1 ? '增加' : '減少'}
                        </div>
                      </div>
                    </div>
                    {detailInfo.account_type === 1 ? (
                      <React.Fragment>
                        <div className="info-item-wrap">
                          <div className="info-item">
                            <p className="item-title">積分子帳戶：</p>
                            <div className="item-value">
                              {detailInfo.account_data
                                ? detailInfo.account_data.account_name
                                : null}
                              ({detailInfo.child_account_union_id || '--'})
                            </div>
                          </div>
                          <div className="info-item">
                            <p className="item-title">連繫主帳戶：</p>
                            <div className="item-value">
                              {detailInfo.account_name}(
                              {detailInfo.offer_account_union_id || '--'})
                            </div>
                          </div>
                        </div>
                        <div className="info-item-wrap">
                          <div className="info-item">
                            <p className="item-title">所需積分額：</p>
                            <div className="item-value">
                              {detailInfo.account_data
                                ? detailInfo.account_data.points
                                : null}
                            </div>
                          </div>
                          <div className="info-item">
                            <p className="item-title">低積分結餘值：</p>
                            <div className="item-value">
                              {detailInfo.account_data
                                ? detailInfo.account_data.warning_value
                                : null}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    ) : null}
                    {
                      /**
                       * entry_type ===1 为自定义发放项 offer_rules 为数组，可有很多的规则，
                       * ===2为固定发放项 只有一项数据 所以这里只在固定发放项才展示
                       */
                      detailInfo.entry_type === 2 ? (
                        <div className="info-item-wrap">
                          <div className="info-item">
                            <p className="item-title">
                              {detailInfo.entry_fixed_type !== 1
                                ? '積分變動策略：'
                                : '發放策略：'}
                            </p>
                            {detailInfo.entry_fixed_type !== 1 ? (
                              <div className="item-value">
                                每支付
                                <b>
                                  {thousandFormat(detailInfo.offer_rules.pay)}
                                </b>
                                港幣，可獲得
                                <b>
                                  {thousandFormat(
                                    detailInfo.offer_rules.points
                                  )}
                                  積分
                                </b>
                              </div>
                            ) : (
                              <div className="item-value">
                                每次掃描，掃描人積分賬戶餘額增加
                                <b>
                                  {thousandFormat(
                                    detailInfo.offer_rules.points
                                  )}
                                  積分
                                </b>
                              </div>
                            )}
                          </div>
                          {detailInfo.entry_fixed_type === 1 ? (
                            <div className="info-item">
                              <p className="item-title">本規則封頂：</p>
                              <div className="item-value">
                                {detailInfo.offer_rules.top.dimenssion ===
                                  'no_top' ||
                                detailInfo.offer_rules.top.dimenssion ===
                                  'none' ? (
                                  '不封頂'
                                ) : (
                                  <span>
                                    每人限制
                                    <b>
                                      {
                                        dimenssion2Json[
                                          detailInfo.offer_rules.top.dimenssion
                                        ]
                                      }
                                    </b>
                                    掃描前
                                    <b> {detailInfo.offer_rules.top.most}</b>
                                    次有效
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="info-item">
                              <p className="item-title">本規則封頂：</p>
                              <div className="item-value">
                                {detailInfo.offer_rules.top.dimenssion ===
                                  'no_top' ||
                                detailInfo.offer_rules.top.dimenssion ===
                                  'none' ? (
                                  '不封頂'
                                ) : (
                                  <span>
                                    <b>
                                      {
                                        dimenssion2Json[
                                          detailInfo.offer_rules.top.dimenssion
                                        ]
                                      }
                                    </b>
                                    最多可獲得
                                    <b> {detailInfo.offer_rules.top.most}</b>
                                    次積分發放
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null
                    }
                    {
                      /**
                       * entry_type ===1 为自定义发放项 offer_rules 为数组，可有很多的规则，
                       * ===2为固定发放项 只有一项数据 所以这里只在固定发放项才展示
                       */
                      detailInfo.entry_type === 1 ? (
                        <div>
                          <div className="info-item-wrap">
                            <div className="info-item">
                              <p className="item-title">發放項事件：</p>
                              <div className="item-value">
                                <ReleaseEventCom
                                  offerRuleList={detailInfo.offer_rules}
                                  reportChannelJson={reportChannelJson}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="info-item-wrap">
                            <div className="info-item">
                              <p className="item-title">發放規則：</p>
                              <div className="item-value">
                                <ReleaseRuleCom
                                  offerRuleList={detailInfo.offer_rules}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null
                    }
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">積分顯示名稱描述：</p>
                        <div className="item-value">
                          {detailInfo.title || '--'}
                        </div>
                      </div>
                      <div className="info-item">
                        <p className="item-title">發出積分有效期：</p>
                        <div className="item-value">
                          {convertValidDateToText(
                            detailInfo.offer_points_valid_date
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">發放項生效時間：</p>
                        <div className="item-value">
                          {detailInfo.start_time}
                          <span
                            style={{ display: 'inline-block', margin: '0 5px' }}
                          >
                            至
                          </span>
                          {detailInfo.end_time}
                        </div>
                      </div>
                      <div className="info-item">
                        <p className="item-title">停發規則：</p>
                        <div className="item-value">
                          帳戶餘額不足
                          <b>{thousandFormat(detailInfo.stop_rule_points)}</b>
                          積分時，停止發放
                        </div>
                      </div>
                    </div>
                    {detailInfo.approval_annex === 'activity' ? null : (
                      <div className="info-item-wrap">
                        <div className="info-item">
                          <p className="item-title">附件：</p>
                          <div className="item-value">
                            <GetImgByAuthCom
                              fileUrl={detailInfo.file_url}
                              fileName={detailInfo.file_name}
                            />
                          </div>
                        </div>
                        {detailInfo.entry_type === 2 &&
                        detailInfo.entry_fixed_type !== 1 ? (
                          <div className="info-item">
                            <p className="item-title">發放渠道：</p>
                            <div className="item-value">
                              {reportChannelJson[detailInfo.channel_id]}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
                <div className="detail-status-wrap">
                  <div className="status-info-wrap">
                    <div className="info-item-wrap">
                      <p className="item-title">狀態</p>
                      <p
                        className={[
                          'item-value',
                          'u-status',
                          exceptionStatus
                            ? 'status-reject'
                            : status2Json[detailInfo.status] &&
                              status2Json[detailInfo.status].className,
                        ].join(' ')}
                      >
                        {exceptionStatus
                          ? '發放異常，可重新審批'
                          : status2Json[detailInfo.status] &&
                            status2Json[detailInfo.status].name}
                      </p>
                    </div>
                    <div className="info-item-wrap none">
                      <p className="item-title">積分變動數量</p>
                      <p className="item-value">
                        {thousandFormat(detailInfo.amount) || '--'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
        <div style={{ marginTop: '24px' }}>
          <Card title="審批流" bordered={false}>
            <AuthWrapCom
              authList={['budget_management', 'offer_approval', 'do_approval']}
            >
              <div className="approve-flow">
                <div className="approve-flow-item">業務審批</div>
                <div
                  className="approve-flow-item status-item"
                  style={{ width: 140 }}
                >
                  <p className="item-title">狀態</p>
                  <p
                    className={[
                      'item-value',
                      'u-status',
                      Object.keys(detailInfo).length > 0 &&
                        btnStatus2Json[
                          detailInfo.check_info.department_status
                        ] &&
                        btnStatus2Json[detailInfo.check_info.department_status]
                          .className,
                    ].join(' ')}
                  >
                    {Object.keys(detailInfo).length > 0 &&
                      btnStatus2Json[detailInfo.check_info.department_status] &&
                      btnStatus2Json[detailInfo.check_info.department_status]
                        .name}
                  </p>
                </div>
                <div className="approve-flow-item">
                  <Button
                    type="primary"
                    className="btn"
                    disabled={
                      Object.keys(detailInfo).length > 0 &&
                      (detailInfo.check_info.department_status !== 2 ||
                        detailInfo.check_info.treasurer_status === 3)
                    }
                    onClick={() => this.passAction(1)}
                  >
                    審批通過
                  </Button>
                  <Button
                    className="btn"
                    disabled={
                      Object.keys(detailInfo).length > 0 &&
                      (detailInfo.check_info.department_status !== 2 ||
                        detailInfo.check_info.treasurer_status === 3)
                    }
                    onClick={() => this.rejectAction(1)}
                  >
                    審批拒絕
                  </Button>
                </div>
              </div>
            </AuthWrapCom>
            <AuthWrapCom
              authList={['budget_management', 'offer_approval', 'treasure']}
            >
              <div className="approve-flow">
                <div className="approve-flow-item">財務審批</div>
                <div
                  className="approve-flow-item status-item"
                  style={{ width: 140 }}
                >
                  <p className="item-title">狀態</p>
                  <p
                    className={[
                      'item-value',
                      'u-status',
                      Object.keys(detailInfo).length > 0 &&
                        btnStatus2Json[
                          detailInfo.check_info.treasurer_status
                        ] &&
                        btnStatus2Json[detailInfo.check_info.treasurer_status]
                          .className,
                    ].join(' ')}
                  >
                    {Object.keys(detailInfo).length > 0 &&
                      btnStatus2Json[detailInfo.check_info.treasurer_status] &&
                      btnStatus2Json[detailInfo.check_info.treasurer_status]
                        .name}
                  </p>
                </div>
                <div className="approve-flow-item">
                  <Button
                    type="primary"
                    className="btn"
                    disabled={
                      Object.keys(detailInfo).length > 0 &&
                      (detailInfo.check_info.treasurer_status !== 2 ||
                        detailInfo.check_info.department_status === 3)
                    }
                    onClick={() => this.passAction(2)}
                  >
                    審批通過
                  </Button>
                  <Button
                    className="btn"
                    disabled={
                      Object.keys(detailInfo).length > 0 &&
                      (detailInfo.check_info.treasurer_status !== 2 ||
                        detailInfo.check_info.department_status === 3)
                    }
                    onClick={() => this.rejectAction(2)}
                  >
                    審批拒絕
                  </Button>
                </div>
              </div>
            </AuthWrapCom>
          </Card>
        </div>
        <div style={{ marginTop: '24px' }}>
          <Card title="審批歷史" bordered={false}>
            <Table
              rowKey="id"
              columns={this.columns}
              dataSource={logList}
              pagination={false}
            />
          </Card>
        </div>
        <Modal
          visible={isShowModal}
          title={isReject ? '拒絕審批' : '審批通過'}
          onOk={() => this.modalOkAction()}
          onCancel={() => this.modalCancelAction()}
          destroyOnClose
          okButtonProps={{
            loading: isLoading,
            disabled: isLoading,
          }}
          cancelButtonProps={{
            disabled: isLoading,
          }}
          width="650px"
        >
          <div className="approve-modal-wrap">
            <div className="approve-item">
              <p className="item-name">操作內容</p>
              <p
                className={[
                  'item-value',
                  'u-status',
                  isReject ? 'status-reject' : 'status-give',
                ].join(' ')}
              >
                {isReject ? '審核拒絕' : '審批通過'}
              </p>
            </div>
            <div className="approve-item">
              <p className="item-name star-mark">備註信息</p>
              <div className="item-value">
                <TextArea
                  placeholder="備註信息(100字以內)"
                  rows={5}
                  maxLength={100}
                  style={{ width: '420px', resize: 'none' }}
                  onChange={this.remarkChangeAction}
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
export default withRouter(
  connect(({ financeRelease, system }) => ({
    financeRelease: financeRelease.toJS(),
    system: system.toJS(),
  }))(DetailPage)
);
