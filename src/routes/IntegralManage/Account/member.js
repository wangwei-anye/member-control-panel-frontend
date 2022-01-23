import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import {
  Form,
  Select,
  Icon,
  Row,
  Col,
  Input,
  Button,
  Modal,
  Card,
  message,
  DatePicker,
  Spin,
} from 'antd';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import TabRouter from 'components/TabRouter';
import { blockAccountRequest } from 'services/integralManage/account/account';
import AuthWrapCom from 'components/AuthCom';
import { formatFormData, isUserHasRights } from 'utils/tools';
import { INTEGRAL_MANAGE_ACCOUNT_TABLIST } from 'config/ob.config';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';

import './account.less';

const { confirm } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
// 表单项布局
const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
    md: { span: 8 },
    lg: { span: 7 },
    xl: { span: 5 },
    xxl: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 17 },
    md: { span: 16 },
    lg: { span: 17 },
    xl: { span: 19 },
    xxl: { span: 20 },
  },
};

const updateStateRightList = ['points_management', 'points_account', 'block'];

class MemberContentCom extends React.Component {
  columns = [
    {
      title: '賬戶ID',
      dataIndex: 'union_id',
    },
    {
      title: '會員ID',
      dataIndex: 'account_id',
    },
    // {
    //   title: '會員名稱',
    //   dataIndex: 'account_name'
    // },
    {
      title: '更新時間',
      render: (text, record) => {
        return moment(record.updated_at).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '積分餘額',
      render: (text, record) => {
        return record.balance_amount.toLocaleString
          ? record.balance_amount.toLocaleString()
          : record.balance_amount;
      },
    },
    {
      title: '最近即將過期積分數',
      dataIndex: 'recently_expire_amount',
    },
    {
      title: '最近過期時間',
      render: (record) => {
        const { recently_expire_at } = record;
        if (recently_expire_at) {
          return `${moment(recently_expire_at).format('YYYY-MM-DD')}`;
        }
        return '--';
      },
    },
    {
      title: '賬戶狀態',
      render: (record) => {
        return (
          <span
            className={[
              'status',
              record.status === 'valid' ? 'status__normal' : 'status__forbid',
            ].join(' ')}
          >
            {record.status === 'valid' ? '正常' : '已凍結'}
          </span>
        );
      },
    },
    {
      title: '操作',
      width: 160,
      render: (text, record) => {
        return (
          <span className="m-operation-wrap">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetail(record)}
            >
              查看明細
            </span>
            {/* NOTE: 根据产品要求去掉冻结 */}
            {/* <AuthWrapCom authList={updateStateRightList}>
              <span
                className="u-operation-item u-color-red"
                onClick={() => this.forbidAction(record)}
              >
                {record.status === 'valid' ? '凍結' : '取消凍結'}
              </span>
            </AuthWrapCom> */}
          </span>
        );
      },
    },
  ];

  // 去会员积分详情里面
  toDetail(record) {
    if (!record.account_id) {
      return;
    }
    this.props.history.push(`/member/detail-integral?id=${record.account_id}`);
  }

  // 去積分餘額過期查詢
  gotoIntegralExpired() {
    this.props.history.push('/integral-manage/account/integralExpired');
  }

  componentDidMount() {
    const isHasLoadRight = isUserHasRights([
      'points_management',
      'points_account',
      'balance_account',
    ]);
    if (!isHasLoadRight) {
      this.props.history.push('/integral-manage/account/operation');
    }
    this.bindKeyupEvent();
  }

  bindKeyupEvent() {
    eventEmmiter.on('keyup', this.handleKeyupEvent.bind(this));
  }

  handleKeyupEvent() {
    const { form } = this.props;
    const { status, union_id, account_id } = form.getFieldsValue();
    if (this.checkSearchItemValueValidate(union_id, account_id) || status) {
      return this.searchAction();
    }
  }

  checkSearchItemValueValidate = (id, account_id) => {
    let isValid = false;
    if (id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的帳號ID');
        return false;
      }
    }

    if (account_id) {
      const _account_id = account_id.trim();
      if (_account_id && /^\d*$/g.test(_account_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的會員ID');
        return false;
      }
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  componentWillUnmount() {
    eventEmmiter.removeAllListeners('keyup');
  }

  forbidAction(record) {
    const self = this;
    if (!record.union_id) {
      return;
    }
    const status = record.status;
    const content = `確定要${
      status === 'valid' ? '凍結' : '取消凍結'
    }改會員賬戶嗎？`;
    confirm({
      title: '提示',
      content,
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await blockAccountRequest({
            union_id: record.union_id,
            result: status === 'valid' ? 'invalid' : 'valid',
          });
          if (data && data.status) {
            resolve();
            self.reloadPage();
          } else {
            message.error(data.message);
          }
        });
      },
    });
  }

  searchAction() {
    const { history, location, system, form } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const pageSize = system.query.pageSize;
      if (pageSize) {
        values.pageSize = pageSize;
      }
      if (values.min_points) {
        values.min_points = parseInt(values.min_points || 0, 10);
        form.setFieldsValue({
          min_points: values.min_points,
        });
      }
      if (values.max_points) {
        values.max_points = parseInt(values.max_points || 0, 10);
        form.setFieldsValue({
          max_points: values.max_points,
        });
      }
      if (values.max_points < values.min_points) {
        const tempNum = values.max_points;
        values.max_points = values.min_points;
        values.min_points = tempNum;
      }
      const query = formatFormData(values);
      query.page = 1;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  }

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      memberListInfo,
      memberListInfoLoading,
    } = this.props.integralManageAccount;
    const { total, list, loading } = memberListInfo;
    const { query } = this.props.system;
    const newTabList = INTEGRAL_MANAGE_ACCOUNT_TABLIST.filter((item) => {
      return isUserHasRights(item.permit);
    });
    return (
      <div className="p-integralmanage-account-wrap">
        <TabRouter tabList={newTabList} defaultKey="member" />
        <FoldableCard
          className="custom-card"
          title={
            <span>
              <Icon type="search" /> 搜索條件
            </span>
          }
        >
          <Form {...formItemLayout} labelAlign="left">
            <Row gutter={48}>
              <Col span={8} className="input-box">
                <FormItem label="帳號ID">
                  {getFieldDecorator('union_id', {
                    initialValue: query.union_id || '',
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字ID',
                      },
                    ],
                  })(<Input placeholder="請輸入帳號ID" />)}
                </FormItem>
              </Col>
              <Col span={8} className="input-box">
                <FormItem label="會員ID">
                  {getFieldDecorator('account_id', {
                    initialValue: query.account_id || '',
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字ID',
                      },
                    ],
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={8} className="input-box">
                <FormItem label="賬戶狀態">
                  {getFieldDecorator('status', {
                    initialValue: query.status || '',
                  })(
                    <Select
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                    >
                      <Option value="">全部</Option>
                      <Option value="valid">正常</Option>
                      <Option value="invalid">已凍結</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8} className="input-box">
                <FormItem label="積分餘額">
                  <FormItem
                    className="search-point"
                    style={{ width: 'calc(50% - 12px)' }}
                  >
                    {getFieldDecorator('min_points', {
                      initialValue: query.min_points || '',
                      rules: [
                        {
                          pattern: /^(-|\+)?\d+$/g,
                          message: '僅支持數字輸入',
                        },
                      ],
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                  <span className="search-point-line">-</span>
                  <FormItem
                    className="search-point"
                    style={{ width: 'calc(50% - 12px)' }}
                  >
                    {getFieldDecorator('max_points', {
                      initialValue: query.max_points || '',
                      rules: [
                        {
                          pattern: /^(-|\+)?\d+$/g,
                          message: '僅支持數字輸入',
                        },
                      ],
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon="search"
                  onClick={() => this.searchAction()}
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
          title="全部會員積分賬戶"
          extra={
            <AuthWrapCom
              authList={[
                'points_management',
                'points_account',
                'points_expire',
              ]}
            >
              <Button type="primary" onClick={() => this.gotoIntegralExpired()}>
                積分餘額過期查詢
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
  connect(({ integralManageAccount, system }) => ({
    integralManageAccount: integralManageAccount.toJS(),
    system: system.toJS(),
  }))(Form.create()(MemberContentCom))
);
