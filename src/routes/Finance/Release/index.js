import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  Card,
  DatePicker,
  Select,
  message,
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import LoadingCom from 'components/LoadingCom';
import { formatFormData } from 'utils/tools';
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
      title: '發放項 ID',
      dataIndex: 'id',
    },
    {
      title: '發放項類型',
      render: (text, record) => {
        return +record.entry_type === 1 ? '自定義' : '固定';
      },
    },
    {
      title: '申請時間',
      dataIndex: 'edit_time',
    },
    {
      title: '發起部門',
      dataIndex: 'department_name',
    },
    {
      title: '積分帳戶 ID',
      // dataIndex: 'offer_account'
      dataIndex: 'offer_account_union_id',
      render: (text, record) => {
        return record.offer_account_union_id || '--';
      },
    },
    {
      title: '發放項名稱',
      dataIndex: 'entry_name',
    },
    {
      title: '發放開始時間',
      dataIndex: 'start_time',
    },
    {
      title: '發放失效時間',
      dataIndex: 'end_time',
    },
    {
      title: '發起人',
      dataIndex: 'edit_by',
    },
    {
      title: '狀態',
      width: 90,
      render: (record) => {
        const { status, offer_policy_entry_id } = record;
        return (
          <span
            className={[
              'u-status',
              status === 1 && offer_policy_entry_id === 0
                ? 'status-reject'
                : status2Json[record.status] &&
                  status2Json[record.status].className,
            ].join(' ')}
          >
            {status === 1 && offer_policy_entry_id === 0
              ? '發放異常'
              : status2Json[record.status] && status2Json[record.status].name}
          </span>
        );
      },
    },
    {
      title: '操作',
      width: 80,
      render: (text, record, index) => {
        return (
          <AuthBtnCom authList={record.permission} currrentAuth="detail">
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
      // eslint-disable-next-line prefer-const
      // console.log(this.checkSearchItemValueValidate(values));
      const {
        operation_time,
        effect_time,
        status,
        apply_time,
        initiate_department,
      } = values;
      if (
        this.checkSearchItemValueValidate(values) ||
        operation_time ||
        apply_time ||
        initiate_department ||
        status !== null ||
        effect_time
      ) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { id, entry_name, user_id, union_id } = values;
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

    const _entry_name = entry_name.trim();
    if (_entry_name) {
      isValid = true;
    }

    const _user_id = user_id.trim();
    if (_user_id) {
      isValid = true;
    }

    if (union_id !== null && union_id) {
      const _union_id = union_id.trim();
      if (_union_id && /^\d*$/g.test(_union_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的積分帳戶ID');
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
    let url = `/finance/release/detail?id=${record.id}`;
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
      const { apply_time, effect_time, operation_time } = values;
      const query = formatFormData(values);
      if (apply_time && apply_time.length) {
        query.a_start_time = moment(apply_time[0]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        query.a_end_time = moment(apply_time[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      if (effect_time && effect_time.length) {
        query.e_start_time = moment(effect_time[0]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        query.e_end_time = moment(effect_time[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      if (operation_time && operation_time.length) {
        query.u_start_time = moment(operation_time[0]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        query.u_end_time = moment(operation_time[1]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
      }
      query.page = 1;
      delete query.apply_time;
      delete query.effect_time;
      delete query.operation_time;
      if (query.initiate_department === 'all') {
        delete query.initiate_department;
      }
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
    const { listInfo } = this.props.financeRelease;
    const { total, list, loading } = listInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="發放項 ID： " {...formItemLayout}>
                  {getFieldDecorator('id', {
                    initialValue: query.id,
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
                <FormItem label="發起部門：" {...formItemLayout}>
                  {getFieldDecorator('initiate_department', {
                    initialValue: query.initiate_department,
                  })(
                    <PartmentTreeSelect
                      partmentList={this.props.system.partmentList}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="申請時間：" {...formItemLayout}>
                  {getFieldDecorator('apply_time', {
                    initialValue: query.a_start_time
                      ? [moment(query.a_start_time), moment(query.a_end_time)]
                      : null,
                  })(
                    <RangePicker
                      disabledDate={(current) => current >= moment()}
                      showTime
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="發放項名稱：" {...formItemLayout}>
                  {getFieldDecorator('entry_name', {
                    initialValue: query.entry_name || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="有效時間：" {...formItemLayout}>
                  {getFieldDecorator('effect_time', {
                    initialValue: query.e_start_time
                      ? [moment(query.e_start_time), moment(query.e_end_time)]
                      : null,
                  })(
                    <RangePicker
                      // disabledDate={current => current >= moment()}
                      showTime
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="發起人：" {...formItemLayout}>
                  {getFieldDecorator('user_id', {
                    initialValue: query.user_id || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="操作時間：" {...formItemLayout}>
                  {getFieldDecorator('operation_time', {
                    initialValue: query.u_start_time
                      ? [moment(query.u_start_time), moment(query.u_end_time)]
                      : null,
                  })(
                    <RangePicker
                      showTime
                      disabledDate={(current) => current >= moment()}
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="積分帳戶 ID：" {...formItemLayout}>
                  {getFieldDecorator('union_id', {
                    initialValue: query.union_id,
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
                <FormItem label="審批狀態：" {...formItemLayout}>
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
                      <Option value="4">審批拒絕</Option>
                    </Select>
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
          bordered={false}
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="全部發放項審批"
          extra={
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
  connect(({ financeRelease, system }) => ({
    financeRelease: financeRelease.toJS(),
    system: system.toJS(),
  }))(Form.create()(BudgetListPage))
);
