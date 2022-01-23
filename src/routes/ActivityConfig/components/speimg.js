import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Icon, Modal, message, Spin, Button } from 'antd';
import { HEADER_TOKEN_NAME } from 'constants';
import { getImgRequest, fileUpload } from 'services/promotion';
import styles from './styles.less';

export default class SpeImg extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    token: PropTypes.string,
    disabled: PropTypes.bool,
    minHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number
  };
  static defaultProps = {
    token: null,
    disabled: false,
    minHeight: 342,
    maxHeight: 342,
    minWidth: 1029,
    maxWidth: 1029
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      previewVisible: false,
      previewImage: '',
      url: ''
    };
    this.fileReader = null;
    this.removeTimer = null;
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.value &&
      nextProps.value[1] &&
      nextProps.value[1] !== this.props.value[1] &&
      !this.state.url.startsWith('/') &&
      (nextProps.value[1] + '').startsWith('http')
    ) {
      getImgRequest(nextProps.value[1])
        .then(blob => {
          this.setState({
            url: URL.createObjectURL(blob)
          });
        })
        .catch(() => {
          this.setState({
            loading: false,
            url: nextProps.value[1]
          });
        });
    }
  }

  async componentDidMount() {
    const [prizeImg, prizeImgUrl] = this.props.value;
    if (prizeImgUrl) {
      try {
        const blob = await getImgRequest(prizeImgUrl);
        this.setState({
          url: URL.createObjectURL(blob),
          loading: false
        });
      } catch (error) {
        this.removeTimer = setTimeout(() => {
          this.setState({
            loading: false,
            url: prizeImgUrl
          });
        });
      }
    } else {
      this.setState({
        loading: false
      });
    }
  }

  componentWillUnmount() {
    this.fileReader = null;
    if (this.removeTimer) {
      clearTimeout(this.removeTimer);
    }
  }

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = e => {
    e.stopPropagation();
    this.setState({
      previewVisible: true
    });
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  };

  handleChange = async e => {
    e.persist();
    if (!e.target.value) {
      return;
    }
    await this.setState({ loading: true });
    return new Promise((resolve, reject) => {
      const file = e.target.files[0];
      const { type, size } = file;
      if (size / (1024 * 1024) > 2) {
        message.error('不能上傳超過2M的附件');
        this.setState({ loading: false });
        reject();
        return;
      }
      if (!/^image\/(jpeg|jpg|png)$/.test(type)) {
        message.error('暫支持jpg、png、jpeg格式圖片上傳！');
        this.setState({ loading: false });
        reject();
        return;
      }

      this.fileReader = new FileReader();
      this.fileReader.readAsDataURL(file);
      this.fileReader.onload = ee => {
        const img = new Image();
        img.addEventListener(
          'load',
          async () => {
            const { naturalHeight, naturalWidth } = img;
            const { minHeight, minWidth, maxHeight, maxWidth } = this.props;
            const invalidWidth =
              naturalWidth < minWidth || naturalWidth > maxWidth;
            const invalidHeight =
              naturalHeight < minHeight || naturalHeight > maxHeight;
            if (invalidWidth || invalidHeight) {
              message.error(`上傳圖片品質需要为 ${minWidth}*${minHeight}`, 5);
              this.setState({ loading: false });
              this.inputRef.value = '';
              reject();
            } else {
              try {
                await this.uploadImg(file, ee.target.result);
                resolve();
              } catch (error) {
                this.inputRef.value = '';
                reject();
              }
            }
          },
          false
        );
        img.addEventListener('error', err => {
          message.error('圖片上傳失敗');
          this.inputRef.value = '';
          this.setState({ loading: false });
          reject();
        });
        img.src = ee.target.result;
      };
    });
  };

  handleDel = e => {
    e.stopPropagation();
    this.setState(
      {
        url: ''
      },
      () => {
        this.inputRef.value = '';
        this.triggerChange([]);
      }
    );
  };

  uploadImg = async (file, thumb) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('modular', 'points_area');
    formData.append('file_type', 1);
    try {
      const result = await fileUpload(formData);
      const { status, data } = await result.json();
      if (status) {
        const { path, absolute_path } = data;
        this.triggerChange([path, absolute_path]);
        this.setState({
          url: thumb
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { previewVisible, previewImage, fileList, url } = this.state;
    const uploadButton = (
      <React.Fragment>
        <Icon type="plus" />
        <div className="ant-upload-text">上傳圖片</div>
      </React.Fragment>
    );
    const headers = {
      [HEADER_TOKEN_NAME]: this.props.token
    };
    let classNameStr = styles.spewrap;
    if (url) {
      classNameStr = `${styles.spewrap} ${styles.show}`;
    }
    let iconStyles = { left: '30%' };
    if (this.props.disabled) {
      iconStyles = { left: '50%', transform: 'translate(-50%, -50%)' };
    }
    return (
      <div className={classNameStr}>
        <div className={styles.imgWrap}>
          <label htmlFor={this.props.id} className={styles.inputLabel}>
            <input
              id={this.props.id}
              type="file"
              disabled={this.props.disabled}
              className={styles.opacityImg}
              onChange={this.handleChange}
              ref={refNode => (this.inputRef = refNode)}
            />
          </label>
          <Spin spinning={this.state.loading}>
            {url === '' ? (
              <div className={styles.iconText}>
                <Icon type="plus" />
                <p>{this.state.loading ? '加載中' : '上傳文件'} </p>
              </div>
            ) : (
              <img src={url} alt="" className={styles.thumbImg} />
            )}
          </Spin>
        </div>
        {url !== '' ? (
          <React.Fragment>
            <div className={styles.floatLayer}>
              <Icon
                type="eye"
                className={styles.icon}
                onClick={this.handlePreview}
                style={iconStyles}
              />
              {this.props.disabled ? null : (
                <Icon
                  type="delete"
                  className={styles.icon}
                  onClick={this.handleDel}
                  style={{ right: '30%' }}
                />
              )}
            </div>
          </React.Fragment>
        ) : null}
        <Modal
          visible={previewVisible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={url} />
        </Modal>
      </div>
    );
  }
}
