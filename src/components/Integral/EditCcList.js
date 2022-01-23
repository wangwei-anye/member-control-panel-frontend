import React from 'react';
import { Modal, Input, message, Form, Icon, Button } from 'antd';
import './EditCcList.less';
import {
  updateNoticeEmails
} from '../../services/integralManage/account/account';

let id = 0;

const CreateModalForm = Form.create({ name: 'form_in_modal' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { title, onCancel, onOk, onAdd, onRemove, form, isLoading, ccList } = this.props;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 4 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 20 },
        },
      };
      const { getFieldDecorator, getFieldValue } = form;

      getFieldDecorator('keys', { initialValue: [...ccList] });
      const keys = getFieldValue('keys');
      const formItems = keys.map((k, index) => (
        <div key={`itemRow${index}`} className="add-del-row">
          <Form.Item
            label=""
            required={false}
          >
            {getFieldDecorator(`names[${index}]`, {
                initialValue: k.name || '',
                validateTrigger: ['onBlur'],
                rules: [
                  {
                    required: true,
                    whitespace: true,
                    message: '请輸入姓名',
                  },
                ],
              })(<Input placeholder="请輸入姓名" style={{ width: 140, marginRight: 8 }} />)}
          </Form.Item>
          <Form.Item
            label=""
            required={false}
          >
            {getFieldDecorator(`emails[${index}]`, {
                initialValue: k.email || '',
                validateTrigger: ['onBlur'],
                rules: [
                  {
                    type: 'email',
                    whitespace: false,
                    message: '請輸入正確的郵箱',
                  },
                  {
                    required: true,
                    message: '請輸入郵箱',
                  },
                ],
              })(<Input placeholder="請輸入郵箱" style={{ width: 260, marginRight: 8 }} />)}
            {keys.length > 1 ? (
              <Icon
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => onRemove(index)}
              />
              ) : null}
          </Form.Item>
        </div>
      ));
      return (
        <Modal
          title={title}
          visible
          onOk={onOk}
          onCancel={onCancel}
          destroyOnClose
          okButtonProps={{
            disabled: isLoading,
            loading: isLoading
          }}
          cancelButtonProps={{ disabled: isLoading }}
          okText="保存"
        >
          <div className="m-createaccont-wrap">
            <Form>
              <Form.Item {...formItemLayout}>
                <div>
                  賬戶餘額不足時將郵件通知聯繫人，同時抄送以下運營負責人：
                </div>
              </Form.Item>
              {formItems}
              <Form.Item {...formItemLayout}>
                <Button type="dashed" onClick={onAdd} style={{ width: 408 }}>
                  <Icon type="plus" /> 添加抄送人
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      );
    }
  }
);

// eslint-disable-next-line
class EditCcList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentWillUnmount() {
    message.destroy();
    Modal.destroyAll();
    id = 0;
  }

  modalOkAction = () => {
    const { onOkCallback } = this.props;
    const { form, onCancel } = this.formRef.props;
    const setLoadingFalse = () => {
      this.setState({ isLoading: false });
    };
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ isLoading: true });

      Modal.confirm({
        maskClosable: true,
        className: 'modal-confirm',
        content: '一經修改後，將會對所有積分賬戶生效',
        async onOk() {
          const { keys, names, emails } = values;
          const newCcList = keys.map((key, idx) => {
            return { name: names[idx], email: emails[idx] };
          });

          const res = await updateNoticeEmails({ cc_emails: newCcList });
          if (res.data.status) {
            onOkCallback(newCcList);
            onCancel();
            message.success('結餘警示抄送名單修改成功');
          }
        },
        onCancel() {
          // form.resetFields();
          setLoadingFalse();
        }
      });
    });
  }

  remove = index => {
    const { form } = this.formRef.props;
    const { keys, names, emails } = form.getFieldsValue();

    // We need at least one passenger
    if (names.length === 1) {
      return;
    }

    names.splice(index, 1);
    emails.splice(index, 1);
    keys.splice(index, 1);

    // can use data-binding to set
    form.setFieldsValue({ keys, names, emails });
  };

  add = () => {
    const { form } = this.formRef.props;
    const keys = form.getFieldValue('keys');

    // eslint-disable-next-line
    const nextKeys = keys.concat(id++);

    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  };

  render() {
    const ccList = this.props.ccList || [];
    return (
      <CreateModalForm
        wrappedComponentRef={this.saveFormRef}
        title="編輯結餘警示抄送名單"
        ccList={ccList}
        onAdd={this.add.bind(this)}
        onRemove={this.remove.bind(this)}
        onOk={this.modalOkAction.bind(this)}
        onCancel={this.props.onCancel}
        isLoading={this.state.isLoading}
      />
    );
  }
}

export default EditCcList;
