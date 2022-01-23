/* eslint-disable */
import React from 'react';
import { Form, Input, Row, Col } from 'antd';
import { connect } from 'dva';
import Modal from 'components/Modal';

const FormItem = Form.Item;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17, offset: 2 },
};

class ExportModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOk = (e) => {
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        // 如果表单验证不通过
        return;
      }
      this.props.createExportTask(values);
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Modal
          title="提交任務"
          visible
          onOk={this.handleOk}
          onCancel={this.props.handleCancel}
        >
          <Form>
            <Row>
              <Col>
                <FormItem label="任務名稱" {...formItemLayout}>
                  {getFieldDecorator('task_name', {
                    rules: [
                      { required: true, message: '任務名稱不能為空' },
                      { max: 30, message: '任務名稱限制為30個字符' },
                    ],
                  })(<Input placeholder="請輸入簡單的任務名稱" />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(ExportModal);
