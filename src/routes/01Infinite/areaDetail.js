import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { Form, Card, Input, Button, message, Modal, DatePicker } from 'antd';
import UploadByDragger from 'components/UploadByDragger';
import LoadingCom from 'components/LoadingCom';
import { getImgRequest } from 'services/common/common';
import GetImgByAuthCom from 'components/GetImgByAuthCom';
import moment from 'moment';
import {
  getDetailRequest,
  addOrUpdateDetailRequest
} from 'services/infinite/infinite';
import './index.less';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 22 }
};
class DetailPage extends React.Component {
  constructor(props) {
    super(props);
    const id = props.system.query.id || '';
    const editType = props.system.query.type || '';
    this.state = {
      id,
      isDisabledEdit: editType === 'look',
      title: '', // 活动名称
      description: '', // 副标题
      button_description: '', // 按钮内容
      poster_origin_url: '', // 图片地址
      link_url: '', // 跳转地址
      plan_online_at: null, // 上架时间
      plan_offline_at: null, // 下架时间
      previewVisible: false,
      fileList: [],
      previewImage: '',
      listType: 'picture-card',
      isSubmiting: false,
      isSubmitAndPublishing: false,
      isLoading: false,
      online_times: 0,
      file_url: ''
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
      port_key: 'member_points_earn'
    });
    if (data.status) {
      const dataInfo = data.data;
      const objInfo = {
        title: dataInfo.title,
        description: dataInfo.description,
        poster_origin_url: dataInfo.poster_origin_url,
        link_url: dataInfo.link_url,
        file_url: dataInfo.file_url,
        plan_online_at: dataInfo.plan_online_at,
        plan_offline_at: dataInfo.plan_offline_at,
        button_description: dataInfo.button_description,
        online_times: dataInfo.online_times || 0
      };
      const res = await getImgRequest(dataInfo.file_url);
      const url = URL.createObjectURL(res);
      const fileList = [
        {
          uid: '1',
          name: '上傳圖片',
          status: 'done',
          url,
          thumbUrl: url
        }
      ];
      this.setState({
        ...objInfo,
        fileList
      });
    }
    this.setState({ isLoading: false });
  }
  // 文件上传成功事件
  fileUploadSuccessAction = values => {
    const { path, type, fileList } = values;
    let poster_origin_url = '';
    let attrFilesList = [];
    if (type === 'done' && path) {
      poster_origin_url = path;
      attrFilesList = [...fileList];
    }
    this.setState({ fileList: attrFilesList, poster_origin_url });
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
    this.setState({
      plan_online_at: dateSring[0],
      plan_offline_at: dateSring[1]
    });
  };

  handleInputChange = (type, e) => {
    const { value } = e.target;
    this.setState({
      [type]: value
    });
  };
  onCancel = () => {
    this.props.history.go(-1);
  };

  checkSubmitValidate = () => {
    /* eslint-disable */
    const {
      id,
      title,
      description,
      link_url,
      plan_online_at,
      plan_offline_at,
      poster_origin_url,
      button_description
    } = this.state;
    const urlReg = /(^([a-zA-Z0-9]+):\/\/([a-zA-Z0-9]+))/gi;
    if (!title.trim()) {
      message.error('請填寫標題!');
      return false;
    }
    if (!description.trim()) {
      message.error('請填寫副標題!');
      return false;
    }
    if (!poster_origin_url) {
      message.error('請上傳icon!');
      return false;
    }
    if (!button_description.trim()) {
      message.error('请填写按钮内容!');
      return false;
    }
    if (!link_url) {
      message.error('請填寫網址!');
      return false;
    }
    if (!urlReg.test(link_url)) {
      message.error('請填寫正確的網址格式!');
      return false;
    }

    if (!plan_online_at) {
      message.error('請填寫上架時間!');
      return false;
    }

    if (!plan_offline_at) {
      message.error('請填寫下架時間!');
      return false;
    }
    if (!id && new Date(plan_online_at) * 1 <= new Date() * 1) {
      message.error('填寫的上架時間不能小於等於當前時間!');
      return false;
    }

    if (new Date(plan_offline_at) * 1 <= new Date() * 1) {
      message.error('填寫的下架時間不能小於等於當前時間!');
      return false;
    }
    return true;
  };

  alertConfigDialog = type => {
    if (!this.checkSubmitValidate()) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '提交的內容將立刻發布並展示在獎賞列表, 你還要繼續嗎？',
      onOk() {
        self.submit(type);
      }
    });
  };

  submit = async type => {
    if (!this.checkSubmitValidate()) {
      return;
    }
    const {
      id,
      title,
      description,
      link_url,
      plan_online_at,
      plan_offline_at,
      poster_origin_url,
      button_description
    } = this.state;
    /* eslint-disable */
    const loadingType =
      type === 'publish' ? 'isSubmitAndPublishing' : 'isSubmiting';
    this.setState({
      [loadingType]: true
    });
    const postData = {
      link_url: link_url.trim(),
      plan_online_at: moment(plan_online_at)
        .set({ second: 0 })
        .format('YYYY-MM-DD HH:mm:ss'),
      plan_offline_at: moment(plan_offline_at)
        .set({ second: 59 })
        .format('YYYY-MM-DD HH:mm:ss'),
      title: title.trim(),
      description: description.trim(),
      poster_origin_url,
      button_description: button_description.trim(),
      action: id ? 'update' : 'add',
      is_publish: type === 'publish' ? 1 : 0,
      port_key: 'member_points_earn'
    };
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
  render() {
    const {
      title,
      description,
      link_url,
      plan_online_at,
      plan_offline_at,
      button_description,
      isDisabledEdit,
      listType,
      fileList,
      previewImage,
      previewVisible,
      isSubmiting,
      isLoading,
      isSubmitAndPublishing,
      file_url
    } = this.state;
    if (isLoading) {
      return (
        <div className="p-detail-wrap">
          <Card
            bordered={false}
            title={
              this.state.id
                ? `${isDisabledEdit ? '查看' : '編輯'}積分任務詳情`
                : '賺分任務詳情編輯'
            }
          >
            <LoadingCom />
          </Card>
        </div>
      );
    }
    const { id, type } = this.props.system.query;
    return (
      <div className="p-detail-wrap">
        <Card
          bordered={false}
          title={
            this.state.id
              ? `${isDisabledEdit ? '查看' : '編輯'}賺分任務詳情`
              : '賺分任務詳情編輯'
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
                placeholder="請簡單填寫賺分任務介紹標題(12個字符以內)"
                maxLength={12}
                value={title}
                style={{ width: '400px' }}
                onChange={this.handleInputChange.bind(this, 'title')}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="副標題">
              <TextArea
                disabled={isDisabledEdit}
                placeholder="請簡單填寫積分獲取描述文字(36個字符以內)"
                value={description}
                maxLength={36}
                rows={4}
                style={{ width: '400px', resize: 'none' }}
                onChange={this.handleInputChange.bind(this, 'description')}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="上傳icon">
              <UploadByDragger
                type={type || ''}
                disabled={isDisabledEdit || fileList.length >= 1}
                listType={listType}
                fileList={fileList}
                fixedSize
                onPreview={this.handlePreview}
                onSuccess={this.fileUploadSuccessAction}
                limitWidthHeight={{ width: 84, height: 84 }}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: !isDisabledEdit
                }}
              />
            </FormItem>

            <FormItem {...formItemLayout} label="按鈕內容">
              <Input
                disabled={isDisabledEdit}
                value={button_description}
                placeholder="請輸入在列表操作按鈕上顯示的內容(3字內)"
                style={{ width: '400px' }}
                maxLength={3}
                onChange={this.handleInputChange.bind(
                  this,
                  'button_description'
                )}
              />
            </FormItem>

            <FormItem {...formItemLayout} label="網址">
              <Input
                disabled={isDisabledEdit}
                value={link_url}
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
                  plan_online_at ? moment(plan_online_at) : null,
                  plan_offline_at ? moment(plan_offline_at) : null
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
                  type="primary"
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
                  onClick={this.alertConfigDialog.bind(this, 'publish')}
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
        {this.state.id ? (
          <span className="none">
            <GetImgByAuthCom fileUrl={file_url} />
          </span>
        ) : null}
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
