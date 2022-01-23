import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import qs from 'qs';
import { Card, Row, Col, Form, Select, Modal, Table, message } from 'antd';
import { DEFAULT_PAGE_SIZE } from 'constants';
import { formatFormData } from 'utils/tools';
import { addAccount } from 'services/role/role';
import FoldableCard from 'components/FoldableCard';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import LoadingCom from 'components/LoadingCom';

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
    selectedRowKeys: [],
    department: '',
    currentPage: 1,
    currentPageSize: DEFAULT_PAGE_SIZE,
  };

  componentDidMount() {
    this.search({
      page: 1,
      limit: this.state.currentPageSize,
    });
  }

  columns = [
    {
      title: '姓名',
      dataIndex: 'username',
    },
    {
      title: '登入帳號',
      dataIndex: 'email',
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
  ];
  onSelectChange = async (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  handleOk = async (e) => {
    if (this.state.selectedRowKeys.length === 0) {
      message.success('請至少選擇一個賬戶');
      return;
    }
    const { system } = this.props;
    const { data } = await addAccount({
      user_ids: this.state.selectedRowKeys.join(','),
      group_id: system.query.group_id,
      skip_unique: 0,
    });
    if (data.status) {
      if (data.code === 10243) {
        // 有已選取的帳戶已擁有此角色，請查看
        const self = this;
        confirm({
          icon: 'info-circle',
          title: '有已選取的帳戶已擁有此角色，請查看',
          okText: '繼績提交',
          cancelText: '返回',
          onOk() {
            return new Promise(async (resolve) => {
              const { data: newData } = await addAccount({
                user_ids: self.state.selectedRowKeys.join(','),
                group_id: system.query.group_id,
                skip_unique: 1,
              });
              resolve();
              if (newData.status) {
                message.success('添加成功');
                self.setState({ selectedRowKeys: [] });
                self.props.onOk();
              }
            });
          },
        });
      } else {
        message.success('添加成功');
        this.setState({ selectedRowKeys: [] });
        this.props.onOk();
      }
    }
  };
  onCancel = (e) => {};
  changePartment = (e) => {
    this.setState({
      department: e,
      currentPage: 1,
    });
    this.search({
      department: e,
      page: 1,
      limit: this.state.currentPageSize,
    });
  };
  search = (param) => {
    const { dispatch } = this.props;
    if (param.department === '') {
      delete param.department;
    }
    dispatch({
      type: 'role/getAccountSelect',
      payload: {
        ...param,
      },
    });
  };
  changePage = (e) => {
    this.setState({
      currentPage: e,
    });
    this.search({
      department: this.state.department,
      page: e,
      limit: this.state.currentPageSize,
    });
  };
  onShowSizeChange = (current, pageSize) => {
    this.setState({
      currentPage: 1,
      currentPageSize: pageSize,
    });
    this.search({
      department: this.state.department,
      page: 1,
      limit: pageSize,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { accountSelectListInfo } = this.props.role;
    const { list, total, loading } = accountSelectListInfo;
    const { query } = this.props.system;
    const { selectedRowKeys, currentPage, currentPageSize } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <div>
        <Modal
          visible
          width={1000}
          title="添加帳戶至角色"
          onOk={this.handleOk}
          onCancel={this.props.onCancel}
          okText="確定"
          cancelText="取消"
        >
          <Form>
            <Row type="flex" align="middle">
              <Col span={9} className="input-box">
                <FormItem label="所屬部門" {...formItemLayout}>
                  {getFieldDecorator('department', {
                    initialValue: '',
                  })(
                    <PartmentTreeSelect
                      onChange={this.changePartment}
                      partmentList={this.props.system.partmentList}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>

          <Card title="帳號列表" style={{ marginTop: 24 }} bordered={false}>
            {loading ? (
              <LoadingCom />
            ) : (
              <Table
                rowKey="id"
                rowSelection={rowSelection}
                columns={this.columns}
                dataSource={list}
                pagination={{
                  showTotal: (num) =>
                    `共 ${parseInt(num, 10).toLocaleString()} 條記錄`,
                  current: currentPage,
                  showSizeChanger: true,
                  onShowSizeChange: this.onShowSizeChange,
                  pageSize: currentPageSize,
                  showQuickJumper: true,
                  pageSizeOptions: ['10', '20', '30', '40', '50'],
                  total,
                  onChange: this.changePage,
                }}
              />
            )}
          </Card>
        </Modal>
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
