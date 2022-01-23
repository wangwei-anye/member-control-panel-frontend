import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { formatFormData } from 'utils/tools';
import _xor from 'lodash/xor';
import _keys from 'lodash/keys';
import LoadingCom from 'components/LoadingCom';
import {
  Row,
  Col,
  Form,
  Input,
  Tree,
  Card,
  Button,
  message,
  Radio,
} from 'antd';
import {
  createTreeNode,
  convertKeysToJson,
  generateKeys,
} from 'utils/permissionTree';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const dataRangeJson = ['company', 'department', 'next_department', 'self'];
class CreateRole extends React.Component {
  constructor() {
    super();
    this.state = {
      checkedKeys: [],
      dataRangeKeys: {},
      // permissionValue: 'department',
    };
  }

  componentWillMount() {
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateStateByProps(nextProps);
  }

  updateStateByProps(newProps) {
    const { rights } = newProps.role;
    const { permissions, data_range } = newProps.role.detail;
    const old_data_range = this.props.role.detail.data_range;
    const old_permissions = this.props.role.detail.permissions;
    if (!old_permissions && permissions) {
      const dataRangeKeys = {};
      const { keys } = generateKeys(
        rights,
        JSON.parse(permissions),
        '',
        dataRangeKeys
      );
      this.setState({ checkedKeys: keys, dataRangeKeys });
    }

    // if (!old_data_range && data_range) {
    //   this.setState({ permissionValue: data_range });
    // }
  }

  // onChange = (e) => {
  //   this.setState({
  //     permissionValue: e.target.value,
  //   });
  // };

  treeRadioChange = (e, name) => {
    const dataRangeKeys = this.state.dataRangeKeys;
    dataRangeKeys[name] = e.target.value;
    this.setState({
      dataRangeKeys,
    });
  };

  onCheck = (value) => {
    this.setState({
      checkedKeys: value,
    });
  };

  handleOk = () => {
    const { dispatch, history } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        // 如果表单验证不通过
        return;
      }
      const { detail } = this.props.role;
      const formData = formatFormData(values);
      // formData.data_range = this.state.permissionValue;
      // if (formData.data_range === '' || !formData.data_range) {
      //   message.error('請選擇數據管理範圍');
      //   return;
      // }
      if (detail.id) {
        // 编辑模式
        formData.id = detail.id;
      }
      formData.permissions = convertKeysToJson(
        [...this.state.checkedKeys].sort(),
        this.state.dataRangeKeys
      );
      dispatch({
        type: 'role/addRole',
        payload: formData,
        history,
        message,
      });
    });
  };

  cancle = () => {
    this.props.history.go(-1);
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { detail, rights } = this.props.role;
    const { dataRangeKeys } = this.state;

    const { location } = this.props;
    const pathname = location.pathname;

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <div>
        {!detail.id && pathname === '/role/edit' ? (
          <LoadingCom />
        ) : (
          <React.Fragment>
            <Card title="角色" bordered={false}>
              <Form onSubmit={this.handleOk}>
                <Row>
                  {detail.id ? (
                    <Col>
                      <FormItem label="序號" {...formItemLayout}>
                        <div>{detail.id}</div>
                      </FormItem>
                    </Col>
                  ) : null}
                  <Col>
                    <FormItem label="角色名" {...formItemLayout}>
                      {getFieldDecorator('name', {
                        initialValue: detail.name,
                        rules: [{ required: true, message: '請輸入角色名' }],
                      })(<Input maxLength={20} placeholder="請輸入角色名" />)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Card>
            {/* <Card
              title="數據管理範圍"
              bordered={false}
              style={{ marginTop: 30 }}
            >
              <Row>
                <Col>
                  <Radio.Group onChange={this.onChange} value={permissionValue}>
                    <Radio style={radioStyle} value="company">
                      全公司
                    </Radio>
                    <Radio style={radioStyle} value="department">
                      所在部門
                    </Radio>
                    <Radio style={radioStyle} value="next_department">
                      所在部門及下級部門
                    </Radio>
                    <Radio style={radioStyle} value="self">
                      僅本人
                    </Radio>
                  </Radio.Group>
                </Col>
              </Row>
            </Card> */}
            <Card title="功能權限" bordered={false} style={{ marginTop: 30 }}>
              <Row>
                <Col>
                  <FormItem label="權限模塊" {...formItemLayout}>
                    {Object.keys(rights).length > 0 ? (
                      <Tree
                        checkable
                        checkedKeys={this.state.checkedKeys}
                        onCheck={this.onCheck}
                        defaultExpandAll
                      >
                        {createTreeNode(
                          rights,
                          '',
                          this.treeRadioChange,
                          dataRangeKeys
                        )}
                      </Tree>
                    ) : null}
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </React.Fragment>
        )}
        <div
          style={{
            display: 'flex',
            textAlign: 'right',
            justifyContent: 'flex-end',
            alignItems: 'center',
            height: '50px',
            background: '#fff',
            position: 'fixed',
            left: '0',
            bottom: '0',
            width: '100%',
          }}
        >
          <Button
            type="default"
            style={{ marginRight: '24px' }}
            onClick={this.cancle}
          >
            取消
          </Button>
          <Button
            type="primary"
            style={{ marginRight: '24px' }}
            onClick={this.handleOk}
          >
            保存
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(({ role, system }) => ({
    role: role.toJS(),
    system: system.toJS(),
  }))(Form.create()(CreateRole))
);
