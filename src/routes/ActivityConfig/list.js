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
import './index.less';

const formItemLayout = {
  labelCol: {
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 7,
    xxl: 6,
  },
  wrapperCol: {
    xs: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 17,
    xxl: 18,
  },
};
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const addAndUpdateRightList = [
  'operation_manage',
  'promotional_activity',
  'activity_set',
  'add_and_update',
];
const deleteRightList = ['operation_manage', 'promotional_activity', 'delete'];
const publishRightList = [
  'operation_manage',
  'promotional_activity',
  'activity_set',
  'change_status',
];
const detailRightList = ['operation_manage', 'promotional_activity', 'detail'];
const answerTotalRightList = [
  'operation_manage',
  'promotional_activity',
  'activity_set',
  'answer_total',
];

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
    const { id, title, start_time, end_time } = system.query;
    const resetFields = [];
    if (!system.id) {
      resetFields.push('id');
    }
    if (!system.title) {
      resetFields.push('title');
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
      title: '活動ID',
      dataIndex: 'id',
      width: '90px',
    },
    {
      title: '推廣活動名稱',
      dataIndex: 'title',
    },
    {
      title: '推廣活動模板類型',
      dataIndex: 'activity_type_name',
      width: '140px',
    },
    {
      title: '更新時間',
      render: (text, record) => {
        return record.updated_at || '--';
      },
    },
    {
      title: '推廣活動時間',
      render: (text, record) => {
        if (!record.online_at) {
          return '--';
        }
        return `${record.online_at}-${record.offline_at}`;
      },
    },
    {
      title: '編輯人',
      width: '120px',
      dataIndex: 'updater_name',
    },
    {
      title: '狀態',
      width: '100px',
      render: (text, record, index) => {
        return this.renderStatus(record, index);
      },
    },
    {
      title: '活動鏈接',
      width: '100px',
      render: (text, record, index) => {
        const host = '';
        const link =
          process.env.environment !== 'production'
            ? 'https://hk01-member-frontend.hktester.com/promotion/'
            : 'https://hk01-member-frontend.hk01.com/promotion/';

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
          return CopyBtn;
        }
        return (
          <Cliptoboard text={`${link}${record.id}`} onCopy={this.handleCopy}>
            {CopyBtn}
          </Cliptoboard>
        );
      },
    },
    {
      title: '操作',
      width: '160px',
      render: (text, record) => {
        return this.renderOperation(record);
      },
    },
  ];

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const { time, id, title } = form.getFieldsValue();
      if (this.checkSearchItemValueValidate(id, title) || time) {
        return this.handleSearch();
      }
    });
  }

  checkSearchItemValueValidate = (id, title) => {
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

    const _title = title.trim();
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

  renderStatus(record) {
    // status: 0未完成,1进行中,2已结束,3 積分審批中,4 審批被拒絕,6即将开始
    // 显示活动状态，共四种，其中：
    // 已发布且在有效期内，显示“进行中”；
    // 已发布但已过有效期，或已发布但点击“停止活动”时，显示“已结束”；
    // 已发布但未进入有效期，显示“即将开始”；
    // 已保存但未发布，或已发布但重新编辑后并保存时，显示”未完成“。
    const { status } = record;
    const statusMap = [
      '未完成',
      '進行中',
      '已結束',
      '積分審批中',
      '積分審批拒絕',
      '',
      '即將開始',
    ];
    return <span>{statusMap[status]}</span>;
  }

  renderOperation(record) {
    const { status, online_times, activity_type } = record;
    // status": "状态,0未完成,1进行中,2已结束,3即将开始
    switch (status) {
      case 0:
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.detailReactDomCom(record, 'edit')}
              {online_times > 0 ? null : this.deleteReactDomCom(record)}
            </span>
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'copy')}
            </span>
          </div>
        );
      case 3:
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.publishReactDomCom(record, 'cancel')}
            </span>
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'copy')}
            </span>
          </div>
        );
      case 4:
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.detailReactDomCom(record, 'edit')}
            </span>
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'copy')}
            </span>
          </div>
        );
      case 1:
      case 6:
        // 进行中
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.publishReactDomCom(record, 'cancel')}
            </span>
            <span className="m-operation-wrap">
              {activity_type === 2 ? this.answerTotalReactDomCom(record) : null}
            </span>
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'copy')}
            </span>
          </div>
        );
      case 2:
        // 已结束
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
              {this.detailReactDomCom(record, 'edit')}
            </span>
            <span className="m-operation-wrap">
              {activity_type === 2 ? this.answerTotalReactDomCom(record) : null}
            </span>
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'copy')}
            </span>
          </div>
        );
      default:
        return (
          <div className="m-operation-wrap-box">
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'look')}
            </span>
            <span className="m-operation-wrap">
              {this.detailReactDomCom(record, 'copy')}
            </span>
          </div>
        );
    }
  }

  detailReactDomCom(record, type = 'look') {
    return (
      <AuthBtnCom
        authList={record.permission}
        currrentAuth={
          type === 'look'
            ? 'detail'
            : type === 'edit'
            ? 'add_and_update'
            : 'copy'
        }
      >
        <span
          className="u-operation-item u-color-blue"
          onClick={this.handleToDetail.bind(this, record, type)}
        >
          {type === 'look' ? '查看' : type === 'edit' ? '編輯' : '複製活動'}
        </span>
      </AuthBtnCom>
    );
  }

  publishReactDomCom(record, type = 'publish') {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="change_status">
        <span
          className="u-operation-item u-color-red"
          onClick={this.handlePublishOrCancel.bind(this, record, type)}
        >
          {type === 'publish' ? '發佈' : '停止活動'}
        </span>
      </AuthBtnCom>
    );
  }

  answerTotalReactDomCom(record) {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="answer_total">
        <span
          className="u-operation-item u-color-blue"
          onClick={this.handleToAnswer.bind(this, record)}
        >
          {'答題統計'}
        </span>
      </AuthBtnCom>
    );
  }

  handleToAnswer = (record) => {
    if (!record.id) {
      return;
    }
    this.props.history.push(
      `/activity-config/statistics?activity_id=${record.id}`
    );
  };

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

  handleToDetail = (record, type = 'look') => {
    if (!record.id) {
      return;
    }
    this.props.history.push(
      `/activity-config/detail/${record.id}?action=${type}`
    );
  };

  handlePublishOrCancel = (record, type) => {
    if (!record.id) {
      return;
    }
    confirm({
      icon: 'info-circle',
      title: '',
      content:
        type === 'publish'
          ? '確定要發佈該項內容嗎？'
          : '確定要取消發佈該項內容嗎？',
      onOk: async () => {
        try {
          const { data } = await this.props.dispatch({
            type: 'activityConfig/changeStatus',
            id: record.id,
            status: type === 'publish' ? 1 : 2,
          });
          if (data.status) {
            if (type === 'publish') {
              message.success('發佈成功');
            } else {
              message.warning('取消發佈成功');
            }
            this.reloadPage();
          }
        } catch (error) {
          console.log(error);
        }
      },
    });
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
          const { data } = await this.props.dispatch({
            type: 'activityConfig/deletePromotion',
            id: record.id,
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

  handleAddShopClick = (type) => {
    const url =
      type === 'tidy'
        ? '/activity-config/add/tidy'
        : '/activity-config/add/answer';
    this.props.history.push(url);
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
      const { id, title, time } = values;
      const query = {};
      query.page = 1;
      if (time && time.length) {
        query.start_time = time[0].format('YYYY-MM-DD HH:mm:ss');
        query.end_time = time[1].format('YYYY-MM-DD HH:mm:ss');
      }
      if (id) {
        query.id = id;
      }
      if (title) {
        query.title = title;
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

  render() {
    const { listInfo } = this.props;
    const { list, total, loading } = listInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-activity-config-list-wrap">
        <FoldableCard
          title={<span>搜索條件</span>}
          // bodyStyle={{ padding: 0, paddingTop: 20 }}
        >
          <Form>
            <Row gutter={48}>
              <Col span={5}>
                <FormItem label="ID" {...formItemLayout}>
                  {getFieldDecorator('id', {
                    initialValue: query.id || '',
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
              <Col span={9}>
                <FormItem label="推廣活動名稱" {...formItemLayout}>
                  {getFieldDecorator('title', {
                    initialValue: query.title || '',
                  })(
                    <Input
                      placeholder="請輸入"
                      onPressEnter={this.handleSearch}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem label="推廣活動時間" {...formItemLayout}>
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
              <AuthWrapCom authList={addAndUpdateRightList}>
                <Button
                  icon="plus"
                  type="primary"
                  onClick={this.handleAddShopClick.bind(this, 'answer')}
                >
                  答題模板
                </Button>
              </AuthWrapCom>
              <AuthWrapCom authList={addAndUpdateRightList}>
                <Button
                  icon="plus"
                  type="primary"
                  onClick={this.handleAddShopClick.bind(this, 'tidy')}
                  style={{ marginLeft: 20 }}
                >
                  精簡模板
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
  connect(({ system, activityConfig }) => {
    return {
      listInfo: activityConfig.get('listInfo').toJS(),
      system: system.toJS(),
    };
  })(Form.create()(ListPage))
);
