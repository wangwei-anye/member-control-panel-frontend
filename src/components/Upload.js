/**
 * Upload二次封闭
 * 添加SSO会话信息
 */
import React from 'react';
import { Upload, message } from 'antd';
import { connect } from 'dva';
import { HEADER_TOKEN_NAME, API_BASE } from 'constants';

const MAX_SIZE = 1024 * 1024 * 2; // 文件大小限制
const IMG_TYPE_LIST = [
  'image/jpg',
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/vnd.ms-excel',
];
class NewUpload extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: { file_type: 1 },
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
    // 添加SSO会话信息
    newProps.headers = {
      ...props.headers,
      [HEADER_TOKEN_NAME]: props.auth.jwt,
    };
    if (newProps.onSuccess) {
      delete newProps.onSuccess;
    }
    this.setState({ ...newProps });
  }

  beforeUpload = async (file, fileList) => {
    return new Promise((resolve, reject) => {
      const fileType = file.type;
      const fileSize = file.size;
      // NOTE: 根据产品需求去掉文件大小限制
      if (fileSize > MAX_SIZE) {
        message.error('不能上傳超過2M的附件');
        reject();
      }
      if (
        new Set(['application/pdf', 'application/vnd.ms-excel']).has(fileType)
      ) {
        const tempData = Object.assign({}, this.state.data, {
          file_type: 2,
        });
        this.setState({ data: tempData });
      } else {
        const tempData = Object.assign({}, this.state.data, {
          file_type: 1,
        });
        this.setState({ data: tempData });
      }
      if (!IMG_TYPE_LIST.includes(fileType)) {
        message.error('暫支持jpg、png、jpeg, pdf 格式圖片上傳！');
        const { onSuccess } = this.props;
        if (onSuccess) {
          onSuccess({
            type: 'removed',
            fileList: [],
            file_type: this.state.data.file_type,
          });
        }
        reject();
      }
      resolve();
    });
  };

  onChange = ({ file, fileList }) => {
    const { file_type } = this.state.data;
    const { status, response } = file;
    const { onSuccess } = this.props;
    // NOTE: 此处一定要setState，否则会导致onChange 的 status 一直为 uploading
    this.setState({ fileList: [...fileList] });
    if (status === 'done') {
      if (response.status) {
        if (onSuccess) {
          onSuccess({
            ...response.data,
            type: status,
            fileList,
            file_type,
          });
        }
      } else {
        message.error(response.message);
        if (onSuccess) {
          onSuccess({
            type: 'removed',
            fileList,
            file_type,
          });
        }
      }
    }
    if (status === 'removed') {
      if (onSuccess) {
        onSuccess({
          type: status,
          fileList,
          file_type,
        });
      }
    }
  };

  render() {
    return (
      <Upload
        {...this.state}
        action={`${API_BASE}file_upload`}
        beforeUpload={this.beforeUpload}
        onChange={this.onChange}
      />
    );
  }
}

export default connect(({ auth }) => ({
  auth: auth.toJS(),
}))(NewUpload);
