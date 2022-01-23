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
  Select,
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import LoadingCom from 'components/LoadingCom';
import { formatFormData, thousandFormat } from 'utils/tools';
import eventEmmiter from 'utils/events';
import '../finance.less';

const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
// 表单项布局
const formItemLayout = {
  labelCol: {
    xs: 10,
    sm: 10,
    md: 9,
    lg: 6,
    xl: 5,
    xxl: 4,
  },
  wrapperCol: {
    xs: 14,
    sm: 14,
    md: 15,
    lg: 18,
    xl: 18,
    xxl: 18,
  },
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
const forEachItem = (arr) => {
  let resultArr = [];
  arr.forEach((item) => {
    if (item.child && Array.isArray(item.child)) {
      resultArr = resultArr.concat(forEachItem(item.child));
    } else {
      resultArr.push(item);
    }
  });
  return resultArr;
};
class BudgetListPage extends React.Component {
  columns = [
    {
      title: '編號',
      dataIndex: 'id',
    },
    {
      title: '發起時間',
      dataIndex: 'created_at',
    },
    {
      title: '發放積分',
      render: (text, record) => {
        return thousandFormat(record.amount);
      },
    },
    {
      title: '發放賬戶(ID)',
      render: (text, record) => {
        return (
          <div>
            <p>
              {record.account_name}({record.union_id})
            </p>
          </div>
        );
      },
    },
    {
      title: '接受賬戶(ID)',
      render: (record) => {
        if (record.type === 2) {
          return <div>批量導入{record.batch_member_amount}人</div>;
        }
        return (
          <div>
            {record.receiver_info.map((item, index) => {
              return (
                <p key={index}>
                  <b>
                    {item.receive_name || (
                      <span style={{ color: 'red' }}>無暱稱</span>
                    )}
                  </b>
                  （{item.receive_id}）
                </p>
              );
            })}
          </div>
        );
      },
    },
    {
      title: '所屬部門',
      dataIndex: 'department_name',
    },
    {
      title: '申請人',
      dataIndex: 'admin_name',
    },
    {
      title: '審批人',
      dataIndex: 'approval_by',
    },
    {
      title: '狀態',
      width: 90,
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
      title: '操作時間',
      width: 145,
      dataIndex: 'updated_at',
    },
    {
      title: '操作',
      width: 80,
      render: (text, record, index) => {
        return (
          <AuthBtnCom authList={record.permission} currrentAuth="manual_detail">
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetail(record)}
            >
              查看詳情
            </span>
          </AuthBtnCom>
        );
      },
    },
  ];

  componentWillUnmount() {
    // NOTE: remove Listeners
    eventEmmiter.removeAllListeners();
  }

  componentDidMount() {
    this.handleKeyupEvent();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { status, time, department } = values;
      if (
        this.checkSearchItemValueValidate(values) ||
        time ||
        department !== null ||
        status !== null
      ) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { id, account_name, user_id, receive_id } = values;
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

    const _account_name = account_name.trim();
    if (_account_name) {
      isValid = true;
    }

    const _receive_id = receive_id.trim();
    if (_receive_id) {
      isValid = true;
    }

    if (user_id !== null && user_id) {
      const _user_id = user_id.trim();
      if (_user_id && /^\d*$/g.test(_user_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的預算發起人ID');
        return false;
      }
    }
    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  // 查看详情
  toDetail(record, type) {
    let url = `/finance/hand/detail?id=${record.id}`;
    if (type) {
      url += `&type=${type}`;
    }
    this.props.history.push(url);
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
    const { listInfo } = this.props.financeHand;
    const { total, list, loading } = listInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row>
              <Col span={11}>
                <FormItem label="編號" {...formItemLayout}>
                  {getFieldDecorator('id', {
                    initialValue: query.id,
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字',
                      },
                    ],
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="發起部門：" {...formItemLayout}>
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
                <FormItem label="積分帳戶名稱：" {...formItemLayout}>
                  {getFieldDecorator('account_name', {
                    initialValue: query.account_name || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="積分接收賬戶" {...formItemLayout}>
                  {getFieldDecorator('receive_id', {
                    initialValue: query.receive_id || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="預算發起人ID：" {...formItemLayout}>
                  {getFieldDecorator('user_id', {
                    initialValue: query.user_id,
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
                <FormItem label="預算狀態：" {...formItemLayout}>
                  {getFieldDecorator('status', {
                    initialValue: query.status || '',
                  })(
                    <Select
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                    >
                      <Option value="">全部</Option>
                      <Option value="1">審批通過</Option>
                      <Option value="2">審批中</Option>
                      <Option value="3">審批拒絕</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="預算發起時間" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.begin_time
                      ? [moment(query.begin_time), moment(query.end_time)]
                      : null,
                  })(
                    <RangePicker
                      disabledDate={(current) => current >= moment()}
                      style={{ width: '100%' }}
                    />
                  )}
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
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="全部手動發放審批"
          bordered={false}
          extra={
            <Button
              icon="plus"
              type="primary"
              onClick={() => {
                this.props.history.push('/integral-manage/give-hand/detail');
              }}
            >
              新增手動發放項申請
            </Button>
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
  connect(({ financeHand, system }) => ({
    financeHand: financeHand.toJS(),
    system: system.toJS(),
  }))(Form.create()(BudgetListPage))
);
