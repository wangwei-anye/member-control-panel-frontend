import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import {
  message,
  Form,
  Row,
  Col,
  Input,
  Button,
  Card,
  DatePicker,
  Modal,
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import {
  deleteApplication,
  cancelApplication,
} from 'services/integralManage/approve/approve';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import LoadingCom from 'components/LoadingCom';
import { formatFormData, thousandFormat } from 'utils/tools';
import eventEmmiter from 'utils/events';
import './approve.less';

const confirm = Modal.confirm;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
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
    name: '部門拒絕',
    className: 'status-reject',
  },
  4: {
    name: '部門同意',
    className: 'status-give',
  },
  5: {
    name: '審批拒絕',
    className: 'status-reject',
  },
};
const deleteRightList = ['points_management', 'points_approval', 'delete'];
const updateRightList = ['points_management', 'points_approval', 'update'];
class ApproveListPage extends React.Component {
  columns = [
    {
      title: '預算編號ID',
      dataIndex: 'id',
    },
    {
      title: '審批帳戶',
      dataIndex: 'account_name',
    },
    {
      title: '所屬部門',
      dataIndex: 'department_name',
    },
    {
      title: '積分餘額',
      // dataIndex: 'balance',
      render: (record) => {
        return thousandFormat(record.balance);
      },
    },
    {
      title: '積分審批額度',
      // dataIndex: 'amount',
      render: (record) => {
        return thousandFormat(record.amount);
      },
    },
    {
      title: '發起時間',
      render: (record) => {
        return moment(record.created_at * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '發起人',
      dataIndex: 'username',
    },
    {
      title: '狀態',
      render: (record) => {
        return (
          <span
            className={['u-status', status2Json[record.status].className].join(
              ' '
            )}
          >
            {status2Json[record.status].name}
          </span>
        );
      },
    },
    {
      title: '操作',
      width: 180,
      render: (text, record, index) => {
        return this.renderOpeartion(record, index);
      },
    },
  ];

  componentDidMount() {
    this.handleKeyupEvent();
  }

  componentWillUnmount() {
    eventEmmiter.removeAllListeners('keyup');
  }

  handleKeyupEvent() {
    const {
      location: { pathname },
    } = this.props;
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      if (pathname !== '/integral-manage/approve') {
        return;
      }
      const { time, department, id, account_name } = form.getFieldsValue();
      // NOTE: department 为全部时也触发 enter 行为
      if (
        this.checkSearchItemValueValidate(id, account_name) ||
        time ||
        department !== null
      ) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (id, account_name) => {
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

    const _account_name = account_name.trim();
    if (_account_name) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  renderOpeartion(record, index) {
    const status = +record.status;
    if (status === 0) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          <AuthBtnCom authList={record.permission} currrentAuth="delete">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.deleteApplicationAction(record, index)}
            >
              刪除
            </span>
          </AuthBtnCom>
          {this.editReactDom(record)}
        </span>
      );
    }
    // 审批
    if (status === 2) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          <AuthBtnCom authList={record.permission} currrentAuth="update">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.cancelApplicationAction(record, index)}
            >
              取消申請
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    // 拒绝或者驳回的 部门驳回或者财务驳回
    if (status === 3 || status === 5) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
        </span>
      );
    }
    return (
      <span className="m-operation-wrap">
        {this.lookDetailReactDom(record)}
      </span>
    );
  }

  // 查看详情 reactDom
  lookDetailReactDom(record) {
    return (
      <span
        className="u-operation-item u-color-blue"
        onClick={() => this.toDetail(record, 'look')}
      >
        查看
      </span>
    );
  }

  // 修改 reactDom
  editReactDom(record) {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="update">
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.toDetail(record, 'edit')}
        >
          修改申請
        </span>
      </AuthBtnCom>
    );
  }

  // 查看详情
  toDetail(record, type) {
    let url = `/integral-manage/approve/set?id=${record.id}`;
    if (type) {
      url += `&type=${type}`;
    }
    this.props.history.push(url);
  }

  // 删除
  async deleteApplicationAction(record, index) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要刪除該審批嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const res = await deleteApplication({ id: record.id });
          const dataInfo = res.data;
          resolve();
          if (dataInfo.status) {
            self.reloadPage();
          }
        });
      },
    });
  }
  // 取消申请
  cancelApplicationAction(record, index) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要取消該審批嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const res = await cancelApplication({ id: record.id });
          const dataInfo = res.data;
          resolve();
          if (dataInfo.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  // 搜索
  searchAction = () => {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.begin_time = moment(values.time[0]).format('YYYY-MM-DD');
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
    const { apporveListInfo } = this.props.integralManageApprove;
    const { total, list, loading } = apporveListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-approve-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="預算編號ID：" {...formItemLayout}>
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
                <FormItem label="賬戶名稱：" {...formItemLayout}>
                  {getFieldDecorator('account_name', {
                    initialValue: query.account_name || '',
                  })(<Input placeholder="請輸入賬戶名稱關鍵字" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="所屬部門：" {...formItemLayout}>
                  {getFieldDecorator('department', {
                    initialValue: query.department,
                  })(
                    <PartmentTreeSelect
                      partmentList={this.props.system.partmentList}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="發起時間" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.begin_time
                      ? [moment(query.begin_time), moment(query.end_time)]
                      : null,
                  })(<RangePicker style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col
                span={24}
                style={{
                  textAlign: 'center',
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
          style={{ marginTop: 24 }}
          title="全部積分審批事件"
          extra={
            <AuthWrapCom
              authList={['points_management', 'points_approval', 'add']}
            >
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  this.props.history.push('/integral-manage/approve/set');
                }}
              >
                發起積分審批
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
    );
  }
}
export default withRouter(
  connect(({ integralManageApprove, system }) => ({
    integralManageApprove: integralManageApprove.toJS(),
    system: system.toJS(),
  }))(Form.create()(ApproveListPage))
);
