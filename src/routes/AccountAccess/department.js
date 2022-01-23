import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Card, Button, message, Input, Divider, Select } from 'antd';
import Table from 'components/Table';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import { formatFormData, dateFormat } from 'utils/tools';
import Modal from 'components/Modal';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import { DEFAULT_PAGE_SIZE } from 'constants';
import LoadingCom from 'components/LoadingCom';
import { moveDepartment, addDepartment } from 'services/role/account';
import { fetchDepartmentList } from 'services/common/common';

import SubDepartmentAdd from './components/subDepartmentAdd';
import DepartmentAdd from './components/departmentAdd';
import DepartmentEdit from './components/departmentEdit';
import DepartmentMove from './components/departmentMove';

const Option = Select.Option;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};
class DepartmentPage extends React.Component {
  state = {
    addSubModalVisible: false,
    addModalVisible: false,
    editModalVisible: false,
    moveModalVisible: false,
    addSubDepartmentId: '',
    editDetail: {},
  };

  columns = [
    {
      title: '部門',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '部門默認角色權限',
      render: (text, record) => {
        const arr = record.roles.map((item, index) => {
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
              {item.name || '--'}
            </span>
          );
        });
        return <div style={{ marginBottom: -3 }}>{arr}</div>;
      },
    },
    {
      title: '操作',
      width: 220,
      render: (text, record) => {
        const title = record.status === 1 ? '凍結' : '啟用';
        return (
          <span className="m-operation-wrap">
            <AuthBtnCom authList={record.permission} currrentAuth="save">
              <span
                className="u-operation-item u-color-blue"
                onClick={() => this.handleEdit(record)}
              >
                編輯
              </span>
            </AuthBtnCom>
            <AuthBtnCom authList={record.permission} currrentAuth="add_child">
              <span
                className="u-operation-item u-color-blue"
                onClick={() => this.handleSubAdd(record)}
              >
                添加子部門
              </span>
            </AuthBtnCom>
            <AuthBtnCom authList={record.permission} currrentAuth="move">
              <span
                className="u-operation-item u-color-blue"
                onClick={() => this.handleMove(record)}
              >
                移動
              </span>
            </AuthBtnCom>
          </span>
        );
      },
    },
  ];

  // 刷新列表
  reloadList = async () => {
    const { dispatch } = this.props;
    const { query } = this.props.system;
    dispatch({
      type: 'account/getDepartment',
      payload: {
        ...query,
        page: query.page || 1,
        limit: query.pageSize || DEFAULT_PAGE_SIZE,
      },
    });

    const { data } = await fetchDepartmentList();
    if (data.status) {
      this.props.dispatch({
        type: 'system/save',
        payload: {
          partmentList: data.data.list,
        },
      });
    }
  };

  handleSubAdd = (record) => {
    this.setState({
      addSubModalVisible: true,
      addSubDepartmentId: record.id,
    });
  };

  handleAdd = () => {
    this.setState({
      addModalVisible: true,
    });
  };
  handleEdit = (record) => {
    this.setState({
      editDetail: record,
      editModalVisible: true,
    });
  };

  handleAddSave = () => {
    const form = this.addForm;
    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        return;
      }
      const formData = {
        name: values.departmentName,
        pid: values.departmentId,
        role_ids: '',
        id: '',
      };
      const {
        data: { status, message: msg },
      } = await addDepartment(formData);
      if (status) {
        message.success('操作成功');
        this.setState({
          addModalVisible: false,
        });
        this.reloadList();
      }
      // 这里处理表单  values
    });
  };

  handleAddSubSave = () => {
    const form = this.addSubForm;
    const { addSubDepartmentId } = this.state;
    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        return;
      }
      const formData = {
        name: values.departmentName,
        pid: addSubDepartmentId,
        role_ids: '',
        id: '',
      };
      const {
        data: { status, message: msg },
      } = await addDepartment(formData);
      if (status) {
        message.success('操作成功');
        this.setState({
          addSubModalVisible: false,
        });
        this.reloadList();
      }
      // 这里处理表单  values
    });
  };

  handleEditSave = () => {
    const form = this.editForm;
    const { editDetail } = this.state;
    form.validateFields(async (err, values) => {
      if (err) {
        console.log(err);
        return;
      }
      const formData = {
        name: values.departmentName,
        pid: values.departmentId,
        role_ids: values.permission.join(','),
        id: editDetail.id,
      };
      const {
        data: { status, message: msg },
      } = await addDepartment(formData);
      if (status) {
        message.success('操作成功');
        this.setState({
          editModalVisible: false,
        });
        this.reloadList();
      }
      // 这里处理表单  values
    });
  };

  handleMove = (record) => {
    this.setState({
      moveModalVisible: true,
    });
  };
  moveDepartment = async (moveId) => {
    const {
      data: { status, message: msg },
    } = await moveDepartment({ ids: moveId });
    if (status) {
      message.success('操作成功');
      // this.setState({
      //   moveModalVisible: false,
      // });
      // this.reloadList();
    }
  };

  handleMoveSave = () => {
    this.setState({
      moveModalVisible: false,
    });
    this.reloadList();
  };

  handleMoveCancel = () => {
    this.setState({
      moveModalVisible: false,
    });
    this.reloadList();
  };

  saveAddFormRef = (form) => {
    this.addForm = form;
  };

  saveSubAddFormRef = (form) => {
    this.addSubForm = form;
  };

  saveEditFormRef = (form) => {
    this.editForm = form;
  };

  formtaData = (list) => {
    if (Array.isArray(list)) {
      list.map((item, index) => {
        if (item.children && item.children.length === 0) {
          delete item.children;
        } else if (item.children && item.children.length > 0) {
          this.formtaData(item.children);
        }
        return item;
      });
    }
  };

  render() {
    const {
      addSubModalVisible,
      addModalVisible,
      editModalVisible,
      moveModalVisible,
      editDetail,
    } = this.state;
    const { departmentListInfo } = this.props.account;
    const { list, total, loading } = departmentListInfo;
    this.formtaData(list);
    return (
      <div className="p-account-wrap">
        <Card
          bordered={false}
          title="部門列表"
          style={{ marginTop: 24 }}
          extra={
            <div>
              <AuthWrapCom
                authList={['system_management', 'department', 'save']}
              >
                <Button
                  type="primary"
                  style={{ margin: 20 }}
                  onClick={this.handleAdd}
                >
                  添加部門
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
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          )}
        </Card>

        {addSubModalVisible ? (
          <SubDepartmentAdd
            ref={this.saveSubAddFormRef}
            onCancel={() => this.setState({ addSubModalVisible: false })}
            onOk={this.handleAddSubSave}
          />
        ) : null}
        {addModalVisible ? (
          <DepartmentAdd
            ref={this.saveAddFormRef}
            onCancel={() => this.setState({ addModalVisible: false })}
            onOk={this.handleAddSave}
            partmentList={this.props.system.partmentList}
          />
        ) : null}
        {editModalVisible ? (
          <DepartmentEdit
            ref={this.saveEditFormRef}
            onCancel={() => this.setState({ editModalVisible: false })}
            onOk={this.handleEditSave}
            detail={editDetail}
            partmentList={this.props.system.partmentList}
            roles={this.props.account.roles}
          />
        ) : null}

        {moveModalVisible ? (
          <DepartmentMove
            visible={moveModalVisible}
            list={list}
            onMove={this.moveDepartment}
            onCancel={this.handleMoveCancel}
            onOk={this.handleMoveSave}
          />
        ) : null}
      </div>
    );
  }
}

export default withRouter(
  connect(({ account, system }) => ({
    account: account.toJS(),
    system: system.toJS(),
  }))(DepartmentPage)
);
