import React from 'react';

export default class UploadTipAndDownTmpCom extends React.Component {
  render() {
    const style = {
      color: '#1890FF'
    };
    return (
      <div style={Object.assign({}, this.props.style, style)}>
        僅支持 jpg, png, jpeg, pdf 格式文件
        <a className="none" style={{ marginLeft: '10px' }}>
          下載模板
        </a>
      </div>
    );
  }
}
