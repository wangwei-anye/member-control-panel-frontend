/* eslint-disable */
import React from 'react';
import { Modal, Input, Form, message } from 'antd';
import { INPUT_NUMBER_MAX } from 'constants';
import InputToolTipCom from 'components/Integral/InputToolTipCom';

const FormItem = Form.Item;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

class AddPoint extends React.Component {
  constructor() {
    super();
    this.state = {
      point: 0,
    };
  }

  onOk = () => {
    if (!this.state.point || this.state.point === 0) {
      message.error('請輸入所需積分額');
      return;
    }
    this.props.onSuccess({
      p_union_id: this.props.data.parent_union_id,
      c_union_id: this.props.data.union_id,
      amount: this.state.point,
    });
  };
  changePoint = (value) => {
    this.setState({
      point: value,
    });
  };

  gotoAccountDetail = (id, union_id) => {
    if (union_id) {
      window.open(
        `${window.location.origin}/integral-manage/account/operation?union_id=${union_id}`,
        '_blank'
      );
    }
  };

  render() {
    return (
      <Modal
        onOk={this.onOk}
        onCancel={this.props.onCancel}
        visible
        title="積分追加"
      >
        <Form>
          <FormItem label="請求子帳戶" {...formItemLayout}>
            <Input placeholder="請輸入" disabled value={this.props.data.name} />
          </FormItem>
          <FormItem label="連繫主帳戶" {...formItemLayout}>
            <Input
              placeholder="請輸入"
              disabled
              value={this.props.data.parent_name}
            />
            <span
              style={{
                color: '#1890ff',
                cursor: 'pointer',
                marginTop: '6px',
              }}
              onClick={() => {
                this.gotoAccountDetail(
                  this.props.data.parent_id,
                  this.props.data.parent_union_id
                );
              }}
            >
              查看積分餘額
            </span>
          </FormItem>
          <FormItem label="所需積分額" {...formItemLayout}>
            <InputToolTipCom
              onChange={this.changePoint}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/(,*)/g, '')}
              max={INPUT_NUMBER_MAX}
              min={1}
              step={1}
              style={{ width: '100%' }}
            />
            <div
              style={{
                color: 'rgba(0, 0, 0, 0.45)',
                lineHeight: '1.75',
              }}
            >
              * 以上積分追加操作會在提交時立刻生效，同時通知所有連繫主帳戶連繫人
            </div>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
export default Form.create()(AddPoint);
