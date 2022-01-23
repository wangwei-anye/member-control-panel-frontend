import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import { formatFormData, isUserHasRights } from 'utils/tools';
import {
  message,
  Form,
  Select,
  Icon,
  Row,
  Col,
  Input,
  Button,
  Card,
  Modal,
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import AuthWrapCom from 'components/AuthCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import AuthBtnCom from 'components/AuthBtnCom';
import TabRouter from 'components/TabRouter';
import { INTEGRAL_MANAGE_ACCOUNT_TABLIST } from 'config/ob.config';
import CreateAccount from 'components/Integral/CreateAccountCom';
import EditCcList from 'components/Integral/EditCcList';
import AddPoint from 'components/Integral/AddPoint';
import {
  blockAccout,
  addSubAccountPoint,
  fetchAccoutDetail,
  deleteAccount,
  addBusinessAccount,
  updateBusinessAccount,
} from 'services/integralManage/account/account';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import './account.less';

const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const statusJson = {
  1: { name: '正常', className: 'status__normal' },
  2: { name: '已凍結', className: 'status__forbid' },
  0: { name: '未啓用', className: 'status__notDone' },
};
const editRightList = ['points_management', 'points_account', 'update_account'];
const updateStatusRightList = [
  'points_management',
  'points_account',
  'update_status',
];
const deleteRightList = ['points_management', 'points_account', 'delete'];
class MemberContentCom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      isAccountLoading: false,
      ccListModal: false,
      addPointModal: false,
      addPointData: {
        parentName: '',
        union_id: '',
      },
      isCcListLoading: false,
      currentAccountInfo: {},
      ccList: [],
    };
  }
  columns = [
    {
      title: '賬戶ID',
      dataIndex: 'union_id',
    },
    {
      title: '賬戶名稱',
      dataIndex: 'account_name',
    },
    {
      title: '所屬部門',
      dataIndex: 'department_name',
    },
    {
      title: '積分餘額',
      dataIndex: 'balance',
    },
    {
      title: '賬戶狀態',
      render: (record) => {
        return (
          <span
            className={['status', statusJson[record.status].className].join(
              ' '
            )}
          >
            {statusJson[record.status].name}
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'operation',
      width: 160,
      render: (text, record, index) => {
        return this.operation(record, index);
      },
    },
  ];

  static getDerivedStateFromProps(props, state) {
    // console.log(props, state)
    if (state.ccList.length === 0) {
      return {
        ...state,
        ccList: props.integralManageAccount.linkArr,
      };
    }
    return null;
  }

  componentWillUnmount() {
    eventEmmiter.removeAllListeners('keyup');
  }

  componentDidMount() {
    const isHasLoadRight = isUserHasRights([
      'points_management',
      'points_account',
      'index',
    ]);
    if (!isHasLoadRight) {
      this.props.history.push('/integral-manage/account/merchant');
    }
    this.handleKeyupEvent();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const { status, union_id, account_name } = form.getFieldsValue();
      if (this.checkSearchItemValueValidate(union_id, account_name) || status) {
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
        message.error('請輸入純數字的帳號ID');
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

  operation(record, index) {
    const status = +record.status;
    if (status === 0) {
      return (
        <span className="m-operation-wrap">
          <AuthBtnCom authList={record.permission} currrentAuth="detail">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.lookAccountAction(record, index)}
            >
              查看
            </span>
          </AuthBtnCom>
          <AuthBtnCom
            authList={record.permission}
            currrentAuth="update_account"
          >
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.editAccountAction(record, 'all')}
            >
              編輯
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="delete">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.deleteAccountAction(record, index)}
            >
              刪除
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    if (status === 1) {
      return (
        <span className="m-operation-wrap">
          <AuthBtnCom authList={record.permission} currrentAuth="detail">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.lookAccountAction(record, index)}
            >
              查看
            </span>
          </AuthBtnCom>
          <AuthBtnCom
            authList={record.permission}
            currrentAuth="update_account"
          >
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.editAccountAction(record, 'part')}
            >
              編輯
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="apply">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toApplyAction(record)}
            >
              積分預算申請
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="child_apply">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => {
                this.setState({
                  addPointModal: true,
                  addPointData: {
                    parent_id: record.parent_id,
                    parent_name: record.parent_account_name,
                    parent_union_id: record.parent_union_id,
                    name: record.account_name,
                    union_id: record.union_id,
                  },
                });
              }}
            >
              積分追加
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="update_status">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.forbidAccountAction(record, index)}
            >
              凍結
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    if (status === 2) {
      return (
        <span className="m-operation-wrap">
          <AuthBtnCom authList={record.permission} currrentAuth="detail">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.lookAccountAction(record, index)}
            >
              查看
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="update_status">
            <span
              className="u-operation-item u-color-red"
              onClick={() => this.forbidAccountAction(record, index)}
            >
              取消凍結
            </span>
          </AuthBtnCom>
        </span>
      );
    }
  }
  /**
   * 冻结和解冻账户
   * @param {record} record
   */
  async forbidAccountAction(record, index) {
    if (!record) {
      return;
    }
    const status = +record.status === 2 ? 1 : 2;
    const self = this;
    let tips = '';
    if (record.children) {
      if (record.status === 1) {
        tips = '請注意凍結主帳戶會導致從屬的子帳戶一併凍結。';
      } else {
        tips = '確定要解凍該賬戶嗎？';
      }
    } else {
      tips = `確定要${+record.status === 1 ? '凍結' : '解凍'}該賬戶嗎？`;
    }
    confirm({
      title: '提示',
      content: tips,
      onOk() {
        return new Promise(async (resolve) => {
          const res = await blockAccout(record.id);
          resolve();
          if (res.data.status) {
            await self.props.dispatch({
              type: 'integralManageAccount/blockAccount',
              payload: {
                index,
                status,
              },
            });
            const {
              system: { query },
              integralManageAccount: {
                opearationListInfo: { total },
              },
            } = self.props;
            let page = query.page;
            const pageSize = query.pageSize;
            if (page > 1 && total % pageSize === 1) {
              // eslint-disable-next-line operator-assignment
              page = page - 1;
            }
            self.reloadPage(page);
          }
        });
      },
    });
  }
  /**
   * 去申请审批页面
   */
  toApplyAction(record) {
    this.props.history.push('/integral-manage/approve/set');
  }
  /**
   * 删除账户
   * @param {record} record
   */
  async deleteAccountAction(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要刪除該賬戶嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const res = await deleteAccount(record.id);
          resolve();
          if (res.data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  /**
   * 编辑账户
   * @param {record} record
   * @param {string} type // all 代表全部能編輯  part代表仅可编辑余额不足预警值和联系人
   */
  editAccountAction(record, type) {
    if (!record.id) {
      return;
    }
    if (type === 'all') {
      sessionStorage.setItem('operationDetailType', 'Edit_all');
    } else {
      sessionStorage.setItem('operationDetailType', 'Edit_part');
    }
    this.props.history.push(
      `/integral-manage/account/operationDetail?id=${record.id}&union_id=${record.union_id}`
    );
  }

  /**
   * 编辑账户
   * @param {record} record
   */
  lookAccountAction(record) {
    if (!record.id) {
      return;
    }
    sessionStorage.setItem('operationDetailType', 'Look');
    this.props.history.push(
      `/integral-manage/account/operationDetail?id=${record.id}&union_id=${record.union_id}`
    );
  }

  /**
   * 新增账户
   * @param {record} record
   */
  createAccountAction() {
    this.props.dispatch({
      type: 'integralManageAccount/clearAccoutDetail',
      payload: {},
    });
    sessionStorage.setItem('operationDetailType', 'Create');
    this.props.history.push('/integral-manage/account/operationDetail');
  }

  /**
   * 搜索
   */
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
      this.setState({ currentPage: 1 });
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  }
  /**
   * 部门变化确定事件
   * @param {value} 部门变化传递过来的数据
   */
  async modalOkAction(value) {
    this.setState({
      isAccountLoading: true,
    });
    if (value.id) {
      this.updateAccountRequest({
        union_id: value.id,
        account_name: value.accountName,
        department: value.partmentInfo.part2,
      });
    } else {
      const res = await addBusinessAccount({
        account_name: value.accountName,
        department: value.partmentInfo.part2,
      });
      if (res.data.status) {
        this.setState({
          isAccountLoading: false,
          isShow: false,
        });
        this.reloadPage();
      } else {
        this.setState({
          isAccountLoading: false,
        });
      }
    }
  }

  // Update cclist in state
  async updateCcList(value) {
    // console.log(value)
    this.setState({
      ccList: value,
    });
  }

  async updateAccountRequest(postData) {
    const res = await updateBusinessAccount(postData);
    if (res.data.status) {
      this.setState({
        isAccountLoading: false,
        isShow: false,
      });
      this.reloadPage();
    } else {
      this.setState({
        isAccountLoading: false,
      });
    }
  }

  addPointSuccess = async (data) => {
    const self = this;
    confirm({
      title: '提示',
      content: '此操作會立刻生效， 確認追加積分至子帳號？',
      onOk() {
        return new Promise(async (resolve) => {
          const res = await addSubAccountPoint(data);
          resolve();
          if (res.data.status) {
            message.success('操作成功');
            self.setState({
              addPointModal: false,
            });
            self.reloadPage();
          } else {
            self.setState({
              isAccountLoading: false,
            });
          }
        });
      },
    });
  };

  /**
   * 部门变化取消事件
   */
  modalCancelAction() {
    this.setState({
      isShow: false,
      isAccountLoading: false,
    });
  }

  /**
   * 重载页面，用于删除账户后刷新页面
   */
  reloadPage(page) {
    const { history, location, system } = this.props;
    let query = system.query;
    if (page) {
      query = Object.assign(system.query, { page });
    }
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  }

  pageChange = (pagination) => {
    const { history, location, system } = this.props;
    this.setState({
      currentPage: pagination.current,
    });
    const query = system.query;
    const querystring = qs.stringify({
      ...query,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    history.push({ ...location, search: `?${querystring}` });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { opearationListInfo } = this.props.integralManageAccount;
    const { total, list, loading } = opearationListInfo;
    const { query } = this.props.system;
    const newTabList = INTEGRAL_MANAGE_ACCOUNT_TABLIST.filter((item) => {
      return isUserHasRights(item.permit);
    });
    return (
      <div className="p-integralmanage-account-wrap">
        <TabRouter tabList={newTabList} defaultKey="operation" />
        <FoldableCard
          className="custom-card"
          title={
            <span>
              <Icon type="search" /> 搜索條件
            </span>
          }
        >
          <Form onSubmit={this.handleSubmit}>
            <Row gutter={48}>
              <Col span={7} className="input-box">
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
              <Col span={7} className="input-box">
                <FormItem label="賬戶名稱" {...formItemLayout}>
                  {getFieldDecorator('account_name', {
                    initialValue: query.account_name || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={7} className="input-box">
                <FormItem label="賬戶狀態" {...formItemLayout}>
                  {getFieldDecorator('status', {
                    initialValue: query.status || '',
                  })(
                    <Select
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                    >
                      <Option value="">全部</Option>
                      <Option value="0">未啓用</Option>
                      <Option value="1">正常</Option>
                      <Option value="2">已凍結</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={7} className="input-box">
                <FormItem label="積分餘額" {...formItemLayout}>
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
              <Col span={7}>
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
          title="全部運營積分賬戶"
          extra={
            <React.Fragment>
              <AuthWrapCom
                authList={[
                  'points_management',
                  'points_account',
                  'update_balance_cc_emails',
                ]}
              >
                <Button
                  icon="edit"
                  type="primary"
                  style={{ marginRight: '1em' }}
                  onClick={() => this.setState({ ccListModal: true })}
                >
                  編輯結餘警示抄送名單
                </Button>
              </AuthWrapCom>
              <AuthWrapCom
                authList={[
                  'points_management',
                  'points_account',
                  'create_account',
                ]}
              >
                <Button
                  icon="plus"
                  type="primary"
                  onClick={() => this.createAccountAction()}
                >
                  創建新運營賬戶
                </Button>
              </AuthWrapCom>
            </React.Fragment>
          }
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <Table
              rowKey="id"
              defaultExpandAllRows
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
              onChange={this.pageChange}
            />
          )}
        </Card>
        {this.state.isShow ? (
          <CreateAccount
            isLoading={this.state.isAccountLoading}
            accountInfo={this.state.currentAccountInfo}
            onOk={this.modalOkAction.bind(this)}
            onCancel={this.modalCancelAction.bind(this)}
          />
        ) : null}

        {this.state.ccListModal ? (
          <EditCcList
            isLoading={this.state.isCcListLoading}
            ccList={this.state.ccList}
            onOkCallback={this.updateCcList.bind(this)}
            onCancel={() => this.setState({ ccListModal: false })}
          />
        ) : null}
        {this.state.addPointModal ? (
          <AddPoint
            data={this.state.addPointData}
            onSuccess={this.addPointSuccess}
            onCancel={() =>
              this.setState({
                addPointModal: false,
              })
            }
          />
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
