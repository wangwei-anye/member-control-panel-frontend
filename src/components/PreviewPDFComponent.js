/**
 * 预览文件, 如 PDF, 如果是图片的预览, 这个封装请自行修改逻辑, 主要针对 PDF,
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Icon, message } from 'antd';
import './PreviewPDFComponent.less';
import { getToken } from '../utils/session';
import { addUrlArgs, middlelizeKey } from '../utils/tools';


class PreviewPDFComponent extends React.PureComponent {
  static propTypes = {
    fileUrl: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    closeFn: PropTypes.func.isRequired
  }

  handleClosePreviewLayer = (e) => {
    e.stopPropagation();
    this.props.closeFn();
  }

  componentDidMount() {
    message.loading('正在爲您加載文檔, 請耐心等待...', 0);
    // NOTE: 由于 iframe 无法监听到 error 事件, 那么这里使用定时器来模拟, 如果加载 10s 之后,
    // iframe 还没有加载成功, 说明用户当前的网络环境差, 或者是直接 timeout
    this.timer = setTimeout(() => {
      message.destroy();
      message.error('預覽失败, 請刷新重試!');
      this.props.closeFn();
    }, 10 * 1000);
  }

  componentWillUnmount() {
    setTimeout(() => {
      message.destroy();
    }, 3 * 1000);
    clearTimeout(this.timer);
    console.log('unmount');
  }

  fileLoad = () => {
    clearTimeout(this.timer);
    message.destroy();
  }

  normalizeFileUrl = (fileUrl) => {
    const token = getToken();
    return addUrlArgs(fileUrl, {
      [middlelizeKey('mc-admin-api-key')]: token,
      action: 'download'
    });
  }

  render() {
    const { fileUrl, fileType } = this.props;
    // DEBUG: src="http://member-control-panel-api.dd01.int:8000/api/1.0/web/1.0/admin/document?path=%2F_docment%2F9c90b10f2049a28a9522a8774d7e322a.pdf&mc-admin-api-key=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGF0YS1tZW1iZXItYXBpLmhrMDEuY24iLCJhdWQiOiJkYXRhLW1lbWJlciIsImlhdCI6MTU1NzIyNTY5NywidWlkIjoxMDIsImV4cCI6MTU1NzMxMjA5NywibmJmIjoxNTU3MjI1NjM3fQ.mOjycGUyeHDPEf7_gyVG0qmukgK8xME5ht4jE4_5TCsvSPqE5Bmf9v51N8fMjXl9yb8x3br0dhaTodOgye86seG1Dl5hKyPuLloXHs8zBrR8kBO_apWmuf8VSW0Yrr46bJb8wmcgp6p5ZR5ze9yTkVzU2V0xevNSCaSbuYMKz6Y&action=download"
    return (
      <div className="preview-box" onClick={this.handleClosePreviewLayer}>
        <Icon
          type="left"
          className="back-icon"
          onClick={(e) => {
            this.handleClosePreviewLayer(e);
          }}
        />
        <iframe
          src={this.normalizeFileUrl(fileUrl)}
          type={fileType}
          width="55%"
          height="100%"
          title="test"
          onLoad={this.fileLoad}
        />
      </div>
    );
  }
}

export default connect(({ auth }) => ({
  auth: auth.toJS()
}))(PreviewPDFComponent);
