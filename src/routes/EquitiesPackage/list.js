import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Card,
  Row,
  Col,
  Input,
  Button,
  DatePicker,
  Modal,
  Icon,
  message,
  Select,
} from 'antd';
import Cliptoboard from 'react-copy-to-clipboard';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import moment from 'moment';
import Table from 'components/Table';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import ResetBtn from 'components/ResetBtn';
import LoadingCom from 'components/LoadingCom';
import FoldableCard from 'components/FoldableCard';
import eventEmmiter from 'utils/events';
import { API_BASE } from 'constants';
import { setStatus, getDetail } from 'services/equitiesPackage';

import './index.less';

const formItemLayout = {
  labelCol: {
    xs: 11,
    sm: 10,
    md: 9,
    lg: 8,
    xl: 7,
    xxl: 6,
  },
  wrapperCol: {
    xs: 13,
    sm: 14,
    md: 15,
    lg: 16,
    xl: 17,
    xxl: 18,
  },
};
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Option = Select.Option;

// 状态:0-未完成 1-积分审批中 3-已结束 4-积分审批拒绝 5-进行中  8-即将开始
const status2Json = {
  0: {
    name: '未完成',
    className: 'status-undone',
  },
  1: {
    name: '積分審批中',
    className: 'status-approve',
  },
  3: {
    name: '已結束',
    className: 'status-stop',
  },
  4: {
    name: '積分審批拒絕',
    className: 'status-reject',
  },
  5: {
    name: '進行中',
    className: 'status-doing',
  },
  8: {
    name: '即將開始',
    className: 'status-soon',
  },
};

class ListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: [],
    };
  }

  componentDidMount() {
    this.handleKeyupEvent();
    window.addEventListener('popstate', this.resetByStatePop);
  }

  resetByStatePop = () => {
    const { system } = this.props;
    const {
      offer_package_id,
      package_name,
      start_time,
      end_time,
    } = system.query;
    const resetFields = [];
    if (!system.offer_package_id) {
      resetFields.push('offer_package_id');
    }
    if (!system.package_name) {
      resetFields.push('package_name');
    }
    if (!system.start_time) {
      resetFields.push('start_time', 'end_time');
    }
    this.props.form.resetFields(resetFields);
  };

  componentWillUnmount() {
    // NOTE: remove Listeners
    eventEmmiter.removeAllListeners();
    window.removeEventListener('popstate', this.resetByStatePop);
  }

  columns = [
    {
      title: '權益包ID',
      dataIndex: 'id',
      width: '90px',
    },
    {
      title: '活動時間',
      width: '250px',
      render: (record) => {
        return record.start_time + ' ~ ' + record.end_time;
      },
    },
    {
      title: '權益包名稱',
      dataIndex: 'package_name',
      width: '180px',
    },
    {
      title: '更新時間',
      dataIndex: 'updated_at',
      width: '130px',
    },
    {
      title: '編輯人',
      dataIndex: 'editor_name',
      width: '120px',
    },
    {
      title: '總份數/已兌換',
      width: '120px',
      render: (record) => {
        return record.total_amount + '/' + record.received_amount;
      },
    },
    {
      title: '狀態',
      width: '120px',
      render: (text, record) => {
        return (
          <span
            className={['u-status', status2Json[record.status].className].join(
              ' '
            )}
          >
            {status2Json[record.status].name}
          </span>
        );
      },
    },
    {
      title: '活動鏈接',
      width: '100px',
      render: (text, record, index) => {
        const host = '';
        const link =
          process.env.environment !== 'production'
            ? 'https://hk01-member-frontend.hktester.com/pointsPackage/'
            : 'https://hk01-member-frontend.hk01.com/pointsPackage/';

        const CopyBtn = (
          <div
            className={`m-link-btn ${
              record.status === 0 || record.status === 4 ? 'disabled' : ''
            }`}
          >
            <Icon type="link" />
            <span className="title">複製Link</span>
          </div>
        );
        if (record.status === 0 || record.status === 4) {
          return (
            <AuthBtnCom authList={record.permission} currrentAuth="copy_url">
              {CopyBtn}
            </AuthBtnCom>
          );
        }
        return (
          <AuthBtnCom authList={record.permission} currrentAuth="copy_url">
            <Cliptoboard text={`${link}${record.id}`} onCopy={this.handleCopy}>
              {CopyBtn}
            </Cliptoboard>
          </AuthBtnCom>
        );
      },
    },
    {
      title: '操作',
      width: '200px',
      render: (text, record) => {
        return this.renderOperation(record);
      },
    },
  ];

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const { time, offer_package_id, package_name } = form.getFieldsValue();
      if (
        this.checkSearchItemValueValidate(offer_package_id, package_name) ||
        time
      ) {
        return this.handleSearch();
      }
    });
  }

  checkSearchItemValueValidate = (offer_package_id, package_name) => {
    let isValid = false;
    if (offer_package_id !== null && offer_package_id) {
      const _id = offer_package_id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字ID');
        return false;
      }
    }

    const _title = package_name.trim();
    if (_title) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  handleCopy = () => {
    message.success('複製成功');
  };

  renderOperation(record) {
    const { status, online_times, activity_type } = record;
    const isOverEndTime = moment(record.end_time).isBefore(moment());

    switch (status) {
      case 0:
        // 未完成
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.detailReactDomCom(record, 'edit')}
              {this.deleteReactDomCom(record)}
            </span>
          </div>
        );
      case 1: // 積分審批中
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.stopReactDomCom(record)}
            </span>
          </div>
        );
      case 3: // 已結束
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.loadReactDomCom(record)}
              {isOverEndTime ? null : this.detailReactDomCom(record, 'edit')}
            </span>
          </div>
        );
      case 4: // 積分審批拒絕
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
            </span>
          </div>
        );
      case 5: // 進行中
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.loadReactDomCom(record)}
              {this.stopReactDomCom(record)}
            </span>
          </div>
        );
      case 8:
        // 即將開始
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.loadReactDomCom(record)}
              {this.stopReactDomCom(record)}
            </span>
          </div>
        );
      default:
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
            </span>
          </div>
        );
    }
  }

  detailReactDomCom(record, type = 'look') {
    if (type === 'look') {
      return (
        <AuthBtnCom authList={record.permission} currrentAuth="detail">
          <span
            className="u-operation-item u-color-blue"
            onClick={this.handleToDetail.bind(this, record, type)}
          >
            {'查看'}
          </span>
        </AuthBtnCom>
      );
    }
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="update">
        <span
          className="u-operation-item u-color-blue"
          onClick={this.handleToDetail.bind(this, record, type)}
        >
          {'編輯'}
        </span>
      </AuthBtnCom>
    );
  }

  deleteReactDomCom(record) {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="delete">
        <span
          className="u-operation-item u-color-red"
          onClick={this.handleDelete.bind(this, record)}
        >
          刪除
        </span>
      </AuthBtnCom>
    );
  }

  stopReactDomCom(record) {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="status">
        <span
          className="u-operation-item u-color-red"
          onClick={this.handleStop.bind(this, record)}
        >
          停止活動
        </span>
      </AuthBtnCom>
    );
  }

  loadReactDomCom(record) {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="download">
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.handleDownload(record)}
        >
          下載兌換碼
        </span>
      </AuthBtnCom>
    );
  }

  // check_pw验证密码,download 下载
  handleDownload = async (record) => {
    if (record.table_building_status === 2) {
      const query = { offer_package_id: record.id };
      const result = await this.props.dispatch({
        type: 'equitiesPackage/download',
        payload: query,
      });
    } else {
      const {
        data: { data, status },
      } = await getDetail({ offer_package_id: record.id });
      if (status && data) {
        if (data.table_building_status === 2) {
          const query = { offer_package_id: record.id };
          const result = await this.props.dispatch({
            type: 'equitiesPackage/download',
            payload: query,
          });
        } else {
          message.warning('兌換碼數據更新中，請稍後嘗試');
        }
      } else {
        message.warning('兌換碼數據更新中，請稍後嘗試');
      }
    }
  };

  handleToDetail = (record, type = 'look') => {
    if (!record.id) {
      return;
    }
    this.props.history.push(
      `/equities_package/detail/${record.id}?action=${type}`
    );
  };

  handleStop = async (record) => {
    if (!record.id) {
      return;
    }
    const { data } = await setStatus({
      offer_package_id: record.id,
      status: 3,
    });
    if (data.status) {
      message.warning('停止活動成功');
      this.reloadPage();
    }
  };

  handleDelete = (record) => {
    if (!record.id) {
      return;
    }
    confirm({
      icon: 'info-circle',
      title: '',
      content: '刪除操作不可恢復，你還要繼續嗎？',
      okText: '繼續',
      onOk: async () => {
        try {
          const { data } = await setStatus({
            offer_package_id: record.id,
            status: 1,
          });
          if (data.status) {
            message.warning('刪除成功');
            this.reloadPage();
          }
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  timeChangeAction = (date, dateString) => {
    this.setState({
      time: dateString,
    });
  };

  handleSearch = () => {
    const { history, location } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const { offer_package_id, package_name, time, status } = values;
      const query = {};
      query.page = 1;
      if (time && time.length) {
        query.start_time = time[0].format('YYYY-MM-DD HH:mm:ss');
        query.end_time = time[1].format('YYYY-MM-DD HH:mm:ss');
      }
      if (offer_package_id) {
        query.offer_package_id = offer_package_id;
      }
      if (package_name) {
        query.package_name = package_name;
      }
      if (status) {
        query.status = status;
      }
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  handleAddClick = () => {
    this.props.history.push('/equities_package/add?action=create');
  };

  render() {
    const { loading, total, list } = this.props.equitiesPackage.listInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;

    const statusArr = [];
    for (const key in status2Json) {
      statusArr.push(
        <Option value={key} key={key}>
          {status2Json[key].name}
        </Option>
      );
    }
    statusArr.unshift(
      <Option value="" key={111}>
        全部
      </Option>
    );
    return (
      <div className="p-activity-config-list-wrap">
        <FoldableCard
          title={<span>搜索條件</span>}
          // bodyStyle={{ padding: 0, paddingTop: 20 }}
        >
          <Form>
            <Row className="form-control-row" type="flex" gutter={48}>
              <Col span={10}>
                <FormItem label="權益包ID" {...formItemLayout}>
                  {getFieldDecorator('offer_package_id', {
                    initialValue: query.offer_package_id || '',
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字ID',
                      },
                    ],
                  })(
                    <Input
                      placeholder="請輸入"
                      onPressEnter={this.handleSearch}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem label="權益包名稱" {...formItemLayout}>
                  {getFieldDecorator('package_name', {
                    initialValue: query.package_name || '',
                  })(
                    <Input
                      placeholder="請輸入"
                      onPressEnter={this.handleSearch}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem label="活動時間" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.start_time
                      ? [moment(query.start_time), moment(query.end_time)]
                      : null,
                  })(
                    <RangePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD HH:mm:ss"
                      showTime
                      onChange={this.timeChangeAction}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem label="狀態" {...formItemLayout}>
                  {getFieldDecorator('status', {
                    initialValue: query.status || '',
                  })(
                    <Select
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                    >
                      {statusArr}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row className="form-control-row">
              <Col span={24} style={{ textAlign: 'center', marginBottom: 10 }}>
                <Button
                  icon="search"
                  type="primary"
                  style={{ marginRight: 24 }}
                  onClick={this.handleSearch}
                >
                  搜索
                </Button>
                <ResetBtn form={this.props.form} />
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="全部推廣活動"
          bordered={false}
          extra={
            <div>
              <AuthWrapCom
                authList={['operation_manage', 'points_offer_package', 'add']}
              >
                <Button
                  icon="plus"
                  type="primary"
                  onClick={this.handleAddClick}
                >
                  創建
                </Button>
              </AuthWrapCom>
            </div>
          }
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <Table
              rowKey={(row, index) => index}
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          )}
        </Card>
      </div>
    );
  }
}
export default withRouter(
  connect(({ system, equitiesPackage }) => {
    return {
      equitiesPackage: equitiesPackage.toJS(),
      system: system.toJS(),
    };
  })(Form.create()(ListPage))
);
