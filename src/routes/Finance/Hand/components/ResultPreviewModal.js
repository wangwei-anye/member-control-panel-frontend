import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Modal, Icon } from 'antd';
import Datasheet from 'react-datasheet';
import _map from 'lodash/map';
import _indexOf from 'lodash/indexOf';
import { previewExcelList } from 'services/finance/hand/hand';
import 'react-datasheet/lib/react-datasheet.css';
import { WORD_LIST } from 'constants';
import { str2Md5 } from 'utils/tools';
import './resultpreviewmodal.less';

const Cell = props => {
  const style = {};
  if (props.cell.bgColor) {
    style.backgroundColor = props.cell.bgColor;
  }
  return (
    <span className="value-viewer" style={style}>
      {props.cell.value}
    </span>
  );
};

@connect(({ taskCenter }) => {
  return {
    taskCenter
  };
})
export default class ResultPreviewModal extends React.Component {
  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    const { clientWidth } = document.body;
    const columnCount = Math.round((clientWidth - 50) / 160);
    const firstRow = this.getFirstRow(columnCount);
    this.state = {
      width: 520,
      height: 500,
      list: [],
      firstRow
    };
  }
  static propTypes = {
    id: PropTypes.number,
    fileName: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func
  };
  static defaultProps = {
    fileName: '加載中...',
    id: null,
    onDownload: () => {}
  };
  getFirstRow = count => {
    const firstRow = [{ value: '' }];
    const wordV = WORD_LIST.slice(0, count).map(item => ({
      value: item,
      readOnly: true,
      bgColor: 'black'
    }));
    return firstRow.concat(wordV);
  };
  getInitPageSize = clientHeight => {
    const cellHeight = 22;
    const rowCount = Math.floor(clientHeight / 22) - 1;
    return rowCount;
  };
  componentDidMount = () => {
    this.setState({
      width: document.body.clientWidth,
      height: document.body.clientHeight
    });
    window.addEventListener('resize', this.resizeModal);
    this.fetchList();
  };
  fetchList = async () => {
    const result = await previewExcelList({ id: this.props.id });
    if (result.data.status) {
      const list = result.data.data;
      this.setState({
        list
      });
    }
  };

  resizeModal = () => {
    this.setState({
      width: document.body.clientWidth,
      height: document.body.clientHeight
    });
  };
  componentWillUnmount = () => {
    window.removeEventListener('resize', this.resizeModal);
  };
  handleClose = () => {
    this.props.onClose();
  };
  handleDownload = () => {
    this.props.onDownload(this.props.id);
  };
  buildTitle = temp => {
    const title = [];
    title.push(
      { value: 1, readOnly: true },
      { value: '會員ID', readOnly: true },
      { value: '發分數額', readOnly: true }
    );
    return title;
  };
  buildItem = (element, index) => {
    const result = [];
    result.push(
      { value: index + 2, readOnly: true },
      { value: element.union_id, readOnly: true },
      { value: element.amount, readOnly: true }
    );
    return result;
  };
  buildList = () => {
    const { list } = this.state;
    const result = [];
    let title = [];
    if (list.length) {
      const temp = { ...list[0] };
      title = this.buildTitle(temp);
    }
    //  導航欄
    const firstRow = this.state.firstRow;
    result.push(firstRow);
    // 表頭
    result.push(title);
    // 內容
    for (let index = 0; index < list.length; index += 1) {
      // eslint-disable-line
      const element = list[index];
      const item = this.buildItem(element, index);
      result.push(item);
    }
    return result;
  };

  render() {
    const combineList = this.buildList();
    return (
      <Modal
        style={{ top: 0, padding: 0 }}
        bodyStyle={{
          padding: 0,
          height: this.state.height + 'px',
          background: '#f8f8f8'
        }}
        width={this.state.width}
        title={null}
        visible
        onCancel={this.handleClose}
        keyboard={false}
        maskClosable={false}
        closable={false}
        footer={null}
      >
        <div className="c-result-preview">
          <div className="c-result-preview__header">
            <Icon
              type="arrow-left"
              className="c-result-preview--back"
              onClick={this.handleClose}
            />
            <Icon type="file-excel" className="c-result-preview__file-icon" />
            <span className="c-result-preview__file-name">
              {this.props.fileName}
            </span>
            {/* <Icon
              type="download"
              className="c-result-preview--download"
              onClick={this.handleDownload}
            /> */}
          </div>
          <div
            className="c-result-preview__content"
            ref={this.scrollRef}
            style={{
              height: this.state.height - 60 + 'px',
              overflowY: 'scroll'
            }}
          >
            <Datasheet
              data={combineList}
              valueRenderer={cell => cell.value}
              valueViewer={Cell}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
