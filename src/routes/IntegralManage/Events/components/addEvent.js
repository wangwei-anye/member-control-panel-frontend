import React from 'react';
import { Modal, Form, Select, Input, Checkbox } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const CheckboxGroup = Checkbox.Group;
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18, offset: 1 }
};
const style = {
  width: '224px'
};
class CreateEventCom extends React.Component {
  modalOkAction() {
    const { eventInfo } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      if (eventInfo && Object.keys(eventInfo).length) {
        values.id = eventInfo.id;
      }
      if (this.props.onOk) {
        this.props.onOk({
          ...values,
          report_channel_id: values.report_channel_id.join(',')
        });
      }
    });
  }
  modalCancelAction() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }
  render() {
    const { eventInfo, reportChannelList } = this.props;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const customReportChannelList = reportChannelList
      .filter(item => item.id)
      .map(item => {
        return {
          label: item.channel_name,
          value: item.id
        };
      });
    return (
      <Modal
        width="650px"
        title={this.props.isAdd ? '定義新事件' : '編輯事件'}
        visible
        onOk={() => this.modalOkAction()}
        onCancel={() => this.modalCancelAction()}
        okButtonProps={{
          disabled: this.props.isLoading,
          loading: this.props.isLoading
        }}
        cancelButtonProps={{ disabled: this.props.isLoading }}
        destroyOnClose
        okText="提交"
      >
        <Form className="m-addevent-form-wrap">
          {eventInfo.id ? (
            <FormItem {...formItemLayout} label="事件ID">
              <span>{eventInfo.id}</span>
            </FormItem>
          ) : null}
          <FormItem {...formItemLayout} label="渠道號">
            {getFieldDecorator('report_channel_id', {
              valuePropName: 'checked',
              initialValue: (eventInfo && eventInfo.report_channel_id) || '',
              rules: [{ required: true, message: '請選擇一個渠道號' }]
            })(
              <CheckboxGroup
                options={customReportChannelList}
                value={[...getFieldValue('report_channel_id')]}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="事件描述">
            {getFieldDecorator('event_desc', {
              initialValue: (eventInfo && eventInfo.event_desc) || '',
              rules: [{ required: true, message: '請輸入事件描述' }]
            })(
              <Input
                placeholder="請輸入簡要的事件描述"
                style={{ width: '360px' }}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="事件Key值 (代碼名)">
            {getFieldDecorator('event_key', {
              initialValue: (eventInfo && eventInfo.event_key) || '',
              rules: [{ required: true, message: '請填寫事件Key值（代碼名）' }]
            })(
              <TextArea
                style={{ width: '360px', resize: 'none' }}
                rows={4}
                disabled={!this.props.isAdd}
                readOnly={!this.props.isAdd}
                placeholder="請輸入事件Key值（代碼名）"
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(CreateEventCom);
