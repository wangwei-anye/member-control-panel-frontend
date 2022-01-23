import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Modal } from 'antd';
import PreviewPDFComponent from 'components/PreviewPDFComponent';

class PreviewComponent extends React.PureComponent {
  static propTypes = {
    previewFileType: PropTypes.number.isRequired,
    previewUrl: PropTypes.string.isRequired,
    previewVisible: PropTypes.bool.isRequired,
    handleCancel: PropTypes.func.isRequired
  };

  render() {
    const {
      previewFileType,
      previewUrl,
      previewVisible,
      handleCancel
    } = this.props;
    if (previewFileType === 2) {
      return previewVisible ? (
        <PreviewPDFComponent
          fileUrl={previewUrl}
          fileType="application/pdf"
          closeFn={handleCancel}
        />
      ) : (
        ''
      );
    }
    return (
      <Modal
        visible={previewVisible}
        width={680}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: '100%' }} src={previewUrl} />
      </Modal>
    );
  }
}

export default connect(({ auth }) => ({
  auth: auth.toJS()
}))(PreviewComponent);
