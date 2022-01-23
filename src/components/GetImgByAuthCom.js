import React from 'react';
import { Modal, Icon } from 'antd';
import { getImgRequest } from 'services/common/common';
import LoadingCom from 'components/LoadingCom';
import PreviewPDFComponent from './PreviewPDFComponent';

export default class GetImgByAuth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      imgUrl: '',
      isLoading: false,
      isShow: false
    };
    this.lastPropsFileUrl = '';
  }

  componentDidMount() {
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateStateByProps(nextProps);
  }

  async updateStateByProps(newProps) {
    const fileTmpUrl = newProps.fileUrl;
    if (!fileTmpUrl) {
      return;
    }
    if (fileTmpUrl === this.lastPropsFileUrl) {
      return;
    }
    this.lastPropsFileUrl = fileTmpUrl;
    this.setState({
      isLoading: true
    });
    try {
      const res = await getImgRequest(fileTmpUrl);
      const url = URL.createObjectURL(res);
      await this.setState({
        imgUrl: url
      });
      if (this.props.onChange && typeof this.props.onChange === 'function') {
        this.props.onChange(url);
      }
    } catch (err) {
      console.log(err);
    } finally {
      this.setState({
        isLoading: false
      });
    }
  }

  componentWillUnmount() {
    URL.revokeObjectURL(this.state.imgUrl);
    this.lastPropsFileUrl = null;
  }

  handleClick() {
    if (this.state.isLoading) {
      return;
    }
    this.setState({
      isShow: true
    });
  }

  handleCancel = () => {
    this.setState({
      isShow: false
    });
  }

  getFileExt = () => {
    const { fileUrl } = this.props;
    const index = fileUrl.lastIndexOf('.');
    return fileUrl.slice(index + 1);
  }

  normalizeRender = () => {
    const ext = this.getFileExt();
    if (ext && ext.toLowerCase() === 'pdf') {
      return this.renderPDF();
    }
    return this.renderImg();
  }

  handlePreviewPDF = () => {
    this.setState({ isShow: true });
  }

  renderPDF = () => {
    const { fileUrl, fileName } = this.props;
    const { isShow } = this.state;
    return (
      <div className="item-adjunct-content" onClick={this.handlePreviewPDF}>
        <Icon type="picture" className="picture-icon" theme="twoTone" style={{ paddingRight: 10 }} />
        <span className="name">{fileName}</span>
        {
          isShow ? <PreviewPDFComponent
            fileUrl={fileUrl}
            fileType="application/pdf"
            closeFn={this.handleCancel}
          /> : ''
        }
      </div>
    );
  }

  renderImg = () => {
    const { imgUrl, isLoading, isShow } = this.state;
    return (
      <span
        style={{
          display: 'inline-block',
          border: '1px solid #ccc',
          padding: '2px'
        }}
      >
        <a onClick={() => this.handleClick()}>
          {!isLoading ? (
            <img
              src={imgUrl}
              alt="附件圖片"
              style={{
                display: 'block',
                width: '60px',
                height: '60px'
              }}
            />
          ) : (
            <LoadingCom
              style={{
                margin: '20px',
                textAlign: 'left',
                display: 'inline-block'
              }}
            />
          )}
        </a>
        <Modal
          visible={isShow}
          footer={null}
          onCancel={this.handleCancel}
          width={680}
        >
          <img alt="example" style={{ width: '100%' }} src={imgUrl} />
        </Modal>
      </span>
    );
  }

  render() {
    return this.normalizeRender();
  }
}
