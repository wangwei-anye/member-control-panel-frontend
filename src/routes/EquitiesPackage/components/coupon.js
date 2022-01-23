/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { Form, Input, Row, Col, Icon, message } from 'antd';
import Modal from 'components/Modal';
import SpeImg from 'routes/ActivityConfig/components/speimg';
import '../index.less';

const FormItem = Form.Item;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 }
};

class Coupon extends React.Component {
  state = {};

  componentDidMount() {}

  handleOk = e => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!values.coupon_icon_image_url[0]) {
          message.error('請上傳優惠券ICON');
          return;
        }
        this.props.save(values);
        this.props.onCancel();
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { data, isDisabledEdit } = this.props;
    console.log(data);
    return (
      <Modal
        visible
        title="配置优惠券"
        onOk={this.handleOk}
        onCancel={this.props.onCancel}
        okText="保存"
        cancelText="取消"
        width={700}
        height={433}
      >
        <Form onSubmit={this.handleOk}>
          <Row>
            <Col>
              <FormItem label="優惠券名稱" {...formItemLayout}>
                {getFieldDecorator('coupon_name', {
                  initialValue: data.coupon_name,
                  rules: [{ required: true, message: '請輸入' }]
                })(
                  <Input
                    disabled={isDisabledEdit}
                    maxLength={9}
                    placeholder="請輸入"
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="優惠券SKU ID" {...formItemLayout}>
                {getFieldDecorator('coupon_sku_id', {
                  initialValue: data.coupon_sku_id,
                  rules: [
                    { required: true, message: '請輸入優惠券SKU ID' },
                    {
                      pattern: /^\d*$/,
                      message: '請輸入純數字'
                    },
                    {
                      pattern: /^[1-9]\d*$/,
                      message: '首位不可為0'
                    }
                  ]
                })(
                  <Input
                    disabled={isDisabledEdit}
                    maxLength={10}
                    placeholder="請輸入優惠券SKU ID"
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="使用規則描述" {...formItemLayout}>
                {getFieldDecorator('rule_description', {
                  initialValue: data.rule_description,
                  rules: [{ required: true, message: '請輸入' }]
                })(
                  <Input
                    disabled={isDisabledEdit}
                    maxLength={20}
                    placeholder="請輸入"
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem label="使用日期說明" {...formItemLayout}>
                {getFieldDecorator('date_of_use_description', {
                  initialValue: data.date_of_use_description,
                  rules: [{ required: true, message: '請輸入時間/文字說明' }]
                })(
                  <Input
                    disabled={isDisabledEdit}
                    maxLength={28}
                    placeholder="請輸入時間/文字說明"
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                label="上傳優惠券ICON"
                {...formItemLayout}
                className="insert-red-star"
              >
                {getFieldDecorator('coupon_icon_image_url', {
                  initialValue: data.coupon_icon_image_url || [null, null],
                  rules: [
                    {
                      type: 'array',
                      required: true,
                      message: '請上傳優惠券ICON'
                    }
                  ]
                })(
                  <SpeImg
                    disabled={isDisabledEdit}
                    minHeight={500}
                    maxHeight={500}
                    minWidth={500}
                    maxWidth={500}
                    id="answerImg1"
                  />
                )}
                <span style={{ color: 'rgb(24, 144, 255)' }}>
                  僅支持500px*500px的jpg、png、jpeg格式圖片
                </span>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default withRouter(
  connect(({ system }) => ({
    system: system.toJS()
  }))(Form.create()(Coupon))
);
