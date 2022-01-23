import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import qs from 'qs';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Tooltip,
  Popconfirm,
  Divider,
  message,
  Select,
} from 'antd';
import Table from 'components/Table';
import FoldableCard from 'components/FoldableCard';
import { formatFormData, dateFormat } from 'utils/tools';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import Modal from 'components/Modal';
import ResetBtn from 'components/ResetBtn';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import { DEFAULT_PAGE_SIZE } from 'constants';
import {
  editAccount,
  createAccount,
  updateAccountStatus,
  updateUserPartment,
} from 'services/role/account';
import { convertJsonToKeys } from 'utils/permissionTree';
import LoadingCom from 'components/LoadingCom';
import Editor from './Editor';

const FormItem = Form.Item;
const Option = Select.Option;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};
class AppPage extends React.Component {
  state = {
    modalVisible: false,
    editPartVisible: false,
    modalType: 'create',
    checkedKeys: [],
    roleValidateStatus: '',
    roleHelp: '',
    selectedRowKeys: [],
    selectPartmentId: '',
  };
  columns = [
    {
      title: '編號',
      dataIndex: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'username',
    },
    {
      title: '登入帳號',
      dataIndex: 'email',
    },
    {
      title: '所屬部門',
      dataIndex: 'department_name',
    },
    {
      title: '角色',
      render: (text, record) => {
        const groupArr = record.group_names.split(',');
        let arr = groupArr.map((item, index) => {
          return (
            <span
              key={index}
              style={{
                backgroundColor: '#eee',
                borderRadius: '20px',
                padding: 8,
                marginBottom: 3,
                marginLeft: 3,
                display: 'inline-block',
              }}
            >
              {item || '--'}
            </span>
          );
        });
        if (groupArr.length === 1 && groupArr[0] === '') {
          arr = null;
        }
        return <div style={{ marginBottom: -3 }}>{arr}</div>;
      },
    },
    {
      title: '最近操作時間',
      dataIndex: 'updated_at',
      render: (text) => dateFormat(text * 1000),
    },
    {
      title: '帳號狀態',
      dataIndex: 'status',
      render: (text) => {
        return (
          <span>
            <span
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: 10,
                margin: '0 10px 0 0',
                background: +text === 1 ? '#52c41a' : '#ce2613',
              }}
            />
            <span>{+text === 1 ? '啟用' : '凍結'}</span>
          </span>
        );
      },
    },
    {
      title: '操作',
      width: 120,
      render: (text, record) => {
        const title = record.status === 1 ? '凍結' : '啟用';
        return (
          <span>
            <AuthBtnCom authList={record.permission} currrentAuth="set">
              <a
                href="javascript:void(0)"
                onClick={() => this.handleEdit(record)}
              >
                管理
              </a>
            </AuthBtnCom>
            <AuthBtnCom
              authList={record.permission}
              currrentAuth="update_status"
            >
              <Divider type="vertical" />
              <Popconfirm
                title={`確定要${title}該帳號嗎？`}
                onConfirm={() => this.handleUpdateStatus(record)}
              >
                <a href="javascript:void(0)" style={{ color: '#f00' }}>
                  {title}
                </a>
              </Popconfirm>
            </AuthBtnCom>
          </span>
        );
      },
    },
  ];

  // 点击搜索
  handleClickSearch = () => {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        // 如果表单验证不通过
        return;
      }
      const query = formatFormData(values);
      const pageSize = system.query.pageSize;
      if (pageSize) {
        query.pageSize = pageSize;
      }
      if (query.department === 'all') {
        delete query.department;
      }
      query.page = 1; // 每次点击搜索都让page =1
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  // 点击编辑賬號
  handleEdit = (record) => {
    this.props.dispatch({
      type: 'account/getAccountDetail',
      payload: {
        id: record.id,
      },
    });
    this.setState({
      modalType: 'edit',
      modalVisible: true,
    });
  };

  // 修改用户状态  凍結？
  handleUpdateStatus = async (record) => {
    const formData = { id: record.id, status: record.status === 1 ? 0 : 1 };
    const {
      data: { status, message: msg },
    } = await updateAccountStatus(formData);
    if (status) {
      message.success('操作成功');
      this.reloadList();
    } else {
      message.warn(msg || '操作失敗');
    }
  };

  // 点击新建
  handleCreate = () => {
    this.props.dispatch({
      type: 'account/save',
      payload: {
        detail: {},
      },
    });
    // this.props.history.push('/account/add');
    this.setState({
      modalType: 'create',
      modalVisible: true,
    });
  };

  // 調整部門
  handleChangePart = () => {
    if (this.state.selectedRowKeys.length === 0) {
      message.success('請選擇用戶進行操作');
      return;
    }
    this.setState({
      editPartVisible: true,
      selectPartmentId: '',
    });
  };

  // 保存新用户
  handleCreateSubmit = async (values) => {
    const formData = {
      ...values,
      group_ids: values.group_ids ? values.group_ids.join(',') : '',
    };
    let result = {};
    if (values.id) {
      result = await editAccount(formData);
    } else {
      result = await createAccount(formData);
    }
    const {
      data: { data, status },
    } = result;
    if (status) {
      message.success('操作成功');
      this.setState({
        modalVisible: false,
      });
      this.reloadList();
    }
  };

  // 刷新列表
  reloadList = () => {
    const { dispatch } = this.props;
    const { query } = this.props.system;
    dispatch({
      type: 'account/getAccount',
      payload: {
        ...query,
        page: query.page || 1,
        limit: query.pageSize || DEFAULT_PAGE_SIZE,
      },
    });
  };

  onSelectChange = async (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  changePartment = (e) => {
    this.setState({
      selectPartmentId: e,
    });
  };

  savePartHandle = async (values) => {
    const { selectedRowKeys, selectPartmentId } = this.state;
    if (selectPartmentId === '' || selectPartmentId === 'all') {
      message.success('請選擇一個部門');
      return;
    }
    const formData = {
      admin_user_ids: selectedRowKeys.join(','),
      deparmtment_id: selectPartmentId,
    };
    const {
      data: { status, message: msg },
    } = await updateUserPartment(formData);
    if (status) {
      message.success('操作成功');
      this.setState({
        selectedRowKeys: [],
        editPartVisible: false,
      });
      this.reloadList();
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      modalType,
      editPartVisible,
      modalVisible,
      selectedRowKeys,
      selectPartmentId,
    } = this.state;
    const { accountListInfo, detail, roles } = this.props.account;
    const { list, total, loading } = accountListInfo;
    const { query } = this.props.system;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className="p-account-wrap">
        <FoldableCard
          bodyStyle={{ paddingBottom: 0 }}
          title={<span>搜索條件</span>}
        >
          <Form>
            <Row type="flex" align="middle">
              <Col span={9}>
                <FormItem label="姓名" {...formItemLayout}>
                  {getFieldDecorator('username', {
                    initialValue: query.username,
                  })(
                    <Input
                      placeholder="請輸入"
                      onPressEnter={this.handleClickSearch}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem label="登入帳號" {...formItemLayout}>
                  {getFieldDecorator('email', {
                    initialValue: query.email,
                  })(
                    <Input
                      placeholder="請輸入"
                      onPressEnter={this.handleClickSearch}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={9} className="input-box">
                <FormItem label="所屬部門" {...formItemLayout}>
                  {getFieldDecorator('department', {
                    initialValue: query.department || '',
                  })(
                    <PartmentTreeSelect
                      partmentList={this.props.system.partmentList}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={9} className="input-box">
                <FormItem label="賬號狀態" {...formItemLayout}>
                  {getFieldDecorator('status', {
                    initialValue: query.status || '',
                  })(
                    <Select
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                    >
                      <Option value="">全部</Option>
                      <Option value="0">封禁</Option>
                      <Option value="1">正常</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon="search"
                    onClick={this.handleClickSearch}
                    style={{ marginRight: 20 }}
                  >
                    搜索
                  </Button>
                  <ResetBtn form={this.props.form} />
                </FormItem>
              </Col>
            </Row>
          </Form>
        </FoldableCard>

        <Card
          bordered={false}
          title="帳號列表"
          style={{ marginTop: 24 }}
          extra={
            <div>
              <AuthWrapCom
                authList={['system_management', 'account', 'change_department']}
              >
                <Button style={{ margin: 20 }} onClick={this.handleChangePart}>
                  調整部門
                </Button>
              </AuthWrapCom>
              <AuthWrapCom
                authList={['system_management', 'account', 'user_add']}
              >
                <Button type="primary" onClick={this.handleCreate}>
                  創建帳號
                </Button>
              </AuthWrapCom>
            </div>
          }
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <Table
              rowKey="id"
              rowSelection={rowSelection}
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          )}
        </Card>
        {modalVisible ? (
          <Editor
            type={modalType}
            onOk={this.handleCreateSubmit}
            onCancel={() => this.setState({ modalVisible: false })}
          />
        ) : null}
        {editPartVisible ? (
          <Modal
            visible
            width={500}
            title="調整所屬部門"
            onOk={this.savePartHandle}
            onCancel={() => this.setState({ editPartVisible: false })}
            okText="確定"
            cancelText="取消"
          >
            <PartmentTreeSelect
              style={{ width: 450 }}
              value={selectPartmentId}
              onChange={this.changePartment}
              partmentList={this.props.system.partmentList}
            />
          </Modal>
        ) : null}
      </div>
    );
  }
}

export default withRouter(
  connect(({ account, system }) => ({
    account: account.toJS(),
    system: system.toJS(),
  }))(Form.create('account_search')(AppPage))
);
