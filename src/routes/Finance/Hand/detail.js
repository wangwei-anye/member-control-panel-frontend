import React from 'react';
import { Card, Button, message, Modal, Input, Alert } from 'antd';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import Table from 'components/Table';
import LoadingCom from 'components/LoadingCom';
import AuthWrapCom from 'components/AuthCom';
import {
  approvePassOrRejectRequst,
  approveFinancePassOrRejectRequst,
  checkResult,
} from 'services/finance/hand/hand';
import {
  findPartmentById,
  isUserHasRights,
  thousandFormat,
  convertValidDateToText,
} from 'utils/tools';
import moment from 'moment';
import ResultPreviewModal from './components/ResultPreviewModal';
import FailPreviewModal from './components/FailPreviewModal';
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
    previewModal: false,
    previewFailModal: false,
    remark: '', // 拒绝或者通过的备注信息
  };
  IntervalId = null;
  optionType = 1;
  flag = true;
  firstFlag = true;
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

  async componentWillReceiveProps(nextProps) {
    if (!nextProps.financeHand.isCheckSuccess && this.flag) {
      this.flag = false;
      setTimeout(() => {
        this.flag = true;
      }, 1000);
      this.checkResultTimeOut(nextProps.financeHand.detailInfo);
    }
  }
  checkResultTimeOut = (detailInfo) => {
    const that = this;
    if (this.firstFlag) {
      this.firstFlag = false;
      that.props.dispatch({
        type: 'financeHand/getDetailAsync',
        payload: {
          id: detailInfo.id,
        },
      });
    }
    this.IntervalId = setTimeout(() => {
      that.props.dispatch({
        type: 'financeHand/getDetailAsync',
        payload: {
          id: detailInfo.id,
        },
      });
    }, 5000);
  };

  componentWillUnmount() {
    if (this.IntervalId) {
      clearTimeout(this.IntervalId);
    }
    this.props.dispatch({
      type: 'financeHand/save',
      payload: {
        detailInfo: {},
        isCheckSuccess: true,
      },
    });
  }

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
    const { detailInfo } = this.props.financeHand;
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
  showPreviewHandle = () => {
    this.setState({
      previewModal: true,
    });
  };

  handleClosePreview = () => {
    this.setState({
      previewModal: false,
    });
  };

  showPreviewFailHandle = () => {
    this.setState({
      previewFailModal: true,
    });
  };

  handleCloseFailPreview = () => {
    this.setState({
      previewFailModal: false,
    });
  };

  handleDownload = async (id) => {
    const result = await this.props.dispatch({
      type: 'financeHand/download',
      payload: {
        id,
      },
    });
  };

  render() {
    const { isShowModal, isReject, isLoading, isHasRight } = this.state;
    const { logList, detailInfo, isCheckSuccess } = this.props.financeHand;
    const { partmentList } = this.props.system;
    return (
      <div className="p-finance-common-wrap p-budget-detail-wrap">
        <div>
          <div>
            <Card title="審批詳情" bordered={false}>
              {!Object.keys(detailInfo).length ? (
                <LoadingCom />
              ) : (
                <div className="detail-content-wrap">
                  <div className="detail-info-wrap">
                    <h2 className="detail-no">
                      編號：
                      {detailInfo.id}{' '}
                      {!isCheckSuccess && detailInfo.progress ? (
                        <Alert
                          style={{
                            marginLeft: '50%',
                            position: 'relative',
                            left: -125,
                            width: 250,
                            display: 'inline-block',
                            textAlign: 'center',
                            color: '#1890ff',
                          }}
                          message={`發分中 (${detailInfo.progress.done_total}/${detailInfo.progress.total})`}
                          type="info"
                        />
                      ) : null}
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
                          <p className="item-title">積分接受賬戶：</p>
                          {detailInfo.type === 2 ? (
                            <React.Fragment>
                              <div className="item-value">
                                批量導入{' '}
                                {detailInfo.receiver_info &&
                                  detailInfo.receiver_info.length}
                                人，共計發放{detailInfo.amount}積分
                              </div>
                              <div
                                className={['item-value', 'preview'].join(' ')}
                                onClick={this.showPreviewHandle}
                              >
                                查看預覽
                              </div>
                            </React.Fragment>
                          ) : (
                            <div className="item-value">
                              {detailInfo.receiver_info &&
                                detailInfo.receiver_info.map((item) => {
                                  return (
                                    <p
                                      style={{ marginBottom: '5px' }}
                                      key={item.account_id}
                                    >
                                      <b>{item.nick_name}</b>
                                      (id：
                                      {item.account_id})
                                    </p>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="info-item-wrap">
                        <div className="info-item">
                          <p className="item-title">預算積分賬戶：</p>
                          <div className="item-value">
                            {`${detailInfo.account_name}(id：${detailInfo.union_id})`}
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
                          <div className="item-value">
                            {detailInfo.username}
                          </div>
                        </div>
                        <div className="info-item">
                          <p className="item-title">發起原因：</p>
                          <div className="item-value">{detailInfo.remark}</div>
                        </div>
                      </div>
                      {detailInfo.send_result &&
                      Object.keys(detailInfo.send_result).length ? (
                        <div>
                          <div className="info-item-wrap none">
                            <div
                              className="info-item"
                              style={{ width: '800px' }}
                            >
                              <p className="item-title">發放成功賬戶：</p>
                              <div className="item-value">
                                {detailInfo.send_result.success.length
                                  ? detailInfo.send_result.success.map(
                                      (item, index) => {
                                        return (
                                          <div
                                            key={index}
                                            style={{ marginRight: '10px' }}
                                          >
                                            <b>{item.nick_name}</b>
                                            (id：
                                            {item.account_id})
                                          </div>
                                        );
                                      }
                                    )
                                  : '無'}
                              </div>
                            </div>
                          </div>
                          <div className="info-item-wrap">
                            <div className="info-item">
                              <p className="item-title">發放失敗賬戶：</p>
                              <React.Fragment>
                                <div className="item-value">
                                  {detailInfo.send_result.fail.length}人
                                </div>
                                <div
                                  className={['item-value', 'preview'].join(
                                    ' '
                                  )}
                                  onClick={this.showPreviewFailHandle}
                                >
                                  查看預覽
                                </div>
                              </React.Fragment>
                            </div>
                            {/* 發出積分有效期 */}
                            <div className="info-item">
                              <p className="item-title">發出積分有效期：</p>
                              <div className="item-value">
                                {convertValidDateToText(
                                  detailInfo.offer_points_valid_date
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <div className="info-item-wrap">
                        <div className="info-item">
                          <p className="item-title">積分顯示名稱描述：</p>
                          <div className="item-value">
                            {detailInfo.title || '--'}
                          </div>
                        </div>
                      </div>
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
                            status2Json[detailInfo.status].className,
                          ].join(' ')}
                        >
                          {status2Json[detailInfo.status].name}
                        </p>
                      </div>
                      <div className="info-item-wrap">
                        <p className="item-title">發放積分數額</p>
                        <p className="item-value">
                          {thousandFormat(detailInfo.amount)}分
                        </p>
                      </div>
                    </div>

                    {detailInfo.send_result &&
                    Object.keys(detailInfo.send_result).length === 0 ? (
                      <div className="info-item">
                        <p className="item-title">發出積分有效期：</p>
                        <div className="item-value">
                          {convertValidDateToText(
                            detailInfo.offer_points_valid_date
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </Card>
          </div>
          <div style={{ marginTop: '24px' }}>
            <Card title="審批流" bordered={false}>
              <AuthWrapCom
                authList={[
                  'budget_management',
                  'manual_approval',
                  'department',
                ]}
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
                        status2Json[detailInfo.check_info.department_status]
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
                authList={['budget_management', 'manual_approval', 'treasure']}
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
                        status2Json[detailInfo.check_info.treasurer_status]
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
        </div>
        <div className="data-sheet">
          {this.state.previewModal ? (
            <ResultPreviewModal
              id={detailInfo.id}
              table_path={detailInfo.table_path}
              onClose={this.handleClosePreview}
              onDownload={this.handleDownload}
              fileName=""
            />
          ) : null}
          {this.state.previewFailModal ? (
            <FailPreviewModal
              list={detailInfo.send_result.fail}
              onClose={this.handleCloseFailPreview}
              fileName=""
            />
          ) : null}
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
  connect(({ financeHand, system }) => ({
    financeHand: financeHand.toJS(),
    system: system.toJS(),
  }))(DetailPage)
);
