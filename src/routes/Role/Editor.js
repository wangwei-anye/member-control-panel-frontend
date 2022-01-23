import React from 'react';
import { Form, Input, Row, Col, Tree } from 'antd';
import { connect } from 'dva';
import Modal from 'components/Modal';
import { formatFormData } from 'utils/tools';
import {
  createTreeNode,
  convertKeysToJson,
  generateKeys,
} from 'utils/permissionTree';

const FormItem = Form.Item;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 },
};

class Editor extends React.Component {
  state = {
    checkedKeys: [],
  };

  componentDidMount() {
    const { rights } = this.props.role;
    const { permissions } = this.props.role.detail;
    if (permissions) {
      const { keys } = generateKeys(rights, JSON.parse(permissions));
      this.setState({ checkedKeys: keys });
    } else {
      this.setState({ checkedKeys: [] });
    }
  }

  onCheck = (value) => {
    this.setState({
      checkedKeys: value,
    });
  };

  handleOk = (e) => {
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        // 如果表单验证不通过
        return;
      }
      const { detail } = this.props.role;
      const formData = formatFormData(values);
      if (detail.id) {
        // 编辑模式
        formData.id = detail.id;
      }
      formData.permissions = convertKeysToJson(this.state.checkedKeys);
      if (typeof this.props.onOk === 'function') {
        this.props.onOk(formData);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { detail, rights } = this.props.role;
    const { checks } = this.state;
    return (
      <Modal
        visible
        title={detail.id ? '編輯角色' : '創建角色'}
        onOk={this.handleOk}
        onCancel={this.props.onCancel}
        okText="提交"
        cancelText="取消"
      >
        <Form onSubmit={this.handleOk}>
          <Row>
            <Col>
              <FormItem label="序號" {...formItemLayout}>
                <div>{detail.id}</div>
              </FormItem>
              <FormItem label="角色名" {...formItemLayout}>
                {getFieldDecorator('name', {
                  initialValue: detail.name,
                  rules: [{ required: true, message: '請輸入角色名' }],
                })(<Input maxLength={40} placeholder="請輸入角色名" />)}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="權限模塊" {...formItemLayout}>
                <Tree
                  checkable
                  checkedKeys={this.state.checkedKeys}
                  onSelect={this.onSelect}
                  onCheck={this.onCheck}
                >
                  {createTreeNode(rights)}
                </Tree>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default connect(({ role }) => ({
  role: role.toJS(),
}))(Form.create()(Editor));
