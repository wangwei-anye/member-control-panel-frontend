/* eslint-disable */
import React from 'react';
import { Modal, Input, Form, Select, Checkbox } from 'antd';
import PartmentTreeSelect from 'components/PartmentTreeSelect';

const FormItem = Form.Item;
const Option = Select.Option;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const tailFormItemLayout = {
  wrapperCol: {
    sm: {
      span: 18,
      offset: 6,
    },
  },
};

class DepartmentEdit extends React.Component {
  constructor() {
    super();
  }

  onOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return; //检查Form表单填写的数据是否满足rules的要求
      this.props.onOk(values); //调用父组件给的onOk方法并传入Form的参数。
    });
  };
  onCancel = () => {
    this.props.form.resetFields(); //重置Form表单的内容
    this.props.onCancel(); //调用父组件给的方法
  };

  formtaData = (list, id) => {
    if (Array.isArray(list)) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].child) {
          this.formtaData(list[i].child, id);
        }
        if (list[i].id === id) {
          list.splice(i, 1);
        }
      }
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { partmentList } = this.props;
    const copyPartmentList = JSON.parse(JSON.stringify(partmentList));
    const { detail } = this.props;
    //不顯示最近的部門
    this.formtaData(copyPartmentList, detail.id);

    return (
      <Modal
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        visible
        title="添加部门"
      >
        <Form>
          <FormItem label="部门名称" {...formItemLayout}>
            {getFieldDecorator('departmentName', {
              initialValue: detail.name,
              rules: [{ required: true, message: '請輸入部门名称' }],
            })(<Input placeholder="請輸入" />)}
          </FormItem>
          <FormItem label="所屬部門：" {...formItemLayout}>
            {getFieldDecorator('departmentId', {
              initialValue: detail.pid,
              rules: [{ required: true, message: '請選擇所屬部門' }],
            })(<PartmentTreeSelect partmentList={copyPartmentList} />)}
          </FormItem>
          <FormItem label="默認角色權限" {...formItemLayout}>
            {getFieldDecorator('permission', {
              initialValue:
                (detail.role_ids && detail.role_ids.split(',')) || [],
            })(
              <Select mode="multiple" showSearch placeholder="請選擇角色">
                {this.props.roles.map((it) => (
                  <Option key={it.id}>{it.name}</Option>
                ))}
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(DepartmentEdit);
