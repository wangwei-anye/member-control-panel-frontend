import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Form,
  Card,
  Input,
  DatePicker,
  Button,
  Select,
  message,
  Modal,
  Radio,
  InputNumber
} from 'antd';
import moment from 'moment';
import UploadByDragger from 'components/UploadByDragger';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import {
  getDetailRequest,
  addOrUpdateDetailRequest
} from 'services/infinite/infinite';
import { getImgRequest } from 'services/common/common';
import './index.less';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 18 }
};
const Option = Select.Option;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const exchangePriceSelectList = [
  {
    label: '積分兌換',
    key: 1
  },
  {
    label: '現金購買',
    key: 2
  },
  {
    label: '積分加現金兌換',
    key: 3
  }
];
class DetailPage extends React.Component {
  constructor(props) {
    super(props);
    const id = props.system.query.id || '';
    const editType = props.system.query.type || '';
    this.state = {
      id,
      isDisabledEdit: editType === 'look',
      detailInfo: {
        title: '', // 活动名称
        poster_origin_url: '', // 图片地址
        link_url: '', // 跳转地址
        exchange_type: exchangePriceSelectList[0].key, // 兑换类型,1积分兑换,2现金兑换,3现金加积分
        cash: 0, // 兑换价格 现金
        points: 0, // 兑换价格 积分
        button_status: 1, // 是否显示 按钮  1-》 是； 0=》 否
        button_description: '', // 按钮内容
        plan_online_at: null, // 上架时间
        plan_offline_at: null, // 下架时间
        online_times: 0, // 上架次数
        poster_origin_size: '',
        is_exchange: 1 // 是否需要兑换价
      },
      previewVisible: false,
      fileList: [],
      previewImage: '',
      listType: 'picture-card',
      isSubmiting: false,
      isSubmitAndPublishing: false,
      isLoading: false
    };
  }
  async componentDidMount() {
    const { id } = this.state;
    if (!id) {
      return;
    }
    this.setState({ isLoading: true });
    const { data } = await getDetailRequest({
      id,
      port_key: 'shopping_mall_activity'
    });
    let file_url = '';
    if (data.status) {
      const dataInfo = data.data;
      const objInfo = { ...dataInfo };
      const fileList = [
        {
          uid: '1',
          name: '上傳圖片',
          status: 'done',
          url: dataInfo.file_url,
          thumbUrl: dataInfo.file_url
        }
      ];
      file_url = dataInfo.file_url;
      objInfo.exchange_type = objInfo.exchange_type || 1;
      this.setState({
        detailInfo: {
          ...objInfo
        },
        fileList
      });
    }
    this.setState({ isLoading: false }, async () => {
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
          url: templateUrl
        }
      ];
      this.setState({
        fileList
      });
    });
  }
  componentWillUnmount() {
    if (this.templateUrl) {
      URL.revokeObjectURL(this.templateUrl);
      this.templateUrl = null;
    }
  }
  // 文件上传成功事件
  fileUploadSuccessAction = values => {
    const { path, type, fileList, naturalHeight, naturalWidth } = values;
    let poster_origin_url = '';
    let attrFilesList = [];
    if (type === 'done' && path) {
      poster_origin_url = path;
      attrFilesList = [...fileList];
      const detailInfo = Object.assign({}, this.state.detailInfo, {
        poster_origin_url,
        poster_origin_size: `${naturalWidth}*${naturalHeight}`
      });
      this.setState({ fileList: attrFilesList, detailInfo });
    } else {
      const detailInfo = Object.assign({}, this.state.detailInfo, {
        poster_origin_url
      });
      this.setState({ fileList: attrFilesList, detailInfo });
    }
  };
  // 预览图片
  handlePreview = file => {
    if (this.state.listType !== 'text') {
      this.setState({
        previewImage: file.url || file.thumbUrl,
        previewVisible: true
      });
    }
  };
  // 预览图片取消
  handleCancel = () => this.setState({ previewVisible: false });
  onDateChange = (date, dateSring) => {
    const detailInfo = Object.assign({}, this.state.detailInfo, {
      plan_online_at: dateSring[0],
      plan_offline_at: dateSring[1]
    });
    this.setState({
      detailInfo
    });
  };
  // 处理 input 输入事件
  handleInputChange = (type, e) => {
    const { value } = e.target;
    const detailInfo = Object.assign({}, this.state.detailInfo, {
      [type]: value
    });
    this.setState({
      detailInfo
    });
  };

  // 处理 inputNumber组件输入事件
  handleInputNumberChange = (type, value) => {
    const detailInfo = Object.assign({}, this.state.detailInfo, {
      [type]: value
    });
    this.setState({
      detailInfo
    });
  };

  // 按钮内容 radio 切换事件
  handleRadioChange = (type, e) => {
    const { value } = e.target;
    const detailInfo = Object.assign({}, this.state.detailInfo, {
      [type]: value
    });
    this.setState({
      detailInfo
    });
  };

  // 兑换价 select 切换事件
  handleExchangeChange = value => {
    const detailInfo = Object.assign({}, this.state.detailInfo, {
      cash: 0,
      points: 0,
      exchange_type: value
    });
    this.setState({
      detailInfo
    });
  };
  onCancel = () => {
    this.props.history.go(-1);
  };
  // 渲染 兑换价 DOM
  renderConversionPriceDOM() {
    const { isDisabledEdit, detailInfo } = this.state;
    if (detailInfo.exchange_type == 1) {
      return (
        <div className="m-type-wrap">
          <span className="u-form-control">
            <InputToolTipCom
              min={0}
              step={1}
              maxNum={999999}
              style={{ width: '150px' }}
              formatter={value =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={value => value.replace(/(,*)/g, '')}
              value={detailInfo.points}
              disabled={isDisabledEdit}
              onChange={this.handleInputNumberChange.bind(this, 'points')}
            />
          </span>
          <span className="u-unit">積分</span>
        </div>
      );
    }
    if (detailInfo.exchange_type == 2) {
      return (
        <div className="m-type-wrap">
          <span className="u-form-control">
            <InputToolTipCom
              min={0}
              isDecimals
              maxNum={99999.9}
              style={{ width: '150px' }}
              value={detailInfo.cash}
              formatter={value =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={value => value.replace(/(,*)/g, '')}
              disabled={isDisabledEdit}
              onChange={this.handleInputNumberChange.bind(this, 'cash')}
            />
          </span>
          <span className="u-unit">元</span>
        </div>
      );
    }
    if (detailInfo.exchange_type == 3) {
      return (
        <div className="m-type-wrap">
          <span className="u-form-control">
            <InputToolTipCom
              min={0}
              step={1}
              maxNum={999999}
              style={{ width: '150px' }}
              value={detailInfo.points}
              formatter={value =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={value => value.replace(/(,*)/g, '')}
              disabled={isDisabledEdit}
              onChange={this.handleInputNumberChange.bind(this, 'points')}
            />
          </span>
          <span className="u-unit">積分</span>
          <span className="u-unit">+</span>
          <span className="u-form-control">
            <InputToolTipCom
              min={0}
              isDecimals
              maxNum={99999.9}
              style={{ width: '150px' }}
              value={detailInfo.cash}
              formatter={value =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={value => value.replace(/(,*)/g, '')}
              disabled={isDisabledEdit}
              onChange={this.handleInputNumberChange.bind(this, 'cash')}
            />
          </span>
          <span className="u-unit">元</span>
        </div>
      );
    }
  }

  cashValid = cash => {
    const [integer, decimal] = parseFloat(cash)
      .toString()
      .split('.');
    if (parseInt(integer, 10) > 99999) {
      return false;
    }
    if (decimal && decimal.length > 1) {
      return false;
    }
    return true;
  };

  submit = async type => {
    if (!this.checkSubmitValidate()) {
      return;
    }
    const { id, detailInfo } = this.state;
    const loadingType =
      type === 'publish' ? 'isSubmitAndPublishing' : 'isSubmiting';
    this.setState({
      [loadingType]: true
    });
    const postData = {
      ...detailInfo,
      title: detailInfo.title.trim(),
      button_description: detailInfo.button_description.trim(),
      plan_online_at: moment(detailInfo.plan_online_at)
        .set({ second: 0 })
        .format('YYYY-MM-DD HH:mm:ss'),
      plan_offline_at: moment(detailInfo.plan_offline_at)
        .set({ second: 59 })
        .format('YYYY-MM-DD HH:mm:ss'),
      action: id ? 'update' : 'add',
      is_publish: type === 'publish' ? 1 : 0,
      port_key: 'shopping_mall_activity'
    };
    if (postData.online_at) {
      delete postData.online_at;
    }
    if (id) {
      postData.id = id;
    }
    const { data } = await addOrUpdateDetailRequest(postData);
    if (data.status) {
      message.success('成功!', 2, () => {
        this.setState({ [loadingType]: false });
        this.props.history.go(-1);
      });
    } else {
      this.setState({ [loadingType]: false });
    }
  };

  checkSubmitValidate = () => {
    /* eslint-disable */
    const { id, detailInfo } = this.state;
    const urlReg = /(^([a-zA-Z0-9]+):\/\/([a-zA-Z0-9]+))/gi;
    if (!detailInfo.title.trim()) {
      message.error('請填寫活動名稱!');
      return false;
    }
    if (!detailInfo.poster_origin_url) {
      message.error('請上傳圖片!');
      return false;
    }
    if (+detailInfo.is_exchange === 1) {
      if (!detailInfo.exchange_type) {
        message.error('請選擇一個要兌換的類型!');
        return false;
      }
      if (detailInfo.exchange_type == 1) {
        if (detailInfo.points === null) {
          message.error('請填寫所要兌換的積分!');
          return false;
        }
        if (!/^\d+$/g.test(detailInfo.points)) {
          message.error('要兌換的積分只能爲正整數，不能爲小數!');
          return false;
        }
      }
      if (detailInfo.exchange_type == 2) {
        if (detailInfo.cash === null) {
          message.error('請填寫所要購買的現金!');
          return false;
        }
        if (!this.cashValid(detailInfo.cash)) {
          message.error('填寫的購買的現金不符合要求!');
          return false;
        }
      }
      if (detailInfo.exchange_type == 3) {
        if (detailInfo.points === null) {
          message.error('請填寫所要兌換的積分!');
          return false;
        }

        if (!/^\d+$/g.test(detailInfo.points)) {
          message.error('要兌換的積分只能爲正整數，不能爲小數!');
          return false;
        }
        if (detailInfo.cash === null) {
          message.error('請填寫所要購買的現金!');
          return false;
        }
        if (!this.cashValid(detailInfo.cash)) {
          message.error('填寫的購買的現金不符合要求!');
          return false;
        }
      }
    }
    if (detailInfo.button_status) {
      if (!detailInfo.button_description.trim()) {
        message.error('請填寫操作按鈕內容!');
        return false;
      }
    }

    if (!detailInfo.link_url) {
      message.error('請填寫網址!');
      return false;
    }

    if (!urlReg.test(detailInfo.link_url)) {
      message.error('請填寫正確的網址格式!');
      return false;
    }

    if (!detailInfo.plan_online_at) {
      message.error('請填寫上架時間!');
      return false;
    }

    if (!detailInfo.plan_offline_at) {
      message.error('請填寫下架時間!');
      return false;
    }
    if (!id && new Date(detailInfo.plan_online_at) * 1 <= new Date() * 1) {
      message.error('填寫的上架時間不能小於等於當前時間!');
      return false;
    }

    if (new Date(detailInfo.plan_offline_at) * 1 <= new Date() * 1) {
      message.error('填寫的下架時間不能小於等於當前時間!');
      return false;
    }
    return true;
  };

  handlePublish = type => {
    if (!this.checkSubmitValidate()) {
      return;
    }
    const self = this;
    const content = '提交的內容將立刻發布並展示在推薦列表, 你還要繼續嗎？';
    confirm({
      iconType: 'info-circle',
      title: '',
      content,
      onOk() {
        self.submit(type);
      }
    });
  };

  render() {
    const {
      detailInfo,
      isDisabledEdit,
      listType,
      fileList,
      previewImage,
      previewVisible,
      isSubmiting,
      isLoading,
      isSubmitAndPublishing
    } = this.state;
    const { id, type } = this.props.system.query;
    return (
      <div className="p-detail-wrap">
        <Card
          bordered={false}
          loading={isLoading}
          title={
            this.state.id
              ? `${isDisabledEdit ? '查看' : '編輯'}推薦內容詳情`
              : '推薦內容詳情編輯'
          }
        >
          <Form>
            {id ? (
              <FormItem {...formItemLayout} label="ID">
                <p>{id}</p>
              </FormItem>
            ) : null}
            <FormItem {...formItemLayout} label="標題">
              <Input
                disabled={isDisabledEdit}
                placeholder="請簡單填寫積分推薦內容介紹的標題(18個字符以內)"
                maxLength={18}
                value={detailInfo.title}
                style={{ width: '400px' }}
                onChange={this.handleInputChange.bind(this, 'title')}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="上傳圖片">
              <UploadByDragger
                type={type || ''}
                disabled={isDisabledEdit || fileList.length >= 1}
                listType={listType}
                fileList={fileList}
                onPreview={this.handlePreview}
                onSuccess={this.fileUploadSuccessAction}
                onRemove={() => {}}
                limitWidthHeight={{ width: 375, height: 400 }}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: !isDisabledEdit
                }}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="兌換價">
              <div>
                <div>
                  <RadioGroup
                    onChange={this.handleRadioChange.bind(this, 'is_exchange')}
                    disabled={isDisabledEdit}
                    value={detailInfo.is_exchange}
                  >
                    <Radio value={1}>需要</Radio>
                    <Radio value={0}>不需要</Radio>
                  </RadioGroup>
                </div>
                {+detailInfo.is_exchange === 1 ? (
                  <div>
                    <span>
                      <Select
                        style={{ width: '150px' }}
                        disabled={isDisabledEdit}
                        value={detailInfo.exchange_type}
                        onChange={this.handleExchangeChange}
                      >
                        {exchangePriceSelectList.map(item => {
                          return (
                            <Option key={item.key} value={item.key}>
                              {item.label}
                            </Option>
                          );
                        })}
                      </Select>
                    </span>
                    <span>{this.renderConversionPriceDOM()}</span>
                  </div>
                ) : null}
              </div>
            </FormItem>
            <FormItem {...formItemLayout} label="操作按鈕">
              <div>
                <RadioGroup
                  onChange={this.handleRadioChange.bind(this, 'button_status')}
                  disabled={isDisabledEdit}
                  value={detailInfo.button_status}
                >
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </RadioGroup>
                {detailInfo.button_status ? (
                  <div>
                    <Input
                      disabled={isDisabledEdit}
                      value={detailInfo.button_description}
                      placeholder="請輸入在列表操作按鈕上顯示的內容（4個字以內）"
                      style={{ width: '400px' }}
                      maxLength={4}
                      onChange={this.handleInputChange.bind(
                        this,
                        'button_description'
                      )}
                    />
                  </div>
                ) : null}
              </div>
            </FormItem>
            <FormItem {...formItemLayout} label="網址">
              <Input
                disabled={isDisabledEdit}
                value={detailInfo.link_url}
                placeholder="請輸入URL或者DeepLink地址"
                style={{ width: '400px' }}
                onChange={this.handleInputChange.bind(this, 'link_url')}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="上下架時間">
              <RangePicker
                showTime={{ format: 'HH:mm' }}
                disabled={isDisabledEdit}
                value={[
                  detailInfo.plan_online_at
                    ? moment(detailInfo.plan_online_at)
                    : null,
                  detailInfo.plan_offline_at
                    ? moment(detailInfo.plan_offline_at)
                    : null
                ]}
                format="YYYY-MM-DD HH:mm"
                onChange={this.onDateChange}
                allowClear={false}
                showToday={false}
                style={{ width: '400px' }}
                // disabledDate={current => {
                //   return (
                //     current &&
                //     new Date(current.format('YYYY-MM-DD')) * 1 <
                //       new Date(moment().format('YYYY-MM-DD')) * 1
                //   );
                // }}
                getCalendarContainer={triggerNode => triggerNode.parentNode}
              />
            </FormItem>
          </Form>
          <div className="footer">
            <Button
              className="btn"
              onClick={this.onCancel}
              disabled={isSubmiting || isSubmitAndPublishing}
            >
              {isDisabledEdit ? '返回' : '取消'}
            </Button>
            {isDisabledEdit ? null : (
              <span>
                <Button
                  className="btn"
                  onClick={this.submit.bind(this, 'submit')}
                  disabled={isSubmiting || isSubmitAndPublishing}
                  loading={isSubmiting}
                >
                  {isSubmiting ? '保存中...' : '保存'}
                </Button>
                <Button
                  type="primary"
                  className="btn"
                  onClick={this.handlePublish.bind(this, 'publish')}
                  disabled={isSubmiting || isSubmitAndPublishing}
                  loading={isSubmitAndPublishing}
                >
                  {isSubmitAndPublishing ? '提交並發佈中...' : '提交並發佈'}
                </Button>
              </span>
            )}
          </div>
        </Card>
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
    system: system.toJS()
  }))(Form.create()(DetailPage))
);
