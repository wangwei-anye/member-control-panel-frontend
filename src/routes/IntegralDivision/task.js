import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { Form, Card, Input, Button, message, Modal } from 'antd';
import {
  fetchTaskDetailRequest,
  addOrUpdateTaskRequest
} from 'services/integralDivision/division';
import UploadByDragger from 'components/UploadByDragger';
import GetImgByAuthCom from 'components/GetImgByAuthCom';
import './index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 6 }
};
class TaskPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: null,
      poster_origin_url: '', // 图片地址
      link_url: '', // 链接
      previewVisible: false,
      fileList: [],
      previewImage: '',
      listType: 'picture-card',
      isSubmiting: false
    };
  }
  async componentDidMount() {
    const { data } = await fetchTaskDetailRequest();
    if (data.status) {
      const dataInfo = data.data;
      if (dataInfo && dataInfo.id) {
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
          ...dataInfo,
          fileList
        });
      }
    }
  }
  componentWillUnmount() {
    message.destroy();
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
  onChange = e => {
    const { value } = e.target;
    this.setState({
      link_url: value
    });
  };
  onCancel = () => {
    this.props.history.go(-1);
  };
  submit = async () => {
    /* eslint-disable */
    const { id, link_url, poster_origin_url } = this.state;
    const urlReg = /(^([a-zA-Z0-9]+):\/\/([a-zA-Z0-9]+))/gi;
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
    const postData = {
      poster_origin_url,
      link_url: link_url.trim(),
      action: id ? 'update' : 'add'
    };
    if (id) {
      postData.id = id;
    }
    this.setState({
      isSubmiting: true
    });
    const { data } = await addOrUpdateTaskRequest(postData);
    if (data.status) {
      message.success('成功', 2, () => {
        this.setState({
          isSubmiting: false
        });
      });
    } else {
      this.setState({
        isSubmiting: false
      });
    }
  };
  render() {
    const {
      id,
      link_url,
      isDisabledEdit,
      listType,
      fileList,
      previewImage,
      previewVisible,
      isSubmiting
    } = this.state;
    return (
      <div className="p-integral-division-detail-wrap">
        <Card title={id ? '編輯積分任務' : '新增積分任務'} bordered={false}>
          <Form>
            <FormItem {...formItemLayout} label="網址">
              <Input
                value={link_url}
                placeholder="請輸入URL或者DeepLink地址"
                onChange={this.onChange}
                style={{ width: '400px' }}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="圖片">
              <UploadByDragger
                disabled={fileList.length >= 1}
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
              disabled={isSubmiting}
            >
              取消
            </Button>
            <Button
              type="primary"
              className="btn"
              onClick={this.submit}
              disabled={isSubmiting}
              loading={isSubmiting}
            >
              {isSubmiting ? '提交並發佈中...' : '提交並發佈'}
            </Button>
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
  }))(Form.create()(TaskPage))
);
