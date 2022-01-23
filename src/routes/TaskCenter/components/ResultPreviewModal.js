import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Modal, Icon } from 'antd';
import Datasheet from 'react-datasheet';
import _map from 'lodash/map';
import _indexOf from 'lodash/indexOf';
import 'react-datasheet/lib/react-datasheet.css';
import { WORD_LIST } from 'constants';
import ee, { TASK_CENTER_PREVIEW } from 'utils/events';
import { str2Md5 } from 'utils/tools';
import './resultpreviewmodal.less';

const Cell = (props) => {
  const style = {};
  let color = '';
  if (_indexOf(['1', '2', '3'], props.cell.color) > -1) {
    color = '#0000FF';
  } else if (_indexOf(['4', '5'], props.cell.color) > -1) {
    color = '#008000';
  }
  if (props.cell.color !== '') {
    style.color = color;
  }
  return (
    <span className="value-viewer" style={style}>
      {props.cell.value}
    </span>
  );
};

@connect(({ taskCenter }) => {
  return {
    taskCenter,
  };
})
export default class ResultPreviewModal extends React.Component {
  constructor(props) {
    super(props);
    this.scrollRef = React.createRef();
    const { clientWidth, clientHeight } = document.body;
    const columnCount = Math.round((clientWidth - 50) / 160);
    const firstRow = this.getFirstRow(columnCount);
    const pageSize = this.getInitPageSize(clientHeight);
    this.state = {
      width: 520,
      height: 500,
      list: [],
      total: 1,
      page: 0,
      pageSize,
      password: null,
      loadMore: false,
      hasOpened: false,
      firstRow,
    };
  }
  static propTypes = {
    id: PropTypes.number,
    visible: PropTypes.bool.isRequired,
    fileName: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    onDownload: PropTypes.func,
  };
  static defaultProps = {
    fileName: '加載中...',
    id: null,
    onDownload: () => {},
  };
  getFirstRow = (count) => {
    const firstRow = [{ value: '' }];
    const wordV = WORD_LIST.slice(0, count).map((item) => ({ value: item }));
    return firstRow.concat(wordV);
  };
  getInitPageSize = (clientHeight) => {
    const cellHeight = 22;
    const rowCount = Math.floor(clientHeight / 22) - 1;
    return rowCount;
  };
  componentDidMount = () => {
    this.setState({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    });
    window.addEventListener('resize', this.resizeModal);
    ee.on(TASK_CENTER_PREVIEW, this.fetchFirstList);
  };
  // 滚动加载
  handleScroll = async () => {
    if (this.scrollRef) {
      const scrollRef = this.scrollRef.current;
      // 距离底部50的时候下载下一页
      if (
        scrollRef.scrollTop + scrollRef.clientHeight + 50 >=
        scrollRef.scrollHeight
      ) {
        await this.loadMore();
      }
    }
  };
  loadMore = async () => {
    if (this.state.loadMore) {
      return;
    }
    const result = await this.fetchList();
  };
  // 获取第一页预览内容
  fetchFirstList = async (password, cb) => {
    await this.setState({
      password,
    });
    // 获取数据并且返回结果，根据结果是否显示要打开预览弹窗
    const result = await this.fetchList();
    // TODO 待antd升級處理 hack解決modal如果不打開不渲染children的問題
    cb && cb(result);
    if (cb) {
      const isOpen = await cb(result);
      if (isOpen && !this.state.hasOpened) {
        await this.setState({
          hasOpened: true,
        });
        setTimeout(() => {
          if (this.scrollRef.current) {
            const scrollRef = this.scrollRef.current;
            scrollRef.addEventListener('scroll', this.handleScroll);
          }
        }, 0);
      }
    }
  };
  resizeModal = () => {
    this.setState({
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    });
  };
  componentWillUnmount = () => {
    window.removeEventListener('resize', this.resizeModal);
    ee.removeListener(TASK_CENTER_PREVIEW, this.fetchFirstList);
    if (this.scrollRef && this.scrollRef.current) {
      const scrollRef = this.scrollRef.current;
      scrollRef.removeEventListener('scroll', this.handleScroll);
    }
  };
  handleClose = () => {
    this.props.onClose();
  };
  handleDownload = () => {
    if (this.state.password) {
      this.props.onDownload(this.props.id, 'download', this.state.password);
    } else {
      this.props.onDownload(this.props.id, 'download');
    }
  };
  resetModal = () => {
    this.setState({
      list: [],
      total: 1,
      page: 0,
      pageSize: 50,
      password: null,
      loadMore: false,
    });
  };
  fetchList = async () => {
    const { page, pageSize, total } = this.state;
    const { password } = this.state;
    if (page * pageSize >= total) {
      return;
    }
    const payload = {
      id: this.props.id,
      page: page + 1,
      limit: this.state.pageSize,
    };
    if (password) {
      payload.password = str2Md5(password);
    }
    await this.setState({ loadMore: true });
    // 獲取數據
    const result = await this.props.dispatch({
      type: 'taskCenter/previewList',
      payload,
    });
    if (result.data.status) {
      const list = result.data.data.data;
      const newTotal = result.data.data.total;
      this.setState({
        list: [...this.state.list, ...list],
        total: newTotal,
        page: this.state.page + 1,
      });
    }
    this.setState({
      loadMore: false,
    });
    return result;
  };
  buildTitle = (temp) => {
    const title = [{ value: 1, readOnly: true }];
    title.push(
      ...[
        { value: '會員ID（索引）', readOnly: true },
        { value: '手機號（索引）', readOnly: true },
        { value: '郵箱（索引）', readOnly: true },
        { value: '', readOnly: true },
      ]
    );
    if (temp.account_id !== undefined) {
      title.push({ value: '會員ID', readOnly: true });
    }
    if (temp.telephone !== undefined) {
      title.push({ value: '手機號', readOnly: true });
    }
    if (temp.email !== undefined) {
      title.push({ value: '郵箱', readOnly: true });
    }
    if (temp.nick_name !== undefined) {
      title.push({ value: '會員暱稱', readOnly: true });
    }
    if (temp.reg_time !== undefined) {
      title.push({ value: '註冊時間', readOnly: true });
    }
    if (temp.reg_status !== undefined) {
      title.push({ value: '是否註冊/綁定01帳號', readOnly: true });
    }
    if (temp.status !== undefined) {
      title.push({ value: '帳號狀態', readOnly: true });
    }
    const firstRow = this.state.firstRow;
    if (title.length > firstRow.length) {
      this.setState({
        firstRow: this.getFirstRow(title.length),
      });
    } else {
      const les = firstRow.length - title.length;
      for (let index = 0; index < les; index += 1) {
        // eslint-disable-line
        title.push({ value: '', readOnly: true });
      }
    }
    return title;
  };
  buildItem = (index, temp) => {
    const result = [{ value: index + 2, readOnly: true }];
    result.push(
      ...[
        {
          value: temp.index_account_id,
          color: temp.high_light_field === '1' ? temp.high_light_field : '',
          readOnly: true,
        },
        {
          value: temp.index_telephone,
          color:
            temp.high_light_field === '2' || temp.high_light_field === '4'
              ? temp.high_light_field
              : '',
          readOnly: true,
        },
        {
          value: temp.index_email,
          color:
            temp.high_light_field === '3' || temp.high_light_field === '5'
              ? temp.high_light_field
              : '',
          readOnly: true,
        },
        { value: '', readOnly: true },
      ]
    );
    if (temp.account_id !== undefined) {
      result.push({ value: temp.account_id, readOnly: true });
    }
    if (temp.telephone !== undefined) {
      result.push({ value: temp.telephone, readOnly: true });
    }
    if (temp.email !== undefined) {
      result.push({ value: temp.email, readOnly: true });
    }
    if (temp.nick_name !== undefined) {
      result.push({ value: temp.nick_name, readOnly: true });
    }
    if (temp.reg_time !== undefined) {
      result.push({ value: temp.reg_time, readOnly: true });
    }
    if (temp.reg_status !== undefined) {
      const REG_STATUS = ['未註冊', '已註冊'];
      result.push({ value: REG_STATUS[temp.reg_status], readOnly: true });
    }
    if (temp.status !== undefined) {
      const STATUS = {
        0: '未知',
        1: '正常',
        2: '被合併',
        3: '被禁用',
      };
      if (temp.status === 0 && temp.reg_status === 0) {
        result.push({ value: '', readOnly: true });
      } else {
        result.push({ value: STATUS[temp.status], readOnly: true });
      }
    }
    const firstRow = this.state.firstRow;
    if (result.length < firstRow.length) {
      const les = firstRow.length - result.length;
      for (let subIndex = 0; subIndex < les; subIndex += 1) {
        // eslint-disable-line
        result.push({ value: '', readOnly: true });
      }
    }
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
    // 表頭
    result.push(title);
    // 內容
    for (let index = 0; index < list.length; index += 1) {
      // eslint-disable-line
      const element = list[index];
      const item = this.buildItem(index, element);
      result.push(item);
    }
    return result;
  };

  render() {
    const { fileName, id } = this.props;
    const list = this.buildList(this.state.list);
    const combineList = [this.state.firstRow, ...list];
    return (
      <Modal
        style={{ top: 0, padding: 0 }}
        bodyStyle={{
          padding: 0,
          height: this.state.height + 'px',
          background: '#f8f8f8',
        }}
        width={this.state.width}
        title={null}
        visible={this.props.visible}
        onCancel={this.handleClose}
        keyboard={false}
        maskClosable={false}
        closable={false}
        footer={null}
        afterClose={this.resetModal}
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
            <Icon
              type="download"
              className="c-result-preview--download"
              onClick={this.handleDownload}
            />
          </div>
          <div
            className="c-result-preview__content"
            ref={this.scrollRef}
            style={{
              height: this.state.height - 60 + 'px',
              overflowY: 'scroll',
            }}
          >
            <Datasheet
              data={combineList}
              valueRenderer={(cell) => cell.value}
              valueViewer={Cell}
            />
          </div>
        </div>
      </Modal>
    );
  }
}
