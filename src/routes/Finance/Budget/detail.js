import React from 'react';
import { Card, Button, message, Modal, Input } from 'antd';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import Table from 'components/Table';
import LoadingCom from 'components/LoadingCom';
import GetImgByAuthCom from 'components/GetImgByAuthCom';
import AuthWrapCom from 'components/AuthCom';
import {
  approvePassOrRejectRequst,
  approveFinancePassOrRejectRequst,
} from 'services/finance/budget/budget';
import { findPartmentById, isUserHasRights, thousandFormat } from 'utils/tools';
import moment from 'moment';
import '../finance.less';

const { TextArea } = Input;
const status2Json = {
  0: {
    name: '未完成',
    className: 'status-undone',
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
    name: '審批拒絕',
    className: 'status-reject',
  },
  4: {
    name: '審批通過',
    className: 'status-give',
  },
  5: {
    name: '審批拒絕',
    className: 'status-reject',
  },
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
  passAction(type) {
    this.optionType = type;
    this.setState({
      isReject: false,
      isShowModal: true,
    });
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

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.replace({ ...location, search: `?${querystring}` });
  }

  async passOrRejectApprove() {
    const { isReject, remark } = this.state;
    const { detailInfo } = this.props.financeBudget;
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
        result: isReject ? 0 : 1,
        type: this.optionType,
      });
    } else {
      resultData = await approveFinancePassOrRejectRequst({
        id,
        remark: remark.trim(),
        result: isReject ? 0 : 1,
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
    const { isShowModal, isReject, isLoading, isHasRight } = this.state;
    const { logList, detailInfo } = this.props.financeBudget;
    const { partmentList } = this.props.system;
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
                    編號：
                    {detailInfo.id}
                  </h2>
                  <div>
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">發起時間：</p>
                        <div className="item-value">
                          {detailInfo.created_at}
                        </div>
                      </div>
                      <div className="info-item">
                        <p className="item-title">預算幣種：</p>
                        <div className="item-value">HKD</div>
                      </div>
                    </div>
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">預算積分賬戶ID：</p>
                        <div className="item-value">
                          {detailInfo.account_id}
                        </div>
                      </div>
                      <div className="info-item">
                        <p className="item-title">發起部門：</p>
                        <div className="item-value">
                          {findPartmentById(
                            partmentList,
                            detailInfo.department
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="info-item-wrap">
                      <div className="info-item">
                        <p className="item-title">發起人：</p>
                        <div className="item-value">{detailInfo.username}</div>
                      </div>
                      <div className="info-item">
                        <p className="item-title">發起原因：</p>
                        <div className="item-value">
                          {detailInfo.description}
                        </div>
                      </div>
                    </div>
                    <div className="info-item-wrap">
                      {detailInfo.attr_files ? (
                        <div className="info-item">
                          <p className="item-title">附件：</p>
                          <div className="item-value">
                            <GetImgByAuthCom
                              fileUrl={detailInfo.file_url}
                              fileName={detailInfo.file_name}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="detail-status-wrap">
                  {/* {+detailInfo.status === 2 ? (
                    isHasRight ? (
                      <div>
                        <Button
                          className="btn"
                          onClick={() => this.rejectAction()}
                        >
                          審批拒絕
                        </Button>
                        <Button
                          type="primary"
                          className="btn"
                          onClick={() => this.passAction()}
                        >
                          審批通過
                        </Button>
                      </div>
                    ) : null
                  ) : null} */}
                  <div className="status-info-wrap">
                    <div className="info-item-wrap">
                      <p className="item-title">狀態</p>
                      <p
                        className={[
                          'item-value',
                          'u-status',
                          status2Json[detailInfo.status].className,
                        ].join(' ')}
                      >
                        {status2Json[detailInfo.status].name}
                      </p>
                    </div>
                    <div className="info-item-wrap">
                      <p className="item-title">預算積分</p>
                      <p className="item-value">
                        {thousandFormat(detailInfo.amount)}
                      </p>
                    </div>
                    <div className="info-item-wrap">
                      <p className="item-title">預算金額</p>
                      <p className="item-value">
                        {thousandFormat((detailInfo.amount / 100).toFixed(2))}
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
              authList={['budget_management', 'budget_approval', 'app_check']}
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
                        status2Json[detailInfo.check_info.department_status]
                          .className,
                    ].join(' ')}
                  >
                    {Object.keys(detailInfo).length > 0 &&
                      status2Json[detailInfo.check_info.department_status].name}
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
              authList={[
                'budget_management',
                'budget_approval',
                'app_check_finance',
              ]}
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
                        status2Json[detailInfo.check_info.treasurer_status]
                          .className,
                    ].join(' ')}
                  >
                    {Object.keys(detailInfo).length > 0 &&
                      status2Json[detailInfo.check_info.treasurer_status].name}
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
  connect(({ financeBudget, system }) => ({
    financeBudget: financeBudget.toJS(),
    system: system.toJS(),
  }))(DetailPage)
);
