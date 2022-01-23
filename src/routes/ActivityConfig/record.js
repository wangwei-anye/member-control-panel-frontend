import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  message,
  Form,
  Input,
  Row,
  Col,
  Button,
  Card,
  DatePicker,
  Modal,
  Select,
  Icon,
  Tooltip,
} from 'antd';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import qs from 'qs';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import AuthWrapCom from 'components/AuthCom';
import { resend, recordListExport } from 'services/promotion';

import {
  formatFormData,
  convertValidDateToText,
  downLoadFile,
} from 'utils/tools';
// import { DEFAULT_PAGE_SIZE, API_BASE } from 'constants';
import LoadingCom from 'components/LoadingCom';
import { HEADER_TOKEN_NAME } from 'constants';
import eventEmmiter from 'utils/events';
import { getToken } from 'utils/session';
import ExportModal from 'components/ExportModal';
import './index.less';

const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;

const { RangePicker } = DatePicker;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

// 状态:1发放中,2审批中,3即将开始,4已驳回,5已停发,0未完成,-1已失效,-2已废弃,999全部
const status2Json = {
  2: {
    name: '失敗',
    className: 'status-lose',
  },
  1: {
    name: '成功',
    className: 'status-give',
  },
  0: {
    name: '待發放',
    className: 'status-approve',
  },
  3: {
    name: '發放中',
    className: 'status-soon',
  },
};

const STATUS_JSON = {
  1: '成功',
  2: '失敗',
  0: '待發放',
  3: '發放中',
  5: '失敗 - 待重發',
};

const tooltipTitle = (text) => {
  // text 展示的thead title 展示的提醒文字
  const renderTitle = () => {
    return (
      <React.Fragment>
        <p style={{ fontSize: '10px' }}>「成功」已成功完成獎品發放的項。</p>
        <p style={{ fontSize: '10px' }}>「失敗」執行獎品發放失敗的項。</p>
        <p style={{ fontSize: '10px' }}>
          「待發放」領取人已領取獎品且未到發放時間，待發放的獎品。
        </p>
        <p style={{ fontSize: '10px' }}>
          「發放中」代表已領獎且到發放時間，系統正在執行發放任務。
        </p>
      </React.Fragment>
    );
  };
  return (
    <React.Fragment>
      <span style={{ marginRight: 8 }}>{text}</span>
      <Tooltip placement="top" title={renderTitle()}>
        <Icon type="exclamation-circle" theme="outlined" />
      </Tooltip>
    </React.Fragment>
  );
};

class RecordListPage extends React.Component {
  state = {
    dateString: [],
    currentPage: 1,
    selectedRowKeys: [],
    modalVisible: false,
  };

  columns = [
    {
      title: '領取編號',
      dataIndex: 'id',
    },
    {
      title: '領取人ID',
      dataIndex: 'union_id',
    },
    {
      title: '領取人手機',
      dataIndex: 'phone',
    },
    {
      title: '領獎時間',
      dataIndex: 'created_at',
    },
    {
      title: '獎品類型',
      dataIndex: 'preferential_name',
    },
    {
      title: '中獎明細',
      dataIndex: 'value',
    },
    {
      title: tooltipTitle('發放狀態'),
      dataIndex: 'grant_name',
      render: (text, record) => {
        if (record.err_message !== '') {
          return (
            <div>
              <span>
                {record.grant_name}-{record.err_message}
              </span>
              <span
                style={{ color: '#1890ff', marginLeft: 10 }}
                onClick={() => {
                  this.resend(record.id);
                }}
              >
                重發
              </span>
            </div>
          );
        }
        return record.grant_name;
      },
    },
    {
      title: '活動名稱',
      width: '120px',
      dataIndex: 'title',
    },
    {
      title: '模板類型',
      dataIndex: 'activity_name',
    },
    {
      title: '活動ID',
      dataIndex: 'promotional_activity_id',
    },
  ];

  async componentDidMount() {
    const { query } = this.props.system;
    const { group_id, app_id, out_sn, req_at, signature } = query;
    if (app_id) {
      sessionStorage.setItem('MCP_01_OUT_APP_ID', app_id);
    }
    if (out_sn) {
      sessionStorage.setItem('MCP_01_OUT_OUT_SN', out_sn);
    }
    if (req_at) {
      sessionStorage.setItem('MCP_01_OUT_REQ_AT', req_at);
    }
    if (signature) {
      sessionStorage.setItem('MCP_01_OUT_SIGNATURE', signature);
    }
    // NOTE: 根据后端需求: qrcode 的 group_id 写死为 2;
    if (group_id) {
      this.groupId = group_id;
    } else {
      this.groupId = 2;
    }
    this.handleKeyupEvent();
  }

  componentWillUnmount() {
    // NOTE: remove Listeners
    eventEmmiter.removeAllListeners();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      if (this.state.modalVisible) {
        return;
      }
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { time, status, activity_type, preferential_type } = values;
      if (
        this.checkSearchItemValueValidate(values) ||
        time ||
        status ||
        activity_type ||
        preferential_type
      ) {
        return this.handleSearchBtn();
      }
    });
  }

  checkId = (id) => {
    let isValid = false;
    if (id !== null && id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字ID');
        return false;
      }
    }
    return isValid;
  };

  checkSearchItemValueValidate = (values) => {
    const { promotional_activity_id, account_id, phone } = values;
    let isValid = false;

    if (this.checkId(promotional_activity_id) || this.checkId(account_id)) {
      return true;
    }

    const _phone = phone.trim();
    if (_phone) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  // 搜索
  handleSearchBtn = () => {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.grant_start_time = moment(values.time[0]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        query.grant_end_time = moment(values.time[1]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
      }

      if (query.status && query.status === '全部') {
        delete query.status;
      }
      query.page = 1;
      delete query.time;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  handleResetBtn = () => {
    const {
      history,
      location,
      system: { query },
    } = this.props;
    const _query = { page: query.page || 1, pageSize: query.pageSize || 10 };
    const querystring = qs.stringify(_query);
    history.push({ ...location, search: `?${querystring}` });
  };

  pageChange = (pagination) => {
    const { history, location, system } = this.props;
    this.setState({
      currentPage: pagination.current,
    });
    let query = system.query;
    query = {
      ...query,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  };

  renderStatusOptions() {
    return Object.keys(STATUS_JSON).map((item) => {
      return (
        <Option key={item} value={item}>
          {STATUS_JSON[item]}
        </Option>
      );
    });
  }

  handleExportExcel = async () => {
    const { recordInfo } = this.props;
    const { total } = recordInfo;
    if (total > 100000) {
      message.error('僅支持導出少於10萬條的數據');
      return;
    }
    const query = this.props.system.query;
    if (query.page) {
      delete query.page;
    }
    if (query.pageSize) {
      delete query.pageSize;
    }
    const postData = query;
    const {
      start_time,
      end_time,
      start_date,
      end_date,
      grant_start_time,
      grant_end_time,
    } = postData;
    if (!(start_time || start_date || grant_start_time)) {
      message.error('請選擇導出的時間：僅支持導出一個月內，並少於10萬條的數據');
      return;
    }

    if (
      (grant_start_time && grant_start_time === grant_end_time) ||
      (start_time && start_time === end_time) ||
      (start_date && start_date === end_date)
    ) {
      message.error('導出的開始時間和結束時間不能相同!');
      return;
    }

    let isInOneMonth = false;
    const newStartDate = new Date(start_time || start_date || grant_start_time);
    const newEndDate = new Date(end_time || end_date || grant_end_time);

    // 同年同月
    if (
      newStartDate.getFullYear() === newEndDate.getFullYear() &&
      newStartDate.getMonth() === newEndDate.getMonth()
    ) {
      isInOneMonth = true;
    }
    // 同年跨月
    if (
      newStartDate.getFullYear() === newEndDate.getFullYear() &&
      newStartDate.getMonth() + 1 === newEndDate.getMonth() &&
      newStartDate.getDate() >= newEndDate.getDate()
    ) {
      isInOneMonth = true;
    }
    // 跨年跨月
    if (
      newStartDate.getFullYear() + 1 === newEndDate.getFullYear() &&
      newStartDate.getMonth() === 11 &&
      newEndDate.getMonth() === 0 &&
      newStartDate.getDate() >= newEndDate.getDate()
    ) {
      isInOneMonth = true;
    }
    if (!isInOneMonth) {
      message.error('僅支持導出一個月內的數據，請優化篩選條件');
      return;
    }

    this.setState({
      modalVisible: true,
    });
  };

  createExportTask = async (param) => {
    const query = this.props.system.query;
    if (query.page) {
      delete query.page;
    }
    if (query.pageSize) {
      delete query.pageSize;
    }
    const postData = query;
    const { data } = await recordListExport({
      task_info: param,
      filter: postData,
    });
    if (data.status) {
      message.success('提交成功，請往任務中心查看狀態');
      this.setState({
        modalVisible: false,
      });
    }
  };

  onSelectChange = async (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  stopGrant = async () => {
    if (this.state.selectedRowKeys.length === 0) {
      message.success('請至少選擇一行');
      return;
    }
    confirm({
      icon: 'info-circle',
      title: '正在批量取消發分',
      content: '被選中的延時發分的會員將不會收到這筆積分',
      onOk: async () => {
        try {
          const { data } = await this.props.dispatch({
            type: 'activityConfig/stopGrant',
            payload: {
              ids: this.state.selectedRowKeys.join(','),
            },
          });
          if (data.status) {
            message.success('操作成功');
            this.setState({ selectedRowKeys: [] });
            this.reloadPage();
          } else {
            message.success('操作失敗');
          }
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  resend = async (id) => {
    const { data } = await resend({
      id,
    });
    if (data.status) {
      this.reloadPage();
    }
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  render() {
    const { recordInfo } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { total, list, loading } = recordInfo;
    const { currentPage, selectedRowKeys } = this.state;
    const {
      query: {
        preferential_type,
        activity_type,
        promotional_activity_id,
        status,
        account_id,
        grant_start_time,
        grant_end_time,
        phone,
      },
    } = this.props.system;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => ({
        disabled: record.grant_name !== '待發放',
      }),
    };

    return (
      <div className="p-fixed-list-wrap p-give-wrap">
        <div className="give-content-wrap">
          <FoldableCard
            className="qr-code-card"
            bodyStyle={{ borderTop: '1px solid #e8e8e8' }}
            title="搜索條件"
          >
            <Form>
              <Row gutter={48}>
                <Col span={11}>
                  <FormItem label="活動ID" {...formItemLayout}>
                    {getFieldDecorator('promotional_activity_id', {
                      initialValue: promotional_activity_id || '',
                      rules: [
                        {
                          pattern: /^\d*$/g,
                          message: '請輸入純數字ID',
                        },
                      ],
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="模板類型" {...formItemLayout}>
                    {getFieldDecorator('activity_type', {
                      initialValue: activity_type || undefined,
                    })(
                      <Select placeholder="請選擇">
                        <Option value="2">答題模板</Option>
                        <Option value="1">精簡模板</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="獎品類型" {...formItemLayout}>
                    {getFieldDecorator('preferential_type', {
                      initialValue: preferential_type || undefined,
                    })(
                      <Select placeholder="請選擇">
                        <Option value="2">積分</Option>
                        <Option value="1">優惠券</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="領取人ID" {...formItemLayout}>
                    {getFieldDecorator('account_id', {
                      initialValue: account_id || '',
                      rules: [
                        {
                          pattern: /^\d*$/g,
                          message: '請輸入純數字ID',
                        },
                      ],
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="領取人手機" {...formItemLayout}>
                    {getFieldDecorator('phone', {
                      initialValue: phone || '',
                    })(<Input placeholder="手機號/座機號" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="領取時間" {...formItemLayout}>
                    {getFieldDecorator('time', {
                      initialValue: grant_start_time
                        ? [moment(grant_start_time), moment(grant_end_time)]
                        : '',
                    })(<RangePicker showTime style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="狀態" {...formItemLayout}>
                    {getFieldDecorator('status', {
                      initialValue: status || undefined,
                    })(
                      <Select
                        placeholder="請選擇"
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentNode
                        }
                        ref={this.selectRef}
                        onChange={this.selectChangeHandle}
                      >
                        <Option key={999} value="全部">
                          全部
                        </Option>
                        {this.renderStatusOptions()}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col
                  span={24}
                  style={{
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Button
                    type="primary"
                    icon="search"
                    onClick={this.handleSearchBtn}
                    style={{ marginRight: 20 }}
                  >
                    搜索
                  </Button>
                  <ResetBtn
                    form={this.props.form}
                    onReset={this.handleResetBtn}
                  />
                </Col>
              </Row>
            </Form>
          </FoldableCard>
          <Card
            bordered={false}
            bodyStyle={{ padding: '10px 20px' }}
            style={{ marginTop: '24px' }}
            title="領取明細"
          >
            {loading ? (
              <LoadingCom />
            ) : (
              <div>
                <div style={{ paddingTop: '10px', paddingBottom: '20px' }}>
                  <AuthWrapCom
                    authList={[
                      'operation_manage',
                      'promotional_activity',
                      'record',
                      'stop_grant',
                    ]}
                  >
                    <Button onClick={this.stopGrant}>批量終止發放</Button>
                  </AuthWrapCom>
                  <div style={{ float: 'right' }}>
                    <span style={{ marginRight: 15 }}>限定十萬條</span>
                    <Button
                      icon="plus"
                      type="primary"
                      onClick={this.handleExportExcel}
                      disabled={loading}
                    >
                      導出Excel
                    </Button>
                  </div>
                </div>
                <Table
                  rowKey="id"
                  columns={this.columns}
                  rowSelection={rowSelection}
                  dataSource={list}
                  pagination={{
                    total,
                    showSizeChanger: true,
                    page: currentPage,
                  }}
                  onChange={this.pageChange}
                />
              </div>
            )}
          </Card>
          {this.state.modalVisible ? (
            <ExportModal
              createExportTask={this.createExportTask.bind(this)}
              handleCancel={() => {
                this.setState({
                  modalVisible: false,
                });
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(({ system, auth, activityConfig }) => ({
    recordInfo: activityConfig.get('recordInfo').toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(Form.create()(RecordListPage))
);
