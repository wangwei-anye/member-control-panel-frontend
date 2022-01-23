import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Modal, Form, Icon, Input } from 'antd';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
  },
};

@connect(({ system, taskCenter }) => {
  return {
    taskCenter: taskCenter.toJS()
  };
})
@Form.create({ name: 'sheet_password_check' })
export default class ResultDueModal extends React.Component {
  state = {
    confirmLoading: false,
    downloadFromPreive: false
  }
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    type: PropTypes.oneOf(['preview', 'download']),
    fileName: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onDuePassword: PropTypes.func.isRequired
  }
  static defaultProps = {
    type: 'preview',
    fileName: '加載中...'
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === false) {
      if (this.state.confirmLoading) {
        this.setState({
          confirmLoading: false
        });
      }
      if (this.props.visible === true) {
        this.props.form.resetFields();
      }
    }
  }
  handleClose = () => {
    this.props.onClose();
  }
  handleAction = async () => {
    await this.setState({
      confirmLoading: true
    });
    this.props.form.validateFields((err, values) => {
      if (err) {
        this.setState({
          confirmLoading: false
        });
        return;
      }
      try {
        this.props.onDuePassword(values.password);
      } catch (error) {
      }
    });
    this.setState({
      confirmLoading: false
    });
  }
  render() {
    const { form: { getFieldDecorator }, fileName } = this.props;
    return (
      <Modal
        confirmLoading={this.state.confirmLoading}
        title={this.props.type === 'preview' ? '預覽結果處理' : '下載結果處理'}
        visible={this.props.visible}
        onCancel={this.handleClose}
        onOk={this.handleAction}
        okText={this.props.type === 'preview' ? '預覽' : '下載'}
        cancelText="關閉"
      >
        <Form>
          <Form.Item
            {...formItemLayout}
            label="處理結果："
          >
            <div><Icon type="link" />{fileName}</div>
          </Form.Item>
          <Form.Item
            {...formItemLayout}
            label="提取密碼"
            help="該任務的處理結果設置有下載密碼，請輸入后下載"
          >
            {getFieldDecorator('password', {
              rules: [{
                required: true,
                message: '請輸入提取密碼',
              }],
            })(
              <Input type="text" placeholder="請輸入提取密碼" />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
