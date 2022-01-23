import React from 'react';
import { Form, Input, Row, Col, Select, Button, message, Card } from 'antd';
import { connect } from 'dva';
import { formatFormData } from 'utils/tools';

const FormItem = Form.Item;
const { Option } = Select;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 17 },
};

const fileTypeList = ['image/png', 'image/jpg', 'image/jpeg'];
class CreateAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
  }
  nameChange = (e) => {
    this.setState({ name: e.target.value });
  };
  handleOk = () => {
    const { dispatch, history } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        // 如果表单验证不通过
        return;
      }
      const { detail } = this.props.account;
      const formData = formatFormData(values);
      if (this.state.name) {
        formData.name = this.state.name;
      }
      if (detail.id) {
        // 编辑模式
        formData.id = detail.id;
      }
      dispatch({
        type: 'account/addAccount',
        payload: { ...formData, group_ids: values.group_ids.join(',') },
        history,
        message,
      });
    });
  };
  // 选择文件
  handleFileChange = (e) => {
    const self = this;
    const file = this.fileDOM.files[0];
    const fileType = file.type;
    const fileSize = file.size;
    const maxSize = 10 * 1024 * 1024;
    if (fileTypeList.indexOf(fileType) < 0) {
      message.error('僅支持 png、jpg、jpeg格式的圖片');
      return;
    }
    if (maxSize < fileSize) {
      message.error('圖片大小不能超過10M');
      return;
    }
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function (event) {
      const { result } = event.target;
      self.setState({
        imgFile: result,
        isShowAvatarEdit: true,
      });
    };
  };

  cancle = () => {
    this.props.history.push('/account');
  };
  filterOptionAction(inputVulue, option) {
    const title = option.props.children;
    return title.includes(inputVulue);
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { detail } = this.props.account;

    return (
      <div>
        <Card title="帳號" bordered={false}>
          <Form onSubmit={this.handleOk}>
            <Row justify="center">
              <Col span={12} offset={4}>
                <Col span={24}>
                  <FormItem label="登入郵箱" {...formItemLayout}>
                    {getFieldDecorator('email', {
                      initialValue: detail.email,
                      rules: [
                        { type: 'email', message: '請輸入正確的郵箱' },
                        { required: true, message: '請輸入郵箱' },
                      ],
                    })(<Input maxLength={40} placeholder="請輸入郵箱" />)}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="名字" {...formItemLayout}>
                    {getFieldDecorator('username', {
                      initialValue: detail.username,
                      rules: [{ required: true, message: '請輸入名字' }],
                    })(<Input maxLength={40} placeholder="請輸入名字" />)}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="姓氏" {...formItemLayout}>
                    {getFieldDecorator('name', {
                      initialValue: detail.username,
                      rules: [{ required: true, message: '請輸入姓氏' }],
                    })(<Input maxLength={40} placeholder="請輸入姓氏" />)}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="角色" {...formItemLayout}>
                    {getFieldDecorator('group_ids', {
                      initialValue: detail.group_ids,
                      rules: [{ required: true, message: '請選擇角色' }],
                    })(
                      <Select
                        mode="multiple"
                        showSearch
                        placeholder="請選擇角色"
                        filterOption={(inputVulue, option) =>
                          this.filterOptionAction(inputVulue, option)
                        }
                      >
                        {this.props.account.roles.map((it) => (
                          <Option key={it.id}>{it.name}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                {/*
              <Col span={24}>
                <FormItem label="手機號碼" {...formItemLayout}>
                  {getFieldDecorator('phone', {
                    initialValue: detail.phone,
                    rules: [{ required: true, message: '請輸入手機號碼' }]
                  })(
                    <InputGroup compact>
                      <Select defaultValue="mainland">
                        <Option value="mainland">+86</Option>
                      </Select>
                      <Input
                        style={{ width: '70%' }}
                        placeholder="請輸入手機號碼"
                      />
                    </InputGroup>
                  )}
                </FormItem>
              </Col>
                */}
                <Col span={24}>
                  <FormItem label="帳號狀態" {...formItemLayout}>
                    {getFieldDecorator('status', {
                      initialValue: detail.status || 1,
                    })(
                      <Select>
                        <Option value={0}>禁用</Option>
                        <Option value={1}>啟用</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Col>
            </Row>
          </Form>
        </Card>
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

export default connect(({ account }) => ({
  account: account.toJS(),
}))(Form.create()(CreateAccount));
