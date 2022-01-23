import React from 'react';
import { Tabs, Input, Icon, message } from 'antd';
import Modal from 'components/Modal';
import Upload from 'components/Upload';
import config from 'config/editor.config';

const TabPane = Tabs.TabPane;

class Uploader extends React.Component {
  state = {
    tmpImageUrl: '',
    tmpImageWidth: '',
    tmpImageHeight: ''
  };

  handleInsertImage = () => {
    const { tmpImageUrl, tmpImageWidth, tmpImageHeight } = this.state;
    const { selectionIndex } = this.props;
    const ops = [
      {
        attributes: {
          width: tmpImageWidth,
          height: tmpImageHeight
        },
        insert: {
          image: tmpImageUrl
        }
      }
    ];
    if (selectionIndex > 0) {
      ops.unshift({ retain: selectionIndex });
    }
    if (tmpImageUrl) {
      this.props.quill.updateContents({ ops });
      this.props.quill.setSelection(selectionIndex + 1);
    }
    this.props.onClose();
  };

  handleUploaderChange = info => {
    if (info.file.status === 'done') {
      const res = info.file.response;
      try {
        let url = res;
        config.uploader.responseUrlField
          .split('.')
          .forEach(key => (url = url[key]));
        this.setState({
          tmpImageUrl: url
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  beforeUpload = file => {
    const MB = config.uploader.fileSizeLimitMB;
    const isLtMB = file.size / 1024 / 1024 < MB;
    if (!isLtMB) {
      message.error(`圖片大小不能超過${MB}M`);
    }
    return isLtMB;
  };

  render() {
    const { tmpImageUrl } = this.state;
    const { uploaderAdditionData } = this.props;
    return (
      <Modal
        title="圖片編輯"
        visible={this.props.visible}
        onCancel={this.props.onClose}
        onOk={this.handleInsertImage}
      >
        <Tabs>
          {config.uploader.localPicture ? (
            <TabPane tab="本地上傳" key="1">
              <Upload
                className="image-uploader"
                action={config.uploader.action}
                showUploadList={false}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                beforeUpload={this.beforeUpload}
                data={uploaderAdditionData || config.uploader.additionData}
                onChange={this.handleUploaderChange}
              >
                {tmpImageUrl ? (
                  <img src={tmpImageUrl} alt="" className="image" />
                ) : (
                  <Icon type="plus" className="image-uploader-trigger" />
                )}
              </Upload>
            </TabPane>
          ) : null}
          {config.uploader.onlinePicture ? (
            <TabPane tab="網絡圖片" key="2">
              圖片地址：<Input
                placeholder="http://"
                onChange={e => this.setState({ tmpImageUrl: e.target.value })}
              />
            </TabPane>
          ) : null}
        </Tabs>
        <div style={{ marginTop: 20 }}>
          寬度：<Input
            style={{ marginRight: 20, width: 60 }}
            onChange={e => this.setState({ tmpImageWidth: e.target.value })}
          />
          高度：<Input
            style={{ width: 60 }}
            onChange={e => this.setState({ tmpImageHeight: e.target.value })}
          />
        </div>
      </Modal>
    );
  }
}

export default Uploader;
