import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import { formatFormData, isUserHasRights } from 'utils/tools';
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
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import { blockAccountRequest } from 'services/integralManage/account/account';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import TabRouter from 'components/TabRouter';
import AuthWrapCom from 'components/AuthCom';
import { INTEGRAL_MANAGE_ACCOUNT_TABLIST } from 'config/ob.config';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import './account.less';

const { confirm } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const updateStateRightList = ['points_management', 'points_account', 'block'];
class MemberContentCom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  columns = [
    {
      title: '賬戶ID',
      dataIndex: 'union_id',
    },
    {
      title: '賬戶名稱',
      render: (text, record) => '--',
    },
    {
      title: '商家信息',
      render: (text, record) => '--',
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
      key: 'operation',
      width: 80,
      render: (text, record) => {
        return (
          <span className="m-operation-wrap">
            <AuthWrapCom authList={updateStateRightList}>
              <span
                className="u-operation-item u-color-red"
                onClick={() => this.forBidAction(record)}
              >
                {record.status === 'valid' ? '凍結' : '取消凍結'}
              </span>
            </AuthWrapCom>
          </span>
        );
      },
    },
  ];

  componentWillUnmount() {
    this.setState({
      loading: false,
    });
    eventEmmiter.removeAllListeners('keyup');
  }

  componentDidMount() {
    const isHasLoadRight = isUserHasRights([
      'points_management',
      'points_account',
      'balance',
    ]);
    if (!isHasLoadRight) {
      const isHasAppInfoRight = isUserHasRights(['app_info', 'index']);
      if (!isHasAppInfoRight) {
        message.error('無權訪問，即將跳轉至看板', 2, () => {
          this.props.history.replace('/home');
        });
      } else {
        message.error('無權訪問，即將跳轉至應用概況', 2, () => {
          this.props.history.replace('/');
        });
      }
      return;
    }
    this.setState({
      loading: true,
    });
    this.handleKeyupEvent();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const { status, union_id } = form.getFieldsValue();
      if (this.checkSearchItemValueValidate(union_id) || status) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (id) => {
    if (id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        return true;
      }
      message.error('請輸入純數字的帳號ID');
      return false;
    }
    return true;
  };

  forBidAction(record) {
    if (!record.union_id) {
      return;
    }
    const self = this;
    const status = record.status;
    const content = `確定要${
      status === 'valid' ? '凍結' : '取消凍結'
    }改賬戶嗎?`;
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
          }
        });
      },
    });
  }

  searchAction() {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const pageSize = system.query.pageSize;
      if (pageSize) {
        values.pageSize = pageSize;
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
    const { merchantListInfo } = this.props.integralManageAccount;
    const { total, list, loading } = merchantListInfo;
    const { query } = this.props.system;
    if (
      !isUserHasRights(updateStateRightList) &&
      this.columns.filter((item) => item.key === 'operation').length
    ) {
      this.columns.pop();
    }
    const newTabList = INTEGRAL_MANAGE_ACCOUNT_TABLIST.filter((item) => {
      return isUserHasRights(item.permit);
    });
    return (
      <div className="p-integralmanage-account-wrap">
        {this.state.loading ? (
          <React.Fragment>
            <TabRouter tabList={newTabList} defaultKey="merchant" />
            <FoldableCard
              className="custom-card"
              title={
                <span>
                  <Icon type="search" /> 搜索條件
                </span>
              }
            >
              <Form>
                <Row gutter={48}>
                  <Col span={11}>
                    <FormItem label="帳號ID" {...formItemLayout}>
                      {getFieldDecorator('union_id', {
                        initialValue: query.union_id || '',
                        rules: [
                          {
                            pattern: /^\d*$/g,
                            message: '請輸入純數字ID',
                          },
                        ],
                      })(<Input placeholder="請輸入" />)}
                    </FormItem>
                  </Col>
                  <Col span={11} className="none">
                    <FormItem label="賬戶名稱" {...formItemLayout}>
                      {getFieldDecorator('name', {
                        initialValue: query.name,
                      })(<Input placeholder="請輸入" />)}
                    </FormItem>
                  </Col>
                  <Col span={11} className="none">
                    <FormItem label="商家信息" {...formItemLayout}>
                      {getFieldDecorator('info', {
                        initialValue: query.info,
                      })(<Input placeholder="請輸入" />)}
                    </FormItem>
                  </Col>
                  <Col span={11}>
                    <FormItem label="賬戶狀態" {...formItemLayout}>
                      {getFieldDecorator('status', {
                        initialValue: query.status,
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
              title="全部商家積分賬戶"
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
          </React.Fragment>
        ) : null}
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
