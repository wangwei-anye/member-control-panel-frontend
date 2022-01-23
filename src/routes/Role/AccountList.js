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
  Modal,
} from 'antd';
import Table from 'components/Table';
import FoldableCard from 'components/FoldableCard';
import ResetBtn from 'components/ResetBtn';
import { formatFormData, dateFormat } from 'utils/tools';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import { removeAccount } from 'services/role/role';
import { DEFAULT_PAGE_SIZE } from 'constants';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import LoadingCom from 'components/LoadingCom';
import Editor from './AccountSelect';

const FormItem = Form.Item;
const confirm = Modal.confirm;
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
class AppPage extends React.Component {
  state = {
    visible: false,
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
    // {
    //   title: '配置角色時間',
    //   dataIndex: 'updated_at',
    //   render: (text) => dateFormat(text * 1000),
    // },
    {
      title: '最近操作時間',
      dataIndex: 'updated_at',
    },
    {
      title: '操作',
      width: 150,
      render: (text, record) => (
        <span>
          <a href="javascript:void(0)" onClick={() => this.handleMove(record)}>
            移除
          </a>
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
      const group_id = system.query.group_id;
      if (group_id) {
        query.group_id = group_id;
      }
      const pageSize = system.query.pageSize;
      if (pageSize) {
        query.pageSize = pageSize;
      }
      query.page = 1; // 每次点击搜索都让page =1
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };
  handleMove = (record) => {
    const { system } = this.props;
    const self = this;
    confirm({
      icon: 'info-circle',
      title: '移除角色',
      content: '確定要移除該帳號嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await removeAccount({
            user_ids: record.id,
            group_id: system.query.group_id,
          });
          resolve();
          if (data.status) {
            message.success('移除成功');
            self.reloadList();
          } else {
          }
        });
      },
    });
  };

  handleAaddAccount = () => {
    this.setState({
      visible: true,
    });
  };
  // 点击编辑

  handleOk = async () => {
    this.setState({
      visible: false,
    });
    this.reloadList();
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
    if (query.group_id) {
      dispatch({
        type: 'role/getAccount',
        payload: {
          ...query,
          page: query.page || 1,
          limit: query.pageSize || DEFAULT_PAGE_SIZE,
        },
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { accountListInfo } = this.props.role;
    const { list, total, loading } = accountListInfo;
    const { query } = this.props.system;

    return (
      <div>
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
              <Col span={24}>
                <FormItem style={{ textAlign: 'center' }}>
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
          title="帳號列表"
          style={{ marginTop: 24 }}
          bordered={false}
          extra={
            <AuthWrapCom authList={['system_management', 'role', 'add']}>
              <Button
                type="primary"
                icon="plus"
                onClick={this.handleAaddAccount}
              >
                添加賬戶至角色
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
