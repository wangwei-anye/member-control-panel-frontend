/**
 * Upload二次封闭
 * 添加SSO会话信息
 */
import React from 'react';
import { Upload, message, Icon } from 'antd';
import { connect } from 'dva';
import { HEADER_TOKEN_NAME, API_BASE } from 'constants';

const MAX_SIZE = 1024 * 1024 * 5; // 文件大小限制
const IMG_TYPE_LIST = ['image/jpg', 'image/png', 'image/jpeg'];
const Dragger = Upload.Dragger;
const minImgWidth = 1136;
const minImgHeight = 640;
class NewUpload extends React.PureComponent {
  static defaultProps = {
    limitWidthHeight: {
      width: minImgWidth,
      height: minImgHeight
    }
  };
  uploadErrorFlag = false
  constructor(props) {
    super(props);
    this.state = {
      data: { file_type: 1, modular: 'points_area' },
      size: {}
    };
  }
  componentDidMount() {
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateStateByProps(nextProps);
  }

  updateStateByProps(props) {
    const newProps = { ...props };
    delete newProps.disabled;
    // 添加SSO会话信息
    newProps.headers = {
      ...props.headers,
      [HEADER_TOKEN_NAME]: props.auth.jwt
    };
    if (newProps.onSuccess) {
      delete newProps.onSuccess;
    }
    this.setState({ ...newProps });
  }

  getFileSize = (file) => {
    return new Promise((ok, fail) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const { naturalHeight, naturalWidth } = img;
          ok({ naturalHeight, naturalWidth });
        };
        img.onerror = () => {
          this.uploadErrorFlag = true;
          fail();
        };
        img.src = fileReader.result;
      };
    });
  }

  beforeUpload = (file, fileList) => {
    const fileSize = file.size;
    const fileType = file.type;
    if (fileSize > MAX_SIZE) {
      this.uploadErrorFlag = true;
      message.error('文件大小不能超過 5M');
      return false;
    }
    if (!IMG_TYPE_LIST.includes(fileType)) {
      message.error('暫支持jpg、png、jpeg格式圖片上傳！');
      if (this.props.onSuccess) {
        this.props.onSuccess({
          type: 'removed',
          fileList: [],
          file_type: 1
        });
      }
      this.uploadErrorFlag = true;
      return false;
    }
    const limitImgWidth = this.props.limitWidthHeight.width;
    const limitImgHeight = this.props.limitWidthHeight.height;
    const fixedSize = this.props.fixedSize;
    this.getFileSize(file).then(({ naturalWidth, naturalHeight }) => {
      const imgValidSize = !fixedSize ?
        !(naturalWidth >= limitImgWidth && naturalHeight >= limitImgHeight) :
        (naturalHeight !== limitImgHeight || naturalWidth !== limitImgWidth);
      const hint = !fixedSize ?
        `請上傳圖片像素最少達 ${limitImgWidth}*${limitImgHeight}的 jpg、png、jpeg圖片` :
        `請上傳圖片像素爲 ${limitImgWidth}*${limitImgHeight}的 jpg、png、jpeg圖片`;
      if (imgValidSize) {
        message.error(hint);
        if (this.props.onSuccess) {
          this.props.onSuccess({
            type: 'removed',
            fileList: [],
            file_type: 1
          });
        }
        this.uploadErrorFlag = true;
        return false;
      }
      this.setState({ size: { naturalHeight, naturalWidth } });
    }).catch(() => {
      message.error('圖片上傳失敗');
      return false;
    });
    this.uploadErrorFlag = false;
    return true;
  };

  onChange = ({ file, fileList }) => {
    const { file_type } = this.state.data;
    const { status, response } = file;
    // TODO: 此处一定要setState，否则会导致onChange 的 status 一直为 uploading
    this.setState({ fileList: [...fileList] });
    if (status === 'done') {
      if (response.status) {
        const size = this.state.size;
        if (this.props.onSuccess && !this.uploadErrorFlag) {
          this.props.onSuccess({
            ...response.data,
            type: status,
            fileList,
            file_type,
            ...size
          });
        } else {
          this.props.onSuccess && this.props.onSuccess({
            type: 'removed',
            fileList: [],
            file_type: 1
          });
        }
      } else {
        message.error(response.message);
        if (this.props.onSuccess) {
          this.props.onSuccess({
            type: 'removed',
            fileList,
            file_type
          });
        }
      }
    }
    if (status === 'removed') {
      if (this.props.onSuccess) {
        this.props.onSuccess({
          type: status,
          fileList,
          file_type
        });
      }
    }
  };

  render() {
    const { limitWidthHeight, type, disabled } = this.props;
    const limitImgWidth = limitWidthHeight.width;
    const limitImgHeight = limitWidthHeight.height;
    if (type === 'look') {
      return <Upload {...this.state} disabled />;
    }
    return (
      <React.Fragment>
        <Dragger
          {...this.state}
          action={`${API_BASE}file_upload`}
          beforeUpload={this.beforeUpload}
          onChange={this.onChange}
          className={disabled ? 'ant-dragger hide' : ''}
        >
          {
            disabled ? '' : <React.Fragment>
              <p className="ant-upload-drag-icon">
                <Icon
                  type="inbox"
                  style={this.props.disabled ? { color: 'rgba(0,0,0,.43)' } : null}
                />
              </p>
              <p
                className="upload-text"
                style={this.props.disabled ? { color: 'rgba(0,0,0,.45)' } : null}
              >
                點擊或將文件拖拽到這裡上傳
              </p>
              <p className="upload-hint">支持圖片格式：JPG / PNG / JPEG</p>
              {/* eslint-disable-next-line react/jsx-closing-tag-location */}
            </React.Fragment>
          }
        </Dragger>
        <p
          style={Object.assign(
            {},
            {
              color: 'rgba(0,0,0,0.45)',
              marginTop: '-25px',
            },
            this.props.noteStyle
          )}
        >
          {this.props.fixedSize ?
            `請上傳圖片像素爲 ${limitImgWidth}*${limitImgHeight}的 jpg、png、jpeg圖片` :
            `請上傳圖片像素最少達 ${limitImgWidth}*${limitImgHeight}的 jpg、png、jpeg圖片`}
        </p>
      </React.Fragment>
    );
  }
}

export default connect(({ auth }) => ({
  auth: auth.toJS()
}))(NewUpload);
