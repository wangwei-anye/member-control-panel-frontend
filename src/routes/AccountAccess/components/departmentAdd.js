/* eslint-disable */
import React from 'react';
import { Modal, Input, Form } from 'antd';
import PartmentTreeSelect from 'components/PartmentTreeSelect';

const FormItem = Form.Item;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};
class DepartmentAdd extends React.Component {
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

  render() {
    const { getFieldDecorator } = this.props.form;
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
              rules: [{ required: true, message: '請輸入部门名称' }],
            })(<Input placeholder="請輸入" />)}
          </FormItem>
          <FormItem label="所屬部門：" {...formItemLayout}>
            {getFieldDecorator('departmentId', {
              rules: [{ required: true, message: '請選擇所屬部門' }],
            })(<PartmentTreeSelect partmentList={this.props.partmentList} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(DepartmentAdd);
