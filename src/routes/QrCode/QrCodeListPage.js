import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  message,
  Form,
  Input,
  Row,
  Col,
  Button,
  Card,
  DatePicker,
  Modal,
  Select,
  Dropdown,
  Menu,
} from 'antd';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import qs from 'qs';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import { updateCustomStatusRequest } from 'services/integralManage/give/give';
import { formatFormData, convertValidDateToText } from 'utils/tools';
import { DEFAULT_PAGE_SIZE, API_BASE } from 'constants';
import LoadingCom from 'components/LoadingCom';
import { getToken } from 'utils/session';
import eventEmmiter from 'utils/events';
import './index.less';

const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;

const { RangePicker } = DatePicker;
// 表单项布局
const formItemLayout = {
  labelCol: {
    xs: 8,
    sm: 7,
    md: 6,
    lg: 5,
    xl: 4,
    xxl: 3,
  },
  wrapperCol: {
    xs: 16,
    sm: 17,
    md: 18,
    lg: 19,
    xl: 20,
    xxl: 21,
  },
};
// 状态:1发放中,2审批中,3即将开始,4已驳回,5已停发,0未完成,-1已失效,-2已废弃,999全部
const status2Json = {
  '-1': {
    name: '已失效',
    className: 'status-lose',
  },
  0: {
    name: '已取消',
    className: 'status-undone',
  },
  1: {
    name: '發放中',
    className: 'status-give',
  },
  2: {
    name: '審批中',
    className: 'status-approve',
  },
  20: {
    name: '審批中',
    className: 'status-approve',
  },
  22: {
    name: '審批中',
    className: 'status-approve',
  },
  3: {
    name: '未開始',
    className: 'status-soon',
  },
  4: {
    name: '已駁回',
    className: 'status-reject',
  },
  21: {
    name: '已駁回',
    className: 'status-reject',
  },
  5: {
    name: '已停用',
    className: 'status-stop',
  },
  6: {
    name: '預處理中',
    className: 'status-soon',
  },
};

const QR_CODE_STATUS_JSON = {
  '-1': '已失效',
  0: '已取消',
  1: '發放中',
  2: '審批中',
  3: '未開始',
  4: '已駁回',
  5: '已停用',
};

class QrCodeListPage extends React.Component {
  state = {
    dateString: [],
    currentPage: 1,
  };

  columns = [
    {
      title: '發放項ID',
      dataIndex: 'id',
    },
    {
      title: '名稱',
      dataIndex: 'entry_name',
    },
    {
      title: '編輯人',
      dataIndex: 'edit_name',
    },
    {
      title: '發出積分有效期',
      render: (text, record) => {
        const { offer_points_valid_date } = record;
        return convertValidDateToText(offer_points_valid_date);
      },
    },
    {
      title: '審批狀態',
      render: (text, record) => {
        if (
          record.offer_policy_entry_id === 0 &&
          (record.status === 1 || record.status === 3)
        ) {
          return <span className="u-status status-stop">發放異常</span>;
        }
        return (
          <span
            className={[
              'u-status',
              status2Json[record.status]
                ? status2Json[record.status].className
                : 'status-lose',
            ].join(' ')}
          >
            {status2Json[record.status]
              ? status2Json[record.status].name
              : '已失效'}
          </span>
        );
      },
    },
    {
      title: '更新時間',
      dataIndex: 'edit_time',
    },
    {
      title: '領取記錄',
      render: (record) => {
        return this.renderRecordLinkDom(record);
      },
    },
    {
      title: '下載 QR Code',
      render: (record) => {
        return (
          <AuthBtnCom authList={record.permission} currrentAuth="download">
            {this.renderDownloadWayMenu(record)}
          </AuthBtnCom>
        );
      },
    },
    {
      title: '操作',
      width: 200,
      render: (record) => {
        return this.renderOperation(record);
      },
    },
  ];

  async componentDidMount() {
    const { query } = this.props.system;
    const { group_id, app_id, out_sn, req_at, signature } = query;
    if (app_id) {
      sessionStorage.setItem('MCP_01_OUT_APP_ID', app_id);
    }
    if (out_sn) {
      sessionStorage.setItem('MCP_01_OUT_OUT_SN', out_sn);
    }
    if (req_at) {
      sessionStorage.setItem('MCP_01_OUT_REQ_AT', req_at);
    }
    if (signature) {
      sessionStorage.setItem('MCP_01_OUT_SIGNATURE', signature);
    }
    // NOTE: 根据后端需求: qrcode 的 group_id 写死为 2;
    if (group_id) {
      this.groupId = group_id;
    } else {
      this.groupId = 2;
    }
    this.handleKeyupEvent();
  }

  componentWillUnmount() {
    // NOTE: remove Listeners
    eventEmmiter.removeAllListeners();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { time, status } = values;
      if (this.checkSearchItemValueValidate(values) || time || status) {
        return this.handleSearchBtn();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { id, entry_name } = values;
    let isValid = false;
    if (id !== null && id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字ID');
        return false;
      }
    }

    const _entry_name = entry_name.trim();
    if (_entry_name) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  renderOperation(record) {
    return (
      <span className="m-operation-wrap">
        {this.lookDetailReactDom(record)}
      </span>
    );
  }

  renderDownloadWayMenu(record) {
    const { status, qr_code_url_png, qr_code_url_svg } = record;
    const token = getToken();
    const MENU = (
      <Menu>
        <Menu.Item>
          <a
            download
            href={`${API_BASE}qr_code/download?path=${encodeURIComponent(
              qr_code_url_svg
            )}&download=1&mc-admin-api-key=${token}&action=download`}
          >
            下載 SVG 文件
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            download
            href={`${API_BASE}qr_code/download?path=${encodeURIComponent(
              qr_code_url_png
            )}&download=1&mc-admin-api-key=${token}&action=download`}
          >
            下載 PNG 文件
          </a>
        </Menu.Item>
      </Menu>
    );

    // 已失效，未开始，发放中，已停用，可以下载
    if (new Set([0, 2, 4]).has(status)) {
      return (
        <span className="m-operation-wrap">
          <span className="u-operation-item u-color-dark">點擊下載</span>
        </span>
      );
    }
    return (
      <Dropdown overlay={MENU}>
        <span className="m-operation-wrap">
          <span className="u-operation-item u-color-blue">點擊下載</span>
        </span>
      </Dropdown>
    );
  }

  renderRecordLinkDom(record) {
    return (
      <span className="m-operation-wrap">
        <AuthBtnCom authList={record.permission} currrentAuth="account_list">
          <span
            className="u-operation-item u-color-blue"
            onClick={() => this.jumpToRecordPage(record)}
          >
            領取記錄
          </span>
        </AuthBtnCom>
      </span>
    );
  }

  jumpToRecordPage(record) {
    if (!record.id) {
      return;
    }
    const { id } = record;
    this.props.history.push(`/qr_code/record?offer_entry_id=${id}`);
  }

  lookDetailReactDom(record) {
    return (
      <React.Fragment>
        <AuthBtnCom authList={record.permission} currrentAuth="entry_detail">
          <span
            className="u-operation-item u-color-blue"
            onClick={() => this.jumpToDetailActionLink(record)}
          >
            查看
          </span>
        </AuthBtnCom>
        {this.renderStatusActionBtnReactDom(record)}
      </React.Fragment>
    );
  }

  getStatusActionText(status) {
    let text = '';
    let classNameStr = '';
    switch (status) {
      // 审批中
      case 2:
        text = '取消申請';
        classNameStr = 'u-color-red';
        break;
      // 发放中
      case 3:
      case 1:
        text = '停用';
        classNameStr = 'u-color-red';
        break;
      // 已停用
      case 5:
        text = '啓用';
        classNameStr = 'u-color-blue';
        break;
      default:
        text = '';
        classNameStr = '';
        break;
    }
    return { text, classNameStr };
  }

  renderStatusActionBtnReactDom(record) {
    const { status } = record;
    const { text, classNameStr } = this.getStatusActionText(status);
    if (!text) {
      return '';
    }
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="update_status">
        <span
          className={`u-operation-item ${classNameStr}`}
          onClick={() => this.handleClickLink(record)}
        >
          {text}
        </span>
      </AuthBtnCom>
    );
  }

  handleClickLink(record) {
    if (!record.id) {
      return;
    }
    const { status } = record;
    switch (status) {
      // 审批中
      case 2:
        this.handleCancelRequest(record);
        break;
      // 发放中
      case 3:
      case 1:
        this.handleStop(record);
        break;
      // 已停用
      case 5:
        this.handleStart(record);
        break;
      default:
        break;
    }
  }

  handleCancelRequest(record) {
    this.showConfirmDialog(record, 'cancel');
  }

  handleStart(record) {
    this.showConfirmDialog(record, 'recover_offer');
  }

  handleStop(record) {
    this.showConfirmDialog(record, 'stop');
  }

  showConfirmDialog(record, type) {
    const self = this;
    const content2Json = {
      recover_offer: '確定要恢復發放該項嗎?',
      cancel: '確定要取消該項嗎?',
      stop: '確定要停發該項嗎?',
    };
    confirm({
      title: '提示',
      content: content2Json[type],
      onOk() {
        return new Promise(async (resolve) => {
          const postData = {
            id: record.id,
            action: type,
          };
          if (type === 'stop' || type === 'recover_offer') {
            postData.offer_policy_entry_id = record.offer_policy_entry_id;
          }
          const { data } = await updateCustomStatusRequest(postData);
          resolve();
          if (data.status) {
            const { qrcode, history, location } = self.props;
            const {
              listInfo: { total },
            } = qrcode;
            const {
              system: { query },
            } = self.props;
            let page = query.page;
            const pageSize = query.pageSize;
            if (page > 1 && total % pageSize === 1) {
              // eslint-disable-next-line operator-assignment
              page = page - 1;
            }
            query.page = page;
            const querystring = qs.stringify(query);
            history.push({ ...location, search: `?${querystring}` });
          }
        });
      },
    });
  }

  jumpToDetailActionLink(record) {
    if (!record.id) {
      return;
    }
    this.props.history.push(`/qr_code/config?id=${record.id}&type=look`);
  }

  // 搜索
  handleSearchBtn = () => {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.start_time = moment(values.time[0]).format('YYYY-MM-DD HH:mm:ss');
        query.end_time = moment(values.time[1]).format('YYYY-MM-DD HH:mm:ss');
      }

      if (query.status && query.status === '全部') {
        delete query.status;
      }
      query.page = 1;
      delete query.time;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  handleResetBtn = () => {
    const {
      history,
      location,
      system: { query },
    } = this.props;
    const _query = { page: query.page || 1, pageSize: query.pageSize || 10 };
    const querystring = qs.stringify(_query);
    history.push({ ...location, search: `?${querystring}` });
  };

  pageChange = (pagination) => {
    const { history, location, system } = this.props;
    this.setState({
      currentPage: pagination.current,
    });
    let query = system.query;
    query = {
      ...query,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  };

  renderStatusOptions() {
    return Object.keys(QR_CODE_STATUS_JSON).map((item) => {
      return (
        <Option key={item} value={item}>
          {QR_CODE_STATUS_JSON[item]}
        </Option>
      );
    });
  }

  render() {
    const { qrcode } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {
      listInfo: { total, list, loading },
    } = qrcode;
    const { currentPage } = this.state;
    const {
      query: { status, id, entry_name, start_time, end_time },
    } = this.props.system;
    return (
      <div className="p-fixed-list-wrap p-give-wrap">
        <div className="give-content-wrap">
          <FoldableCard
            className="qr-code-card"
            bodyStyle={{ borderTop: '1px solid #e8e8e8' }}
            title="搜索條件"
          >
            <Form>
              <Row gutter={48}>
                <Col span={11}>
                  <FormItem label="編號：" {...formItemLayout}>
                    {getFieldDecorator('id', {
                      initialValue: id || '',
                      rules: [
                        {
                          pattern: /^\d*$/g,
                          message: '請輸入純數字ID',
                        },
                      ],
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="名稱：" {...formItemLayout}>
                    {getFieldDecorator('entry_name', {
                      initialValue: entry_name || '',
                    })(<Input placeholder="請輸入事件描述關鍵字" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="更新時間：" {...formItemLayout}>
                    {getFieldDecorator('time', {
                      initialValue: start_time
                        ? [moment(start_time), moment(end_time)]
                        : '',
                    })(<RangePicker showTime style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="狀態：" {...formItemLayout}>
                    {getFieldDecorator('status', {
                      initialValue: status || undefined,
                    })(
                      <Select
                        placeholder="請選擇"
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentNode
                        }
                        ref={this.selectRef}
                        onChange={this.selectChangeHandle}
                      >
                        <Option key={999} value="全部">
                          全部
                        </Option>
                        {this.renderStatusOptions()}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col
                  span={24}
                  style={{
                    textAlign: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Button
                    type="primary"
                    icon="search"
                    onClick={this.handleSearchBtn}
                    style={{ marginRight: 20 }}
                  >
                    搜索
                  </Button>
                  <ResetBtn
                    form={this.props.form}
                    onReset={this.handleResetBtn}
                  />
                </Col>
              </Row>
            </Form>
          </FoldableCard>
          <Card
            bordered={false}
            bodyStyle={{ padding: '10px 20px' }}
            style={{ marginTop: '24px' }}
            title="QR Code 列表"
            extra={
              <AuthWrapCom
                authList={['operation_manage', 'qr_code', 'add_entry']}
              >
                <Button
                  icon="plus"
                  type="primary"
                  onClick={() => {
                    this.props.history.push(
                      `/qr_code/config?group_id=${this.groupId}`
                    );
                  }}
                >
                  創建 QR Code
                </Button>
              </AuthWrapCom>
            }
          >
            {loading ? (
              <LoadingCom />
            ) : (
              <Table
                rowKey="id"
                columns={this.columns}
                dataSource={list}
                pagination={{ total, showSizeChanger: true, page: currentPage }}
                onChange={this.pageChange}
              />
            )}
          </Card>
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(({ qrcode, system, auth }) => ({
    qrcode: qrcode.toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(Form.create()(QrCodeListPage))
);
