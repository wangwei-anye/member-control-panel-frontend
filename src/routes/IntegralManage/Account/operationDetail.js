/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Form,
  Card,
  Input,
  message,
  Button,
  Icon,
  Row,
  Col,
  Table,
} from 'antd';
import {
  addBusinessAccount,
  updateBusinessAccount,
} from 'services/integralManage/account/account';
import BelongDepartment from 'components/Integral/BelongDepartmentCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import CancelBtnCom from 'components/CancelBtn';
import PromptLeave from 'components/PromptLeave';
import moment from 'moment';
import './account.less';

const FormItem = Form.Item;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const tailFormItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};
let id = 1;
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
const statusJson = {
  1: { name: '正常', className: 'status__normal' },
  2: { name: '已凍結', className: 'status__forbid' },
  0: { name: '未啓用', className: 'status__notDone' },
};

class OperationDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      partmentInfo: {
        part1: '',
        part2: this.props.auth.department,
      },
      help: {},
      isGetDefaultDepart: false, // 必須先設置默認值  再渲染部門組件  不然不能設置默認值
      operationDetailTypeIsLook:
        sessionStorage.getItem('operationDetailType') === 'Look',
      operationDetailTypeIsEditPart:
        sessionStorage.getItem('operationDetailType') === 'Edit_part',
      operationDetailTypeIsCreate:
        sessionStorage.getItem('operationDetailType') === 'Create',
    };
    this.columns = [
      {
        title: 'ID',
        dataIndex: 'union_id',
        width: 100,
      },
      {
        width: 100,
        title: '帳戶名稱',
        render: (text, record) => {
          return (
            <span>
              {record.account_name}
              {record.account_type === 0 ? (
                <span
                  style={{
                    marginLeft: 8,
                    padding: '1px  8px',
                    backgroundColor: '#e6f7ff',
                    borderRadius: 4,
                    border: 'solid 1px #91d5ff',
                    width: 36,
                    height: 20,
                    color: '#1890ff',
                  }}
                >
                  主帳戶
                </span>
              ) : null}
            </span>
          );
        },
      },
      {
        width: 120,
        title: '創建時間',
        render: (text, record) => {
          return moment(record.created_at * 1000).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        width: 80,
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
        width: 80,
        title: '積分結余',
        dataIndex: 'balance',
      },
    ];
    this.pointsColumns = [
      {
        title: '日期',
        render: (text, record) => {
          return moment(record.updated_at * 1000).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: '從帳戶',
        render: (record) => {
          return (
            <span>
              {record.from_union_id_name}({record.from_union_id})
            </span>
          );
        },
      },
      {
        title: '到帳戶',
        render: (record) => {
          return (
            <span>
              {record.to_union_id_name}({record.to_union_id})
            </span>
          );
        },
      },
      {
        title: '金額',
        dataIndex: 'amount',
      },
      {
        title: '結余',
        dataIndex: 'after_balance_amount',
      },
    ];
  }

  UNSAFE_componentWillReceiveProps(nextProp) {
    if (
      nextProp.integralManageAccount.accountInfo !=
        this.props.integralManageAccount.accountInfo &&
      Object.keys(nextProp.integralManageAccount.accountInfo).length
    ) {
      const contacts = nextProp.integralManageAccount.accountInfo.contact || [];
      id = contacts.length;

      const departmentInfo =
        nextProp.integralManageAccount.accountInfo.department_info;
      const partmentInfo = Object.assign({}, this.state.partmentInfo, {
        part1: departmentInfo.pid,
        part2: departmentInfo.department_id,
      });
      this.setState({
        isGetDefaultDepart: true,
        partmentInfo,
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { getFieldValue } = this.props.form;
    this.props.form.validateFields((err, values) => {
      this.setState({
        help: {},
      });
      if (err && err.emails) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < err.emails.length; i++) {
          if (err.emails[i] !== undefined) {
            const tempField = err.emails[i].errors[0].field;
            const obj = {};
            obj[tempField] = err.emails[i].errors[0].message;
            this.setState({
              help: obj,
            });
            break;
          }
        }
      }
      if (err && err.names) {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < err.names.length; i++) {
          if (err.names[i] !== undefined) {
            const tempField = err.names[i].errors[0].field;
            const obj = {};
            obj[tempField] = err.names[i].errors[0].message;
            this.setState({
              help: obj,
            });
            break;
          }
        }
      }

      if (!err) {
        this.sumbmitHandle(values);
      }
    });
  };

  async sumbmitHandle(values) {
    const { partmentInfo } = this.state;
    const { linkArr } = this.props.integralManageAccount;
    if (
      !this.props.integralManageAccount.accountInfo ||
      !this.props.integralManageAccount.accountInfo.id
    ) {
      if (!values.accountName.trim()) {
        message.error('請輸入賬戶名稱！');
        return;
      }
    }

    if (values.warningValue == '') {
      message.error('請輸入餘額不足預警值！');
      return;
    }

    // const checkEmailArr = [];
    // for (let j = 0; j < values.emails.length; j += 1) {
    //   if (checkEmailArr.includes(values.emails[j])) {
    //     message.error('聯繫人的郵箱不能重複');
    //     return;
    //   }
    //   checkEmailArr.push(values.emails[j]);
    // }

    // for (let i = 0; i < linkArr.length; i += 1) {
    //   for (let j = 0; j < values.emails.length; j += 1) {
    //     if (linkArr[i].email === values.emails[j]) {
    //       message.error('聯繫人的郵箱不能和運營負責人的郵箱一樣');
    //       return;
    //     }
    //   }
    // }

    const concatsList = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < values.names.length; i++) {
      if (values.names[i] && values.emails[i]) {
        concatsList.push({
          name: values.names[i],
          email: values.emails[i],
        });
      }
    }

    this.setState({
      loading: true,
    });
    if (
      this.props.integralManageAccount.accountInfo &&
      this.props.integralManageAccount.accountInfo.id
    ) {
      const res = await updateBusinessAccount({
        union_id: this.props.integralManageAccount.accountInfo.id,
        warning_value: values.warningValue,
        contacts: concatsList,
      });
      if (res.data.status) {
        message.success('更新成功');
        this.props.history.push('/integral-manage/account/operation');
      }
    } else {
      const res = await addBusinessAccount({
        account_name: values.accountName.trim(),
        department: partmentInfo.part2,
        warning_value: values.warningValue,
        contacts: concatsList,
      });
      if (res.data.status) {
        message.success('新增成功');
        this.props.history.push('/integral-manage/account/operation');
      }
    }
    this.setState({
      loading: false,
    });
  }

  onChangeAction(value) {
    console.log('onChangeAction:' + value);
    this.setState({
      partmentInfo: {
        part1: '',
        part2: value,
      },
    });
  }

  checkSkip = (nextLocation) => {
    if (nextLocation) {
      // 從新增跳轉詳情
      if (this.state.publishAction) {
        return true;
      }
      const editPage = /^\/operationDetail\/\d/.test(nextLocation.pathname);
      return editPage;
    }
    return false;
  };

  remove = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter((key) => key !== k),
    });
  };

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // eslint-disable-next-line no-plusplus
    const nextKeys = keys.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  checkPrice = (rule, value, callback) => {
    if (!value) {
      callback('請選擇部門');
    }
    callback();
  };

  render() {
    const { accountInfo, linkArr } = this.props.integralManageAccount;
    const { pointsListInfo } = this.props.integralManageAccount;
    const accountId = accountInfo.id;
    const contacts = accountInfo.contact || [];
    const title = `${accountId ? '編輯' : '創建'}運營賬戶`;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    let initialValue = [0];
    if (contacts.length > 0) {
      initialValue = [];
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < contacts.length; i++) {
        initialValue.push(i);
      }
    }

    getFieldDecorator('keys', { initialValue });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      let tips = '';
      let tipsType = '';
      if (this.state.help[`names[${k}]`]) {
        tips = this.state.help[`names[${k}]`];
        tipsType = 'error';
      }
      if (this.state.help[`emails[${k}]`]) {
        tips = this.state.help[`emails[${k}]`];
        tipsType = 'error';
      }
      return (
        <FormItem
          required={false}
          key={index}
          {...tailFormItemLayout}
          help={tips}
          validateStatus={tipsType}
        >
          {getFieldDecorator(`names[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            initialValue: contacts.length > k ? contacts[k].name : '',
            rules: [
              {
                required: true,
                whitespace: true,
                message: '请輸入姓名',
              },
            ],
          })(
            <Input
              maxLength={32}
              placeholder="请輸入姓名"
              style={{ width: '160px', marginRight: 8 }}
              disabled={
                this.state.operationDetailTypeIsLook ||
                accountInfo.account_type === 1
              }
            />
          )}
          {getFieldDecorator(`emails[${k}]`, {
            validateTrigger: ['onChange', 'onBlur'],
            initialValue: contacts.length > k ? contacts[k].email : '',
            rules: [
              {
                type: 'email',
                message: '請輸入正確的郵箱',
              },
              {
                required: true,
                message: '請輸入郵箱',
              },
            ],
          })(
            <Input
              maxLength={64}
              placeholder="请輸入郵箱"
              style={{ width: '240px', marginRight: 8 }}
              disabled={
                this.state.operationDetailTypeIsLook ||
                accountInfo.account_type === 1
              }
            />
          )}
          {keys.length > 1 && !this.state.operationDetailTypeIsLook ? (
            <Icon
              className="dynamic-delete-button"
              type="minus-circle-o"
              onClick={() => this.remove(k)}
            />
          ) : null}
        </FormItem>
      );
    });

    return (
      <div className="m-createaccont-wrap p-integralmanage-account-wrap">
        {/* <PromptLeave
          when={'111' !== 'look'}
          extraCheck={this.checkSkip}
          message="確認離開當前的頁面嗎？內容將不予保存"
        /> */}
        <Form
          onSubmit={this.handleSubmit}
          className="createaccont-form"
          {...formItemLayout}
        >
          {accountId ? (
            <Card title="賬戶基本信息" bordered={false}>
              <Row>
                <Col span={5} className="input-box">
                  <div className="name">賬戶ID</div>
                  <div className="val">{accountInfo.union_id}</div>
                </Col>
                <Col span={5} className="input-box">
                  <div className="name">帳戶名稱</div>
                  <div className="val">{accountInfo.account_name}</div>
                </Col>
                <Col span={8} className="input-box">
                  <div className="name">所屬部門</div>
                  <div className="val">{accountInfo.department_info.name}</div>
                </Col>
                <Col span={3} className="input-box" align="right">
                  <div className="name">帳戶種類</div>
                  <div className="val">
                    {accountInfo.account_type === 0 ? '主帳戶' : '子帳戶'}
                  </div>
                </Col>
                <Col span={3} className="input-box" align="right">
                  <div className="name">狀態</div>
                  <div
                    className={[
                      'val',
                      'u-status',
                      status2Json[0].className,
                    ].join(' ')}
                  >
                    正常
                  </div>
                </Col>
                <Col span={5}>
                  <div className="name">
                    創建時間：
                    <span className="val">
                      {moment
                        .unix(accountInfo.created_at)
                        .format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                </Col>
                <Col span={5}>
                  <div className="name">
                    啟用時間：
                    <span className="val">
                      {moment
                        .unix(accountInfo.updated_at)
                        .format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card>
          ) : null}
          {accountId ? (
            <Card
              title="帳戶餘額信息"
              bordered={false}
              style={{ marginTop: 30 }}
            >
              <Row>
                <Col span={5} className="input-box">
                  <div className="name">帳戶餘額</div>
                  <div className="val">{accountInfo.balance_amount}</div>
                </Col>
                <Col span={5} className="input-box">
                  <div className="name">發分子帳戶</div>
                  <div className="val">
                    {accountInfo.extra &&
                      accountInfo.extra.offer_sub_account_balance_amount}
                  </div>
                </Col>
                <Col span={5} className="input-box">
                  <div className="name">收分子帳戶</div>
                  <div className="val">
                    {accountInfo.extra &&
                      accountInfo.extra.income_sub_account_balance_amount}
                  </div>
                </Col>
              </Row>
            </Card>
          ) : null}
          {accountId ? (
            <Card
              title="連繫帳戶列表"
              bordered={false}
              style={{ marginTop: 30 }}
            >
              <Table
                rowKey="id"
                columns={this.columns}
                dataSource={accountInfo.account_list}
                pagination={false}
              />
            </Card>
          ) : null}
          {accountId && pointsListInfo.list.length > 0 ? (
            <Card
              title="退出/轉入積分紀錄"
              bordered={false}
              style={{ marginTop: 30 }}
            >
              <Table
                rowKey="id"
                columns={this.pointsColumns}
                dataSource={pointsListInfo.list}
                pagination={false}
              />
            </Card>
          ) : null}

          {accountId ? null : (
            <Card
              title="賬戶基本信息"
              bordered={false}
              style={{ marginTop: 30 }}
            >
              <FormItem label="賬戶名稱">
                {getFieldDecorator('accountName', {
                  initialValue: accountInfo.account_name || '',
                  rules: [{ required: true, message: '請輸入賬戶名稱' }],
                })(
                  <Input
                    maxLength={20}
                    className="inputItem"
                    disabled={
                      this.state.operationDetailTypeIsLook ||
                      this.state.operationDetailTypeIsEditPart ||
                      accountInfo.account_type === 1
                    }
                  />
                )}
              </FormItem>

              {this.state.operationDetailTypeIsCreate ||
              this.state.isGetDefaultDepart ? (
                // <BelongDepartment
                //   defaultValue={this.state.partmentInfo}
                //   onChange={this.onChangeAction.bind(this)}
                //   style={{ width: 408 }}
                //   disabled={
                //     this.state.operationDetailTypeIsLook ||
                //     this.state.operationDetailTypeIsEditPart
                //   }
                // />
                <FormItem label="所屬部門">
                  {getFieldDecorator('department', {
                    initialValue: this.state.partmentInfo.part2,
                    rules: [{ validator: this.checkPrice }],
                  })(
                    <PartmentTreeSelect
                      onChange={this.onChangeAction.bind(this)}
                      partmentList={this.props.system.partmentList}
                      style={{ width: 408 }}
                      disabled={
                        this.state.operationDetailTypeIsLook ||
                        this.state.operationDetailTypeIsEditPart ||
                        accountInfo.account_type === 1
                      }
                    />
                  )}
                </FormItem>
              ) : null}
            </Card>
          )}

          <Card title={title} bordered={false} style={{ marginTop: 30 }}>
            <FormItem label="餘額不足預警值">
              {getFieldDecorator('warningValue', {
                initialValue: accountInfo.warning_value || '',
                rules: [
                  {
                    pattern: /^\d*$/g,
                    message: '請輸入純數字ID',
                  },
                  { required: true, message: '請輸入餘額不足預警值' },
                ],
              })(
                <Input
                  maxLength={12}
                  className="inputItem"
                  disabled={this.state.operationDetailTypeIsLook}
                />
              )}
            </FormItem>
            <FormItem label="聯繫人">
              <div className="linkList">
                <div className="link-name">姓名</div>
                <div className="email">郵箱</div>
              </div>
            </FormItem>
            {formItems}
            {keys.length >= 10 ||
            this.state.operationDetailTypeIsLook ||
            accountInfo.account_type === 1 ? null : (
              <FormItem {...tailFormItemLayout}>
                <Button
                  type="dashed"
                  onClick={this.add}
                  style={{ width: '408px', marginRight: 8 }}
                >
                  <Icon type="plus" /> 添加聯繫人
                </Button>
              </FormItem>
            )}

            <FormItem {...tailFormItemLayout}>
              <div>
                當賬戶餘額不足及有積分追加請求時將郵件通知聯繫人，同時抄送以下運營負責人：
              </div>
            </FormItem>
            {linkArr.map((item, index) => {
              return (
                <FormItem key={index} {...tailFormItemLayout}>
                  <div className="linkName">
                    {item.name}&nbsp;&nbsp;&nbsp;&nbsp;{item.email}
                  </div>
                </FormItem>
              );
            })}
            <FormItem {...tailFormItemLayout}>
              <CancelBtnCom />
              {this.state.operationDetailTypeIsLook ? null : (
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginLeft: 8 }}
                  disabled={this.state.loading}
                  loading={this.state.loading}
                >
                  提交
                </Button>
              )}
            </FormItem>
          </Card>
        </Form>
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralManageAccount, system, auth }) => ({
    integralManageAccount: integralManageAccount.toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(Form.create()(OperationDetail))
);
