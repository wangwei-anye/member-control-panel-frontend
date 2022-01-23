/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Form,
  Input,
  Row,
  Col,
  Icon,
  InputNumber,
  Select,
  message,
  Spin,
} from 'antd';
import Modal from 'components/Modal';
import Upload from 'components/Upload';
import { getImgRequest } from 'services/common/common';
import PreviewComponent from 'components/PreviewComponent';
import BelongDepartment from 'components/Integral/BelongDepartmentCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import IntegralValidTime from 'components/Integral/IntegralValidTime';
import { fetchAccountByDepartment } from 'services/integralManage/approve/approve';
import SpeImg from 'routes/ActivityConfig/components/speimg';
import '../index.less';

const FormItem = Form.Item;
const Option = Select.Option;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 15 },
};

class Points extends React.Component {
  state = {
    partmentInfo: {},
    accountList: [], // 账户list
    offer_account: '', // 积分发放账户id
    offer_account_union_id: '', // 积分发放账户union_id
    offer_points_valid_date: {
      // 积分有效期
      type: '',
      period: '',
    },
    isDataLoading: true,
    listType: 'picture-card',
    fileList: [],
    previewVisible: false,
    previewFileType: 1,
    previewUrl: '',
    approval_annex: '',
    approval_annex_show: '',
    fileName: '',
    loading: false,
  };

  async componentDidMount() {
    if (this.props.data.offer_account) {
      this.setState({
        offer_account: this.props.data.offer_account,
      });
    }
    if (this.props.data.offer_account_union_id) {
      this.setState({
        offer_account_union_id: this.props.data.offer_account_union_id,
      });
    }
    if (this.props.data.offer_points_valid_date) {
      this.setState({
        offer_points_valid_date: this.props.data.offer_points_valid_date,
      });
    }
    this.setState({
      partmentInfo: {
        part1: '',
        part2: this.props.auth.department,
      },
    });
    if (this.props.data.initiate_department) {
      this.setState({
        partmentInfo: {
          part1: this.props.data.department_pid,
          part2: this.props.data.initiate_department,
        },
      });
    }

    if (this.props.data.approval_annex_show) {
      this.setState({
        loading: true,
      });
      let fileUrl = '';
      let fileName = '';
      fileUrl = this.props.data.approval_annex_show;
      fileName = this.props.data.fileName;
      const ext = this.getFileExt(fileUrl);
      const fileList = [
        {
          uid: '1',
          name: fileName,
          status: 'done',
          url: fileUrl,
          thumbUrl: ext === 'pdf' ? '' : fileUrl,
          type: ext === 'pdf' ? 'application/pdf' : '',
        },
      ];

      this.setState({
        approval_annex: this.props.data.approval_annex,
        approval_annex_show: this.props.data.approval_annex_show,
        fileName: this.props.data.fileName,
        fileList,
        previewUrl: fileUrl,
        listType: ext === 'pdf' ? 'picture' : 'picture-card',
        previewFileType: ext === 'pdf' ? 2 : 1,
      });
      if (!fileUrl) {
        return;
      }
      if (ext !== 'pdf') {
        await this.handleImagePreview(fileUrl, fileName);
      } else {
        this.modifyUploadComponentStyle();
        this.setState({
          loading: false,
        });
      }
    }
  }

  handleImagePreview = async (fileUrl, fileName) => {
    let templateUrl = fileUrl;
    try {
      templateUrl = await getImgRequest(templateUrl);
      templateUrl = URL.createObjectURL(templateUrl);
      this.templateUrl = templateUrl;
    } catch (err) {
      console.log(err);
    }
    const fileList = [
      {
        uid: '1',
        name: fileName,
        status: 'done',
        url: templateUrl,
      },
    ];
    this.setState({
      fileList,
      loading: false,
    });
  };

  // NOTE: 这里是为了动态修改 ant-design 中的样式, 做法比较暴力
  modifyUploadComponentStyle = () => {
    setTimeout(() => {
      const selector =
        '.upload-list-inline .ant-upload-list-item-thumbnail img';
      const imgIconEl = document.querySelector(selector);
      if (imgIconEl) {
        imgIconEl.setAttribute('src', '/static/img/picture.png');
        imgIconEl.setAttribute('style', 'padding: 10px');
        imgIconEl.removeAttribute('alt');
      } else {
        this.modifyUploadComponentStyle();
      }
    }, 50);
  };

  getFileExt = (fileUrl) => {
    const dotIndex = fileUrl.lastIndexOf('.');
    return fileUrl.slice(dotIndex + 1).toLowerCase();
  };

  handleOk = (e) => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const {
          partmentInfo,
          offer_points_valid_date,
          offer_account_union_id,
          offer_account,
          approval_annex,
          approval_annex_show,
          fileName,
        } = this.state;
        if (partmentInfo) {
          values.department_pid = partmentInfo.part1;
          values.initiate_department = partmentInfo.part2;
        }
        if (offer_account) {
          values.offer_account = offer_account;
        } else {
          message.error('請選擇積分發放賬戶');
          return;
        }
        if (offer_account_union_id) {
          values.offer_account_union_id = offer_account_union_id;
        } else {
          message.error('請選擇積分發放賬戶');
          return;
        }
        if (!offer_points_valid_date) {
          message.error('請設置積分有效期');
          return;
        }
        const { type, period } = offer_points_valid_date;
        if (!type) {
          message.error('請選擇積分有效期類型');
          return;
        }
        if (!period) {
          message.error('請設置積分有效期具體時間');
          return;
        }
        if (type === 'begin_with' && `${period}`.indexOf('.') > -1) {
          message.error('積分有效期具體時間不能包含小數點');
          return;
        }
        values.offer_points_valid_date = offer_points_valid_date;

        if (!period) {
          message.error('請設置積分有效期具體時間');
          return;
        }
        if (!this.state.approval_annex_show) {
          message.error('請上传審批附件');
          return;
        }
        values.approval_annex = approval_annex;
        values.approval_annex_show = approval_annex_show;
        values.fileName = fileName;

        this.props.save(values);
        this.props.onCancel();
      }
    });
  };

  onChangeAction(value) {
    this.setState({
      partmentInfo: {
        part1: '',
        part2: value,
      },
    });
    this.fetchAccountListByPartment(value);
  }

  // 根据部门来获取账户list
  async fetchAccountListByPartment(pid) {
    const res = await fetchAccountByDepartment({
      department: pid,
      is_filter: 1,
    });
    if (res.data.status && res.data.data) {
      const list = res.data.data.list || [];
      this.setState({
        accountList: list,
      });
    }
  }

  // 积分账户更改 事件
  accoutNameChangeAction = (value) => {
    const { accountList } = this.state;
    const offer_account_union_id = accountList.filter(
      (item) => +item.id === +value
    )[0].union_id;
    this.setState({
      offer_account: value,
      offer_account_union_id,
    });
  };

  handleChangeValidTime = (validTime) => {
    const { selected, designation } = validTime;
    const offer_points_valid_date = {
      type: selected,
      period: designation,
    };
    this.setState({ offer_points_valid_date });
  };

  getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  handlePreview = async (file) => {
    const { type } = file;
    let previewUrl = '';
    if (file.url) {
      previewUrl = file.url;
    } else if (file.originFileObj) {
      previewUrl = await this.getBase64(file.originFileObj);
    }
    let { previewFileType } = this.state;
    if (type === 'application/pdf' && file.response && file.response.status) {
      const {
        response: {
          data: { absolute_path: url },
        },
      } = file;
      previewUrl = url;
      previewFileType = 2;
    }
    this.setState({
      previewUrl,
      previewVisible: true,
      previewFileType,
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  // 文件上传成功事件
  fileUploadSuccessAction = (values) => {
    const {
      path,
      absolute_path,
      type,
      fileList,
      file_type,
      file_name,
    } = values;
    let approval_annex = '';
    let listType = 'picture-card';
    let attrFilesList = [];
    if (type === 'done' && path) {
      approval_annex = path;
      attrFilesList = [...fileList];
      listType = file_type === 1 ? 'picture-card' : 'picture';
    }
    this.setState({
      approval_annex,
      approval_annex_show: absolute_path,
      fileName: file_name,
      fileList: attrFilesList,
      listType,
      previewFileType: file_type,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      accountList,
      offer_points_valid_date,
      listType,
      fileList,
      previewFileType,
      previewUrl,
      previewVisible,
      loading,
    } = this.state;
    const { data, isDisabledEdit } = this.props;
    const { type, period } = offer_points_valid_date || {};
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    return (
      <Modal
        visible
        title="配置發分規則"
        onOk={this.handleOk}
        onCancel={this.props.onCancel}
        okText="保存"
        cancelText="取消"
        width={700}
        height={600}
      >
        <Form onSubmit={this.handleOk}>
          <Row>
            <Col>
              <FormItem label="積分明細顯示名稱描述" {...formItemLayout}>
                {getFieldDecorator('remain_title', {
                  initialValue: data.remain_title,
                  rules: [{ required: true, message: '請輸入' }],
                })(
                  <Input
                    disabled={isDisabledEdit}
                    maxLength={10}
                    placeholder="請輸入"
                  />
                )}
              </FormItem>
            </Col>
            <Col>
              <FormItem
                label="發起部門"
                {...formItemLayout}
                className="insert-red-star"
              >
                {/* <BelongDepartment
                  style={{
                    width: '198px',
                  }}
                  disabled={isDisabledEdit}
                  defaultValue={this.state.partmentInfo}
                  onChange={this.onChangeAction.bind(this)}
                /> */}

                <PartmentTreeSelect
                  value={this.state.partmentInfo.part2}
                  onChange={this.onChangeAction.bind(this)}
                  partmentList={this.props.system.partmentList}
                  disabled={isDisabledEdit}
                />
              </FormItem>
            </Col>
            <Col>
              <FormItem
                label="積分發放賬戶"
                {...formItemLayout}
                className="insert-red-star"
              >
                <span>
                  <Select
                    disabled={isDisabledEdit}
                    style={{ width: '100%' }}
                    onChange={this.accoutNameChangeAction}
                    defaultValue={this.state.offer_account}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  >
                    {accountList.map((item) => {
                      return (
                        <Option key={item.id} value={item.id}>
                          {item.account_name}
                        </Option>
                      );
                    })}
                  </Select>
                </span>
              </FormItem>
            </Col>
            <Col>
              <FormItem label="发分数额" {...formItemLayout}>
                每次發放{'  '}
                {getFieldDecorator('points', {
                  initialValue: data.points,
                  rules: [{ required: true, message: '請輸入发分数额' }],
                })(
                  <InputNumber
                    disabled={isDisabledEdit}
                    max={1000000}
                    min={1}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                )}
                {'  '}
                積分
              </FormItem>
            </Col>
            <Col>
              <FormItem
                label="發出積分有效期"
                {...formItemLayout}
                className="insert-red-star"
              >
                <IntegralValidTime
                  disabled={isDisabledEdit}
                  onChange={this.handleChangeValidTime}
                  selected={type}
                  designation={period}
                />
              </FormItem>
            </Col>
            <Col>
              <FormItem label="審批附件" {...formItemLayout}>
                <div style={{ height: 120, overflow: 'hidden' }}>
                  {loading ? (
                    <div
                      style={{
                        height: '100%',
                        width: '100%',
                        border: '1px solid #eee',
                      }}
                    >
                      <Spin
                        spinning
                        style={{ marginLeft: '45%', marginTop: '45%' }}
                      />
                    </div>
                  ) : (
                    <Upload
                      disabled={isDisabledEdit}
                      listType={listType}
                      fileList={fileList}
                      onPreview={this.handlePreview}
                      onSuccess={this.fileUploadSuccessAction}
                      showUploadList={{
                        showPreviewIcon: true,
                        showRemoveIcon: !isDisabledEdit,
                      }}
                      className={
                        listType == 'picture' ? 'upload-list-inline' : ''
                      }
                    >
                      {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                  )}
                </div>
                <PreviewComponent
                  previewFileType={previewFileType}
                  previewUrl={previewUrl}
                  previewVisible={previewVisible}
                  handleCancel={this.handleCancel}
                />
                <div style={{ color: '#1890FF' }}>
                  僅支持 jpg, png, jpeg, pdf 格式文件
                </div>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

export default withRouter(
  connect(({ system, auth }) => ({
    system: system.toJS(),
    auth: auth.toJS(),
  }))(Form.create()(Points))
);
