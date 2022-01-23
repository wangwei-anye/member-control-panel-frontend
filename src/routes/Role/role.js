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
  message,
  Select,
  Divider,
} from 'antd';
import Table from 'components/Table';
import FoldableCard from 'components/FoldableCard';
import ResetBtn from 'components/ResetBtn';
import { formatFormData, dateFormat, isUserHasRights } from 'utils/tools';
import { createRole, updateRole } from 'services/role/role';
import { DEFAULT_PAGE_SIZE } from 'constants';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import LoadingCom from 'components/LoadingCom';
import Editor from './Editor';

const FormItem = Form.Item;
const Option = Select.Option;
// 表单项布局
const formItemLayout = {
  labelCol: {
    xs: 12,
    sm: 11,
    md: 10,
    lg: 9,
    xl: 8,
    xxl: 7,
  },
  wrapperCol: {
    xs: 12,
    sm: 13,
    md: 14,
    lg: 15,
    xl: 16,
    xxl: 17,
  },
};
const editRightList = ['system_management', 'role', 'update'];
class AppPage extends React.Component {
  state = {
    visible: false,
  };

  data_range = {
    company: '全公司',
    department: '所在部門',
    next_department: '所在部門及下級部門',
    self: '僅本人',
  };

  columns = [
    {
      title: '編號',
      dataIndex: 'id',
    },
    {
      title: '角色名稱',
      dataIndex: 'name',
      render: (text) => (
        <span
          style={{
            backgroundColor: '#eee',
            borderRadius: '20px',
            padding: 8,
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: '更新時間',
      dataIndex: 'updated_at',
    },
    {
      title: '編輯人',
      dataIndex: 'edit_name',
    },
    {
      title: '操作',
      width: 150,
      render: (text, record) => (
        <span>
          <AuthBtnCom authList={record.permission} currrentAuth="set_rights">
            <a
              href="javascript:void(0)"
              onClick={() => this.handleEdit(record)}
            >
              權限配置
            </a>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="role_users">
            <Divider type="vertical" />
            <a
              href="javascript:void(0)"
              onClick={() => this.handleEditAccoutList(record)}
            >
              編輯賬號
            </a>
          </AuthBtnCom>
        </span>
      ),
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
      query.page = 1; // 每次点击搜索都让page =1
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };
  handleCreate = () => {
    this.props.dispatch({
      type: 'role/save',
      payload: { detail: {} },
    });
    this.props.history.push('/role/add');
  };
  // 点击编辑
  handleEdit = (record) => {
    if (!record.id) {
      return;
    }
    this.props.history.push(`/role/edit?id=${record.id}`);
  };

  handleEditAccoutList = (record) => {
    if (!record.id) {
      return;
    }
    this.props.history.push(`/role/accountList?group_id=${record.id}`);
  };

  handleOk = async (values) => {
    let service = createRole;
    if (values.id) {
      // 编辑模式
      service = updateRole;
    }
    const {
      data: { status, message: msg },
    } = await service(values);
    if (status) {
      message.success('操作成功');
      this.setState({
        visible: false,
      });
      this.reloadList();
    } else {
      message.warn(msg || '操作失敗');
    }
  };
  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };
  // 刷新列表
  reloadList = () => {
    const { dispatch } = this.props;
    const { query } = this.props.system;
    dispatch({
      type: 'role/getRoles',
      payload: {
        ...query,
        page: query.page || 1,
        limit: query.pageSize || DEFAULT_PAGE_SIZE,
      },
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { list, total, loading } = this.props.role.roleListInfo;
    const { query } = this.props.system;
    if (
      !isUserHasRights(editRightList) &&
      this.columns.filter((item) => item.key === 'operation').length
    ) {
      this.columns.pop();
    }

    const permission = [
      {
        value: '',
        text: '全部',
      },
      {
        value: 'company',
        text: '全公司',
      },
      {
        value: 'department',
        text: '所在部門',
      },
      {
        value: 'next_department',
        text: '所在部門及下級部門',
      },
      {
        value: 'self',
        text: '僅本人',
      },
    ];
    const permissionRender = permission.map((item, index) => {
      return (
        <Option value={item.value} key={index}>
          {item.text}
        </Option>
      );
    });
    return (
      <div>
        <FoldableCard
          bodyStyle={{ paddingBottom: 0 }}
          title={<span>搜索條件</span>}
        >
          <Form labelAlign="right">
            <Row>
              <Col span={10}>
                <FormItem
                  label="角色名"
                  {...formItemLayout}
                  style={{ textAlign: 'left' }}
                  gutter={48}
                >
                  {getFieldDecorator('name', {
                    initialValue: query.name,
                  })(
                    <Input
                      onPressEnter={this.handleClickSearch}
                      maxLength={20}
                      placeholder="請輸入角色名"
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={20} style={{ textAlign: 'center', marginBottom: 20 }}>
                <Button
                  type="primary"
                  icon="search"
                  onClick={this.handleClickSearch}
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
          title="角色列表"
          style={{ marginTop: 24 }}
          bordered={false}
          extra={
            <AuthWrapCom authList={['system_management', 'role', 'add']}>
              <Button type="primary" icon="plus" onClick={this.handleCreate}>
                創建角色
              </Button>
            </AuthWrapCom>
          }
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <Table
              rowKey="id"
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          )}
        </Card>
        {this.state.visible ? (
          <Editor onOk={this.handleOk} onCancel={this.handleCancel} />
        ) : null}
      </div>
    );
  }
}

export default withRouter(
  connect(({ role, system }) => ({
    role: role.toJS(),
    system: system.toJS(),
  }))(Form.create()(AppPage))
);
