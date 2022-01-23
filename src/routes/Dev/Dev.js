import React from 'react';
import { Card, Icon, Button, Form, Input, Row, Col, Tag, message } from 'antd';
import { connect } from 'dva';
import { genSignature, copyString } from 'utils/tools';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};
class DevPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureUrl: '',
    };
  }
  componentDidMount() {
    if (!this.props.auth.email) {
      this.props.history.replace('/login');
    }
  }
  handleSubmit = () => {
    const { auth } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const currentS = values.form_req_at || Math.ceil(Date.now() / 1000);
      values.req_at = currentS;
      delete values.form_req_at;
      const signature = genSignature(values, auth.email);
      const url = `?app_id=${values.app_id}&out_sn=${values.out_sn}&req_at=${currentS}&signature=${signature}`;
      this.setState({
        signatureUrl: url,
      });
    });
  };
  copyStr = () => {
    // copyString(this.state.signatureUrl);
    // message.success('copy成功！');
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div
        style={{
          height: '100%',
          backgroundColor: '#f0f4f7',
          padding: '24px',
        }}
      >
        <Card
          bordered={false}
          title={
            <span>
              <Icon type="smile-o" />
              开发测试专用
            </span>
          }
        >
          <div>
            <Form>
              <FormItem {...formItemLayout} label="app_id">
                {getFieldDecorator('app_id', {
                  rules: [
                    {
                      required: true,
                      message: '请填写 app_id',
                      pattern: /^[0-9a-zA-Z]+/,
                    },
                  ],
                })(<Input placeholder="app_id" style={{ width: 400 }} />)}
              </FormItem>
              <FormItem {...formItemLayout} label="out_sn">
                {getFieldDecorator('out_sn', {
                  rules: [
                    {
                      required: true,
                      message: '请填写out_sn',
                      pattern: /^[0-9a-zA-Z]+/,
                    },
                  ],
                })(<Input placeholder="out_sn" style={{ width: 400 }} />)}
              </FormItem>
              <FormItem {...formItemLayout} label="req_at">
                {getFieldDecorator('form_req_at', {
                  rules: [
                    {
                      message: '请填写req_at',
                      pattern: /^[0-9]+$/,
                    },
                  ],
                })(
                  <Input
                    placeholder="req_at（可不填寫，默認當前時間戳）"
                    style={{ width: 400 }}
                  />
                )}
              </FormItem>
              <FormItem>
                <Button type="primary" onClick={this.handleSubmit}>
                  生成signature
                </Button>
              </FormItem>
            </Form>
            {this.state.signatureUrl ? (
              <div>
                <div>
                  生成的url的search为：
                  <Tag color="blue" onClick={this.copyStr}>
                    {this.state.signatureUrl}
                  </Tag>
                </div>
                <p style={{ paddingTop: '10px' }}>
                  相关文档和参数说明：
                  <a
                    href="http://swagger-doc.dd01.fun/doc/#/api/hk01/dataSystem.json"
                    target="_black"
                  >
                    http://swagger-doc.dd01.fun/doc/#/api/hk01/dataSystem.json
                  </a>
                </p>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    );
  }
}
export default connect(({ auth }) => {
  return {
    auth: auth.toJS(),
  };
})(Form.create()(DevPage));
