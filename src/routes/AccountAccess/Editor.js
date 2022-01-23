/* eslint-disable */
import React from 'react';
import { Form, Input, Row, Col, Select, Avatar, message, Spin } from 'antd';
import { connect } from 'dva';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import Modal from 'components/Modal';
import { getImgRequest } from 'services/common/common';
import UploadHead from './components/UploadHead';
import { formatFormData } from 'utils/tools';
import './account.less';

const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17, offset: 2 },
};

const fileTypeList = ['image/png', 'image/jpg', 'image/jpeg'];
class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadHeadvisible: false,
      phoneValidateStatus: 'success',
      phoneHelp: '',
      departValidateStatus: 'success',
      departHelp: '',
      headUrl: {
        absolute_path: '',
        path: '',
      },
      blobHeadUrl: '',
      headLoading: false,
      isShowAvatarEdit: false,
    };
  }

  componentWillReceiveProps(nextprops) {
    if (nextprops.account.detail.id && !this.props.account.detail.id) {
      this.setState({
        headUrl: {
          absolute_path: nextprops.account.detail.avatar_url,
          path: nextprops.account.detail.avatar,
        },
      });
      this.handleImagePreview(nextprops.account.detail.avatar_url);
      // this.setState({
      //   blobHeadUrl: nextprops.account.detail.avatar_url,
      // });
    }
  }

  areaCodeChange = (e) => {
    this.setState({
      phoneValidateStatus: 'success',
      phoneHelp: '',
    });
  };
  phoneChange = (e) => {
    this.setState({
      phoneValidateStatus: 'success',
      phoneHelp: '',
    });
  };

  handleOk = (e) => {
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        // 如果表单验证不通过
        return;
      }

      const { detail } = this.props.account;
      const { headUrl } = this.state;
      const formData = formatFormData(values);

      formData.areaCode = formData.areaCode ? formData.areaCode : '';
      formData.phone = formData.phone ? formData.phone : '';
      formData.areaCode = formData.areaCode.trim();
      formData.phone = formData.phone.trim();
      let phoneVerify = false;
      if (!formData.areaCode && !formData.phone) {
        phoneVerify = true;
      }
      if (formData.areaCode === '86' && this.isPhoneAvailable(formData.phone)) {
        phoneVerify = true;
      }
      if (
        formData.areaCode === '852' &&
        this.isHKphoneAvailable(formData.phone)
      ) {
        phoneVerify = true;
      }
      if (phoneVerify) {
        this.setState({
          phoneValidateStatus: 'success',
          phoneHelp: '',
        });
      } else {
        this.setState({
          phoneValidateStatus: 'error',
          phoneHelp: '請輸入有效的手機號碼',
        });
        return;
      }

      if (formData.areaCode && formData.phone) {
        formData.telephone = formData.areaCode + ' ' + formData.phone;
      } else {
        formData.telephone = '';
      }
      delete formData.areaCode;
      delete formData.phone;

      if (
        !values.department ||
        values.department === 'all' ||
        values.department === ''
      ) {
        this.setState({
          departValidateStatus: 'error',
          departHelp: '請選擇所屬部門',
        });
        return;
      }

      if (detail.id) {
        // 编辑模式
        formData.id = detail.id;
        formData.status = detail.status;
      } else {
        formData.status = 1;
      }
      formData.avatar = headUrl.path;
      formData.avatar_url = headUrl.absolute_path;
      if (typeof this.props.onOk === 'function') {
        this.props.onOk(formData);
      }
    });
  };

  isPhoneAvailable = (phone) => {
    var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (!myreg.test(phone)) {
      return false;
    } else {
      return true;
    }
  };

  isHKphoneAvailable = (phone) => {
    var myreg = /^[0-9]{8}$/;
    if (!myreg.test(phone)) {
      return false;
    } else {
      return true;
    }
  };

  onSuccessUploadHead = (headUrl) => {
    this.setState({
      headUrl: headUrl,
      uploadHeadvisible: false,
    });
    if (headUrl.absolute_path) {
      this.handleImagePreview(headUrl.absolute_path);
      // this.setState({
      //   blobHeadUrl: headUrl.absolute_path,
      // });
    }
  };

  handleImagePreview = async (fileUrl) => {
    if (!fileUrl) {
      return;
    }
    let templateUrl = fileUrl;
    try {
      this.setState({
        headLoading: true,
      });
      templateUrl = await getImgRequest(templateUrl);
      templateUrl = URL.createObjectURL(templateUrl);
      this.setState({
        blobHeadUrl: templateUrl,
        headLoading: false,
      });
    } catch (err) {
      this.setState({
        headLoading: false,
      });
      console.log(err);
    }
  };
  loadHeadError = () => {
    this.setState({
      blobHeadUrl: '',
    });
  };

  onCancelUploadHead = () => {
    this.setState({
      uploadHeadvisible: false,
    });
  };
  onShowUploadHead = () => {
    this.setState({
      uploadHeadvisible: true,
    });
  };

  resetHead = () => {
    this.setState({
      headUrl: {
        absolute_path: '',
        path: '',
      },
      blobHeadUrl: '',
    });
  };
  changePart = () => {
    this.setState({
      departValidateStatus: 'success',
      departHelp: '',
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    let { detail } = this.props.account;
    const { type } = this.props;

    const { uploadHeadvisible, blobHeadUrl } = this.state;
    const {
      phoneValidateStatus,
      phoneHelp,
      departValidateStatus,
      departHelp,
      headLoading,
    } = this.state;

    const prefixSelector = getFieldDecorator('areaCode', {
      initialValue: detail.areaCode,
    })(
      <Input
        style={{ width: 80 }}
        maxLength={10}
        placeholder="區號"
        onChange={this.areaCodeChange}
      />
    );

    let headName = '';
    if (detail.username) {
      headName =
        detail.username.length > 4
          ? detail.username.substr(0, 4)
          : detail.username;
    }
    if (detail.group_ids && detail.group_ids !== undefined) {
      detail.group_ids = detail.group_ids.filter((item) => {
        const tempArr = this.props.account.roles.filter((subItem) => {
          return parseInt(subItem.id) === parseInt(item);
        });
        if (tempArr.length > 0) {
          return true;
        }
        return false;
      });
    }
    return (
      <div>
        {uploadHeadvisible ? (
          <UploadHead
            jwt={this.props.auth.jwt}
            blobHeadUrl={blobHeadUrl}
            onSuccess={this.onSuccessUploadHead}
            onCancel={this.onCancelUploadHead}
          ></UploadHead>
        ) : null}
        <Modal
          visible
          width={800}
          title={type === 'edit' ? '賬號管理' : '新增賬號'}
          onOk={this.handleOk}
          onCancel={this.props.onCancel}
          okText="確定"
          cancelText="取消"
        >
          <Form onSubmit={this.handleOk} className="account-editor">
            <Row>
              <Col span={5}>
                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 20,
                    position: 'relative',
                  }}
                >
                  <Spin
                    spinning={headLoading}
                    style={{
                      position: 'absolute',
                      width: 100,
                      height: 100,
                      zIndex: 100,
                      top: 40,
                      left: '50%',
                      marginLeft: '-50px',
                    }}
                  />
                  {blobHeadUrl ? (
                    <img
                      style={{ width: 100, height: 100 }}
                      src={blobHeadUrl}
                      alt="avatar"
                      onError={this.loadHeadError}
                    />
                  ) : (
                    // <Avatar
                    //   size={100}
                    //   icon="user"
                    //   style={{ margin: '0 auto' }}
                    // />

                    <div
                      style={{
                        backgroundColor: '#ccc',
                        borderRadius: '50%',
                        color: '#fff',
                        width: 100,
                        height: 100,
                        fontSize: 20,
                        lineHeight: '100px',
                        margin: '0 auto',
                      }}
                    >
                      {headName}
                    </div>
                  )}
                  <div
                    style={{
                      color: '#1890ff',
                      marginTop: '10px',
                      cursor: 'pointer',
                    }}
                    onClick={this.onShowUploadHead}
                  >
                    點擊上傳頭像
                  </div>
                  <div
                    style={{
                      color: '#1890ff',
                      marginTop: '10px',
                      cursor: 'pointer',
                    }}
                    onClick={this.resetHead}
                  >
                    恢復默認頭像
                  </div>
                </div>
              </Col>
              <Col span={18}>
                {detail.id ? (
                  <Col span={24}>
                    <FormItem label="用戶ID" {...formItemLayout}>
                      <div>{detail.id}</div>
                    </FormItem>
                  </Col>
                ) : null}
                <Col span={24}>
                  <FormItem label="姓名" {...formItemLayout}>
                    {getFieldDecorator('username', {
                      initialValue: detail.username,
                      rules: [{ required: true, message: '請輸入姓名' }],
                    })(<Input maxLength={40} placeholder="請輸入姓名" />)}
                  </FormItem>
                </Col>
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
                  <FormItem
                    label="手機號碼"
                    {...formItemLayout}
                    validateStatus={phoneValidateStatus}
                    help={phoneHelp}
                  >
                    {getFieldDecorator('phone', {
                      initialValue: detail.phone,
                      rules: [{ message: '請輸入手機號碼' }],
                    })(
                      <Input
                        addonBefore={prefixSelector}
                        placeholder="請輸入手機號碼"
                        onChange={this.phoneChange}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem
                    className="insert-red-star"
                    label="所屬部門："
                    {...formItemLayout}
                    validateStatus={departValidateStatus}
                    help={departHelp}
                  >
                    {getFieldDecorator('department', {
                      initialValue: detail.department,
                      rules: [],
                    })(
                      <PartmentTreeSelect
                        onChange={this.changePart}
                        partmentList={this.props.system.partmentList}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={24}>
                  <FormItem label="所屬角色" {...formItemLayout}>
                    {getFieldDecorator('group_ids', {
                      initialValue: detail.group_ids,
                    })(
                      <Select
                        mode="multiple"
                        showSearch
                        placeholder="請選擇角色"
                      >
                        {this.props.account.roles.map((it) => (
                          <Option key={it.id}>{it.name}</Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default connect(({ account, system, auth }) => ({
  auth: auth.toJS(),
  account: account.toJS(),
  system: system.toJS(),
}))(Form.create()(Editor));
