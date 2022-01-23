/* eslint-disable */
import React from 'react';
import { Modal, Button, Avatar } from 'antd';
import Upload from 'components/Upload';
import Cropper from 'react-cropper';
import { HEADER_TOKEN_NAME, API_BASE } from 'constants';
import 'cropperjs/dist/cropper.css';
import './uploadHead.less';

class UploadHead extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: '',
      fileName: '',
    };
    this.cropImage = this.cropImage.bind(this);
  }

  getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 文件上传成功事件
  fileUploadSuccessAction = async (values) => {
    const {
      path,
      type,
      fileList,
      file_type,
      file_name,
      absolute_path,
    } = values;
    if (type === 'done' && fileList.length > 0) {
      const previewUrl = await this.getBase64(
        fileList[fileList.length - 1].originFileObj
      );
      this.setState({
        fileName: file_name,
        path: previewUrl,
      });
    }
  };

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  cropImage = async () => {
    const { fileName } = this.state;
    const { onSuccess } = this.props;
    if (!this.cropper.getCroppedCanvas()) {
      return false;
    }
    const croppedCanvas = this.dataURLtoFile(
      this.cropper.getCroppedCanvas().toDataURL(),
      fileName
    );
    // 创建提交表单数据对象
    const filedata = new FormData();
    // 添加要上传的文件
    filedata.append('file_type', 1);
    filedata.append('file', croppedCanvas, croppedCanvas.name);
    try {
      // 接口
      const res = await this.uploadFile(filedata);
      if (res.status && res.code === 0) {
        onSuccess(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  uploadFile = (file) => {
    return fetch(`${API_BASE}file_upload`, {
      body: file,
      credentials: 'include',
      headers: {
        [HEADER_TOKEN_NAME]: this.props.jwt,
      },
      method: 'POST',
    }).then((response) => response.json());
  };

  render() {
    const { path } = this.state;
    const { blobHeadUrl } = this.props;
    return (
      <Modal
        maskClosable={false}
        visible
        width={550}
        height={300}
        title={null}
        footer={null}
        onCancel={this.props.onCancel}
      >
        <div className="uploadHead">
          <div className="left-box">
            {path ? (
              <React.Fragment>
                <div>
                  <Cropper
                    style={{ height: 300, width: '100%' }}
                    aspectRatio={1}
                    zoomable={false}
                    preview=".uploadCrop"
                    guides={false}
                    src={path}
                    ref={(cropper) => {
                      this.cropper = cropper;
                    }}
                  />
                </div>
                <div>
                  <div className="uploadCrop" />
                </div>
              </React.Fragment>
            ) : null}
            {!path && blobHeadUrl ? (
              <img className="picture" src={blobHeadUrl} alt="avatar" />
            ) : null}
            {!path && !blobHeadUrl ? <Avatar size={300} icon="user" /> : null}
          </div>
          <div className="right-box">
            <div className="txt">拖動圖片可選擇頭像截取範圍</div>
            <Upload
              accept="image/jpeg,image/jpg,image/png,image/gif"
              showUploadList={false}
              onSuccess={this.fileUploadSuccessAction}
              className="upload-preview"
            >
              <Button className="btn">
                {path || blobHeadUrl ? '重新上傳' : '上傳'}{' '}
              </Button>
            </Upload>
            <Button
              className="btn sure-btn"
              type="primary"
              disabled={!path}
              onClick={this.cropImage}
            >
              確認
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
}

export default UploadHead;
