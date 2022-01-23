import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Form,
  Card,
  Input,
  DatePicker,
  Button,
  Icon,
  message,
  Modal
} from 'antd';
import moment from 'moment';
import UploadByDragger from 'components/UploadByDragger';
import GetImgByAuthCom from 'components/GetImgByAuthCom';
import LoadingCom from 'components/LoadingCom';
import {
  fetchDivisionDetailRequest,
  updateOrAddDivisionRequest
} from 'services/integralDivision/division';
import './index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 6 }
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
      poster_origin_url: '', // 图片地址
      link_url: '', // 跳转地址
      offline_at: moment().add(14, 'day'), // 下架时间
      previewVisible: false,
      fileList: [],
      previewImage: '',
      listType: 'picture-card',
      isSubmiting: false,
      isSubmitAndPublishing: false,
      isLoading: false,
      online_times: 0
    };
  }
  async componentDidMount() {
    const { id } = this.state;
    if (!id) {
      return;
    }
    this.setState({ isLoading: true });
    const { data } = await fetchDivisionDetailRequest({ id });
    if (data.status) {
      const dataInfo = data.data;
      const objInfo = {
        title: dataInfo.title,
        poster_origin_url: dataInfo.poster_origin_url,
        link_url: dataInfo.link_url,
        offline_at: dataInfo.plan_offline_at,
        online_times: dataInfo.online_times || 0
      };
      const fileList = [
        {
          uid: '1',
          name: dataInfo.poster_origin_url,
          status: 'done',
          url: '',
          thumbUrl: ''
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
  getImgByAuthChangeAction = value => {
    const { fileList } = this.state;
    const info = Object.assign({}, fileList[0], {
      url: value,
      thumbUrl: value
    });
    this.setState({
      fileList: [info]
    });
  };
  onDateChange = (date, dateSring) => {
    this.setState({
      offline_at: dateSring
    });
  };
  onChange(e, type) {
    const { value } = e.target;
    this.setState({
      [type]: value
    });
  }
  onCancel = () => {
    this.props.history.go(-1);
  };
  submit = async type => {
    /* eslint-disable */
    const {
      id,
      title,
      link_url,
      poster_origin_url,
      offline_at,
      online_times
    } = this.state;
    const urlReg = /(^([a-zA-Z0-9]+):\/\/([a-zA-Z0-9]+))/gi;
    if (!title) {
      message.error('請填寫活動名稱!');
      return;
    }
    if (!offline_at) {
      message.error('請填寫下架時間!');
      return;
    }
    if (new Date(offline_at) * 1 <= new Date() * 1) {
      message.error('填寫的下架時間不能小於等於當前時間!');
      return;
    }
    if (!link_url) {
      message.error('請填寫網址!');
      return;
    }
    if (!urlReg.test(link_url)) {
      message.error('請填寫正確的網址格式!');
      return;
    }
    if (!poster_origin_url) {
      message.error('請上傳圖片!');
      return;
    }
    const loadingType =
      type === 'publish' ? 'isSubmitAndPublishing' : 'isSubmiting';
    this.setState({
      [loadingType]: true
    });
    const postData = {
      online_times,
      link_url: link_url.trim(),
      title: title.trim(),
      offline_at: moment(offline_at).format('YYYY-MM-DD HH:mm:ss'),
      poster_origin_url,
      action: id ? 'update' : 'add',
      is_publish: type === 'publish' ? 1 : 0
    };
    if (id) {
      postData.id = id;
    }
    const { data } = await updateOrAddDivisionRequest(postData);
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
      link_url,
      offline_at,
      isDisabledEdit,
      listType,
      fileList,
      previewImage,
      previewVisible,
      isSubmiting,
      isLoading,
      isSubmitAndPublishing
    } = this.state;
    const { type } = this.props.system.query
    if (isLoading) {
      return (
        <div className="p-integral-division-detail-wrap">
          <Card
            bordered={false}
            title={
              this.state.id
                ? `${isDisabledEdit ? '查看' : '編輯'}熱門活動`
                : '新增熱門活動'
            }
          >
            <LoadingCom />
          </Card>
        </div>
      );
    }
    return (
      <div className="p-integral-division-detail-wrap">
        <Card
          bordered={false}
          title={
            this.state.id
              ? `${isDisabledEdit ? '查看' : '編輯'}熱門活動`
              : '新增熱門活動'
          }
        >
          <Form>
            <FormItem {...formItemLayout} label="活動名稱">
              <Input
                disabled={isDisabledEdit}
                placeholder="請簡單描述熱門活動主題"
                maxLength={100}
                value={title}
                style={{ width: '400px' }}
                onChange={e => this.onChange(e, 'title')}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="網址">
              <Input
                disabled={isDisabledEdit}
                value={link_url}
                placeholder="請輸入URL或者DeepLink地址"
                style={{ width: '400px' }}
                onChange={e => this.onChange(e, 'link_url')}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="下架時間">
              <DatePicker
                showTime
                disabled={isDisabledEdit}
                value={moment(offline_at)}
                format="YYYY-MM-DD HH:mm:ss"
                onChange={this.onDateChange}
                allowClear={false}
                showToday={false}
                style={{ width: '280px' }}
                disabledDate={current => {
                  return (
                    current &&
                    new Date(current.format('YYYY-MM-DD')) * 1 <
                      new Date(moment().format('YYYY-MM-DD')) * 1
                  );
                }}
                getCalendarContainer={triggerNode => triggerNode.parentNode}
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
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: !isDisabledEdit
                }}
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
                  {isSubmiting ? '提交中...' : '提交'}
                </Button>
                <Button
                  type="primary"
                  className="btn"
                  onClick={this.submit.bind(this, 'publish')}
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
            <GetImgByAuthCom
              fileUrl={this.state.poster_origin_url}
              onChange={this.getImgByAuthChangeAction}
            />
          </span>
        ) : null}
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralDivision, system }) => ({
    integralDivision: integralDivision.toJS(),
    system: system.toJS()
  }))(Form.create()(DetailPage))
);
