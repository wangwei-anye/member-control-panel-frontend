// 新会员专享优惠配置

import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Form,
  Input,
  Select,
  Button,
  Radio,
  DatePicker,
  message,
  Modal,
} from 'antd';
import {
  getPromotionalActivityDetailRequest,
  addOrUpdateDiscountConfigRequest,
  getPromotionalActivityListRequest,
} from 'services/infinite/infinite';
import UploadByDragger from 'components/UploadByDragger';
import moment from 'moment';
import { getImgRequest } from 'services/common/common';

const { Option } = Select;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 7 },
};
const formItemWithOutLabel = {
  wrapperCol: {
    span: 7,
    offset: 4,
  },
};
const ruleList = [
  {
    key: 1,
    label: '新會員專享（註冊時間在30天以內的會員）',
  },
  {
    key: 2,
    label: '推廣活動時間內註冊的會員專享',
  },
  {
    key: 3,
    label: '無限制（已綁定手機號的會員均可領取）',
  },
];
const limitList = [
  {
    key: 1,
    label: '限領1次',
  },
  {
    key: 2,
    label: '不限制',
  },
];
class DiscountConfig extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      isSubmiting: false,
      isShowModal: false,
      iframeSrc:
        process.env.environment !== 'production'
          ? 'https://hk01-member-frontend.hktester.com/egg'
          : 'https://hk01-member-frontend.hk01.com/egg',
      dateString: [],
      configInfo: {},
      reward_image: '',
      previewVisible: false,
      fileList: [],
      previewImage: '',
    };
    this.id = '';
  }
  async componentDidMount() {
    await this.fetchList();
    if (!this.id) {
      return;
    }
    const { data } = await getPromotionalActivityDetailRequest({ id: this.id });
    let file_url = '';
    if (data.status) {
      const dataInfo = data.data;
      const url = dataInfo.reward_image_url;
      const fileList = [
        {
          uid: '1',
          name: '上傳圖片',
          status: 'done',
          url,
        },
      ];
      file_url = url;
      await this.setState({
        fileList,
        reward_image: dataInfo.reward_image,
        configInfo: { ...dataInfo },
        dateString: [dataInfo.online_at, dataInfo.offline_at],
      });
    }
    if (!file_url) {
      return;
    }
    let templateUrl = file_url;
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
        name: '上傳圖片',
        status: 'done',
        url: templateUrl,
      },
    ];
    this.setState({
      fileList,
    });
  }
  componentWillUnmount() {
    if (this.templateUrl) {
      URL.revokeObjectURL(this.templateUrl);
      this.templateUrl = null;
    }
  }
  async fetchList() {
    const { data } = await getPromotionalActivityListRequest({
      page: 1,
      limit: 1,
    });
    if (data.status) {
      const dataInfo = data.data;
      if (dataInfo.list.length) {
        this.id = dataInfo.list[0].id;
        this.setState({
          id: dataInfo.list[0].id,
        });
      }
    }
  }
  handleShowModal = () => {
    this.setState({
      isShowModal: true,
    });
  };
  handleModalCancel = () => {
    this.setState({
      isShowModal: false,
    });
  };
  submit = () => {
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const { reward_image } = this.state;
      if (!reward_image) {
        message.error('請上傳獎品主圖!');
        return;
      }
      values.online_at = moment(values.time[0]).format('YYYY-MM-DD HH:mm:ss');
      values.offline_at = moment(values.time[1]).format('YYYY-MM-DD HH:mm:ss');
      delete values.time;
      this.setState({
        isSubmiting: true,
      });
      if (this.id) {
        values.id = this.id;
      }
      values.reward_image = reward_image;
      const { data } = await addOrUpdateDiscountConfigRequest(values);
      if (data.status) {
        message.success('發佈成功');
      }
      this.setState({
        isSubmiting: false,
      });
    });
  };
  // 文件上传成功事件
  fileUploadSuccessAction = (values) => {
    const { path, type, fileList } = values;
    let reward_image = '';
    let attrFilesList = [];
    if (type === 'done' && path) {
      reward_image = path;
      attrFilesList = [...fileList];
    }
    this.setState({ fileList: attrFilesList, reward_image });
  };
  handleCancelBack = () => {
    this.props.history.go(-1);
  };
  // 预览图片
  handlePreview = (file) => {
    if (this.state.listType !== 'text') {
      this.setState({
        previewImage: file.url || file.thumbUrl,
        previewVisible: true,
      });
    }
  };
  // 预览图片取消
  handleCancel = () => this.setState({ previewVisible: false });
  render() {
    const {
      isSubmiting,
      iframeSrc,
      isShowModal,
      configInfo,
      fileList,
      previewVisible,
      previewImage,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="p-discount-config-wrap">
        <Form>
          <FormItem {...formItemLayout} label="推廣活動前端頁面樣式">
            <Button onClick={this.handleShowModal}>預覽樣式</Button>
          </FormItem>
          <FormItem {...formItemLayout} label="推廣活動標題">
            {getFieldDecorator('title', {
              initialValue: configInfo ? configInfo.title || '' : '',
              rules: [
                {
                  required: true,
                  message: '請簡單輸入推廣活動標題',
                },
              ],
            })(<Input placeholder="請簡單輸入推廣活動標題" maxLength={30} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="獎品設置">
            {getFieldDecorator('preferential_type', {
              initialValue: configInfo ? configInfo.preferential_type || 1 : 1,
              rules: [],
            })(
              <Select disabled>
                <Option value={1}>優惠券</Option>
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemWithOutLabel} label="">
            {getFieldDecorator('preferential_sku', {
              initialValue: configInfo ? configInfo.preferential_sku || '' : '',
              rules: [
                { required: true, message: '請輸入所要發放的優惠券sku ID' },
              ],
            })(<Input placeholder="請輸入優惠券SKU ID" maxLength={50} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="獎品主圖">
            <UploadByDragger
              disabled={fileList.length >= 1}
              listType="picture-card"
              fileList={fileList}
              onPreview={this.handlePreview}
              onSuccess={this.fileUploadSuccessAction}
              limitWidthHeight={{ width: 343, height: 114 }}
              showUploadList={{
                showPreviewIcon: true,
              }}
              noteStyle={{ marginTop: 0 }}
            />
          </FormItem>
          <FormItem {...formItemLayout} label="領取規則">
            {getFieldDecorator('offer_rule', {
              initialValue: configInfo
                ? configInfo.offer_rule || ruleList[0].key
                : ruleList[0].key,
              rules: [{ required: true, message: '請選擇一條規則' }],
            })(
              <RadioGroup>
                {ruleList.map((item, index) => {
                  return (
                    <Radio key={index} value={item.key}>
                      {item.label}
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="本活動人均領取次數限制">
            {getFieldDecorator('offer_times', {
              initialValue: configInfo
                ? configInfo.offer_times || limitList[0].key
                : limitList[0].key,
              rules: [{ required: true, message: '請選擇一個限制條件' }],
            })(
              <RadioGroup>
                {limitList.map((item, index) => {
                  return (
                    <Radio key={index} value={item.key}>
                      {item.label}
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="推廣活動時間">
            {getFieldDecorator('time', {
              initialValue:
                configInfo && configInfo.online_at
                  ? [
                      moment(configInfo.online_at),
                      moment(configInfo.offline_at),
                    ]
                  : null,
              rules: [{ required: true, message: '請選擇推廣活動時間' }],
            })(
              <RangePicker
                showTime
                allowClear={false}
                format="YYYY-MM-DD HH:mm:ss"
              />
            )}
          </FormItem>
        </Form>
        <div className="m-footer">
          <Button
            type="primary"
            onClick={this.submit}
            loading={isSubmiting}
            disabled={isSubmiting}
          >
            提交並發佈
          </Button>
          <Button onClick={this.handleCancelBack} disabled={isSubmiting}>
            取消
          </Button>
        </div>
        <Modal
          title="預覽樣式"
          visible={isShowModal}
          footer={null}
          onCancel={this.handleModalCancel}
        >
          <div className="m-phone">
            <iframe
              className="iframe"
              src={iframeSrc}
              frameBorder="0"
              title="預覽樣式"
              style={{}}
            />
          </div>
        </Modal>
        <Modal
          visible={previewVisible}
          width={680}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}

export default withRouter(
  connect(({ infinite, system }) => ({
    infinite: infinite.toJS(),
    system: system.toJS(),
  }))(Form.create()(DiscountConfig))
);
