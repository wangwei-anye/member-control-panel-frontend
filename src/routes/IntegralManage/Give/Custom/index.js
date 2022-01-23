import React from 'react';
import TabRouter from 'components/TabRouter';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { INTEGRAL_GIVE_TABLIST } from 'config/ob.config.js';
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
  Spin,
} from 'antd';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import qs from 'qs';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import { updateCustomStatusRequest } from 'services/integralManage/give/give';
import LoadingCom from 'components/LoadingCom';
import { formatFormData, convertValidDateToText } from 'utils/tools';
import eventEmmiter from 'utils/events';
import '../give.less';

const confirm = Modal.confirm;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const status2Json = {
  '-2': {
    name: '已失效',
    className: 'status-lose',
  },
  '-1': {
    name: '已失效',
    className: 'status-lose',
  },
  0: {
    name: '未完成',
    className: 'status-undone',
  },
  1: {
    name: '發放中',
    className: 'status-give',
  },
  2: {
    name: '審批中',
    className: 'status-approve',
  },
  3: {
    name: '即將開始',
    className: 'status-soon',
  },
  4: {
    name: '已駁回',
    className: 'status-reject',
  },
  5: {
    name: '已停發',
    className: 'status-stop',
  },
  6: {
    name: '預處理中',
    className: 'status-soon',
  },
  20: {
    name: '審批中',
    className: 'status-approve',
  },
  22: {
    name: '審批中',
    className: 'status-approve',
  },
  21: {
    name: '已駁回',
    className: 'status-reject',
  },
};
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const detailRightList = [
  'points_management',
  'points_offer',
  'custom',
  'offer_detail',
];
const updateStatueRightList = [
  'points_management',
  'points_offer',
  'custom',
  'update_status',
];
class CustomListPage extends React.Component {
  state = {
    dateString: [],
  };

  columns = [
    {
      title: '發放項 ID',
      dataIndex: 'id',
    },
    {
      title: '發放項名稱',
      dataIndex: 'entry_name',
    },
    {
      title: '變動類型',
      render: (text, record) => {
        const type = +record.change_type;
        return type ? (type === 1 ? '增加' : '減少') : '增加';
      },
    },
    {
      title: '積分發放賬戶',
      dataIndex: 'account_name',
    },
    {
      title: '發出積分有效期',
      render: (text, record) => {
        const { offer_points_valid_date } = record;
        return convertValidDateToText(offer_points_valid_date);
      },
    },
    {
      title: '更新時間',
      dataIndex: 'edit_time',
    },
    {
      title: '編輯人',
      dataIndex: 'edit_by',
    },
    {
      title: '狀態',
      render: (text, record) => {
        if (
          record.offer_policy_entry_id === 0 &&
          (record.status === 1 || record.status === 3)
        ) {
          return <span className="u-status status-stop">發放異常</span>;
        }
        return (
          <span
            className={[
              'u-status',
              status2Json[record.status]
                ? status2Json[record.status].className
                : 'status-lose',
            ].join(' ')}
          >
            {status2Json[record.status]
              ? status2Json[record.status].name
              : '已失效'}
          </span>
        );
      },
    },
    {
      title: '操作',
      width: 200,
      render: (text, record, index) => {
        return this.renderOperation(record, index);
      },
    },
  ];

  componentDidMount() {
    const { query } = this.props.system;
    if (query.app_id) {
      sessionStorage.setItem('MCP_01_OUT_APP_ID', query.app_id);
    }
    if (query.out_sn) {
      sessionStorage.setItem('MCP_01_OUT_OUT_SN', query.out_sn);
    }
    if (query.req_at) {
      sessionStorage.setItem('MCP_01_OUT_REQ_AT', query.req_at);
    }
    if (query.signature) {
      sessionStorage.setItem('MCP_01_OUT_SIGNATURE', query.signature);
    }
    this.handleKeyupEvent();
  }

  componentWillUnmount() {
    eventEmmiter.removeAllListeners('keyup');
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { time, out_time } = values;
      if (this.checkSearchItemValueValidate(values) || time || out_time) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { id, entry_name, offer_account_name } = values;
    let isValid = false;
    if (id !== null && id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的預算編號ID');
        return false;
      }
    }

    const _entry_name = entry_name.trim();
    if (_entry_name) {
      isValid = true;
    }

    const _offer_account_name = offer_account_name.trim();
    if (_offer_account_name) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  renderOperation(record, index) {
    const status = +record.status;
    const offer_policy_entry_id = record.offer_policy_entry_id;
    // 发放中 or 即将开始
    if (status === 1 || status === 3) {
      return (
        <span className="m-operation-wrap">
          <AuthBtnCom authList={record.permission} currrentAuth="offer_detail">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthBtnCom>
          {offer_policy_entry_id ? (
            <AuthBtnCom
              authList={record.permission}
              currrentAuth="update_status"
            >
              <span
                className="u-operation-item u-color-red"
                onClick={() => this.stopOrRestartAction(record, index)}
              >
                停發
              </span>
            </AuthBtnCom>
          ) : null}
        </span>
      );
    }
    // 审批中
    if (status === 2) {
      return (
        <span className="m-operation-wrap">
          <AuthBtnCom authList={record.permission} currrentAuth="offer_detail">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="update_status">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.cancelApproveAction(record, index)}
            >
              取消申請
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    // 已驳回
    if (status === 4) {
      return (
        <span className="m-operation-wrap">
          <AuthBtnCom authList={record.permission} currrentAuth="offer_detail">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    // 已停发
    if (status === 5) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          <AuthBtnCom authList={record.permission} currrentAuth="update_status">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.stopOrRestartAction(record, index)}
            >
              恢復發放
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    // 已失效
    if (status === -1) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
        </span>
      );
    }
    // 已失效
    if (status === 0) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          <AuthBtnCom authList={record.permission} currrentAuth="update_entry">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetailAction(record, 'edit')}
            >
              更改配置
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="update_status">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.deleteItemAction(record)}
            >
              刪除
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    // 預處理中
    if (status === 6) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          <AuthBtnCom
            authList={record.permission}
            currrentAuth="inside_test_pass"
          >
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.testPassAction(record)}
            >
              預處理通過
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    return (
      <span className="m-operation-wrap">
        {this.lookDetailReactDom(record)}
      </span>
    );
  }

  // 查看详情 react dom
  lookDetailReactDom(record) {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="offer_detail">
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.toDetailAction(record, 'look')}
        >
          查看
        </span>
      </AuthBtnCom>
    );
  }

  toDetailAction(record, type) {
    if (!record.id) {
      return;
    }
    this.props.history.push(
      `/integral-manage/give-custom/config/base?id=${record.id}&type=${type}`
    );
  }

  deleteItemAction(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要刪除該項嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await updateCustomStatusRequest({
            id: record.id,
            action: 'delete',
          });
          resolve();
          if (data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  testPassAction(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定預處理通過嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await updateCustomStatusRequest({
            id: record.id,
            action: 'pass_test',
          });
          resolve();
          if (data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  cancelApproveAction(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要取消該項申請嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await updateCustomStatusRequest({
            id: record.id,
            action: 'cancel',
          });
          resolve();
          if (data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  stopOrRestartAction(record, index) {
    if (!record.id) {
      return;
    }
    const status = +record.status;
    const self = this;
    confirm({
      title: '提示',
      content: `確定要${status === 5 ? '恢復發放' : '停發'}嗎？`,
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await updateCustomStatusRequest({
            id: record.id,
            action: status === 5 ? 'recover_offer' : 'stop',
            offer_policy_entry_id: record.offer_policy_entry_id,
          });
          resolve();
          if (data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  // 搜索
  searchAction = () => {
    const { history, location, system } = this.props;
    const { dateString } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.start_time = moment(values.time[0]).format('YYYY-MM-DD');
        query.end_time = moment(values.time[1]).format('YYYY-MM-DD');
      }
      query.page = 1;
      delete query.time;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  render() {
    const { customListInfo } = this.props.integralManageGive;
    const { list, total, loading } = customListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-fixed-list-wrap p-give-wrap">
        <TabRouter tabList={INTEGRAL_GIVE_TABLIST} defaultKey="custom" />
        <div className="give-content-wrap">
          <FoldableCard
            className="custom-card"
            bodyStyle={{ borderTop: '1px solid #e8e8e8' }}
          >
            <Form>
              <Row gutter={48}>
                <Col span={11}>
                  <FormItem label="發放項 ID" {...formItemLayout}>
                    {getFieldDecorator('id', {
                      initialValue: query.id || '',
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
                  <FormItem label="發放項名稱" {...formItemLayout}>
                    {getFieldDecorator('entry_name', {
                      initialValue: query.entry_name || '',
                    })(<Input placeholder="請輸入發放項名稱關鍵字" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="積分發放賬戶" {...formItemLayout}>
                    {getFieldDecorator('offer_account_name', {
                      initialValue: query.offer_account_name || '',
                    })(<Input placeholder="請輸入積分發放賬戶關鍵字" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="生效時間" {...formItemLayout}>
                    {getFieldDecorator('time', {
                      initialValue: query.start_time
                        ? [moment(query.start_time), moment(query.end_time)]
                        : '',
                    })(<RangePicker style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                {/* <Col span={11}>
                  <FormItem label="積分有效期">
                    {getFieldDecorator('out_time', {
                      initialValue: query.out_time || []
                    })(
                      <RangePicker placeholder={['開始時間', '結束時間']} style={{ width: '100%' }} />
                    )}
                  </FormItem>
                </Col> */}
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
                    onClick={this.searchAction}
                    style={{ marginRight: 20 }}
                  >
                    搜索
                  </Button>
                  <ResetBtn form={this.props.form} />
                </Col>
              </Row>
            </Form>
          </FoldableCard>
          <Card
            bordered={false}
            bodyStyle={{ padding: '10px 20px' }}
            style={{ marginTop: '24px' }}
            title="全部自定義發放項"
            extra={
              <AuthWrapCom
                authList={[
                  'points_management',
                  'points_offer',
                  'custom',
                  'add_entry',
                ]}
              >
                <Button
                  icon="plus"
                  type="primary"
                  onClick={() => {
                    this.props.history.push(
                      '/integral-manage/give-custom/config/base'
                    );
                  }}
                >
                  創建新發放項
                </Button>
              </AuthWrapCom>
            }
          >
            {loading ? (
              <LoadingCom />
            ) : (
              <Table
                rowKey={(row, index) => index}
                columns={this.columns}
                dataSource={list}
                pagination={{ total }}
              />
            )}
          </Card>
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralManageGive, system }) => ({
    integralManageGive: integralManageGive.toJS(),
    system: system.toJS(),
  }))(Form.create()(CustomListPage))
);
