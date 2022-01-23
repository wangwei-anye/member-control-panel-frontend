import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import {
  Form,
  Tag,
  Row,
  Col,
  Input,
  Button,
  Card,
  DatePicker,
  Modal,
  message,
  Select,
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import eventEmmiter from 'utils/events';
import {
  addEventRequest,
  updateEventRequest,
  recoverEventRequest,
} from 'services/integralManage/event/event';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import { formatFormData, isUserHasRights } from 'utils/tools';
import AuthWrapCom from 'components/AuthCom';
import LoadingCom from 'components/LoadingCom';
import EventModal from './components/addEvent';
import './index.less';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const colorJson = {
  1: 'volcano',
  2: 'purple',
  3: 'magenta',
  4: 'orange',
  5: 'gold',
  6: 'green',
  7: 'cyan',
  8: 'blue',
  9: 'geekblue',
  10: '#108ee9',
};
const updateRightList = ['points_management', 'points_events', 'update_event']; // 更新权限list
const deleteRightList = ['points_management', 'points_events', 'delete_event']; // 更新权限list
const recoverRightList = [
  'points_management',
  'points_events',
  'recover_event',
]; // 恢复权限list
class EventListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowEventModal: false,
      isLoading: false,
      isAdd: false,
      currentEventInfo: {},
    };
  }

  componentWillUnmount() {
    eventEmmiter.removeAllListeners('keyup');
    message.destroy();
    // NOTE: 移除所有的监听者
    eventEmmiter.removeAllListeners();
  }

  columns = [
    {
      title: '事件 ID',
      dataIndex: 'id',
    },
    {
      title: '事件描述',
      dataIndex: 'event_desc',
    },
    {
      title: '上報渠道',
      dataIndex: 'report_channel',
      render: (text, record) => {
        const { reportChannelJson } = this.props.system;
        return record.report_channel_id
          .sort((a, b) => a - b)
          .map((item, idx) => {
            return (
              <Tag key={idx} color={colorJson[item] || '#2db7f5'}>
                {reportChannelJson[item] || '--'}
              </Tag>
            );
          });
      },
    },
    {
      title: '更新時間',
      dataIndex: 'update_time',
    },
    {
      title: '編輯人',
      dataIndex: 'edit_by',
    },
    {
      title: '操作',
      key: 'operation',
      render: (text, record, index) => {
        const status = +record.status;
        return (
          <span className="m-operation-wrap">
            <AuthWrapCom authList={updateRightList}>
              <span
                className="u-operation-item u-color-blue"
                onClick={() => this.editEventAction(record, index)}
              >
                編輯
              </span>
            </AuthWrapCom>
            {status === 1 ? (
              <AuthWrapCom authList={deleteRightList}>
                <span
                  className="u-operation-item u-color-red"
                  onClick={() => this.deleteEventAction(record, index)}
                >
                  刪除
                </span>
              </AuthWrapCom>
            ) : (
              <AuthWrapCom authList={recoverRightList}>
                <span
                  className="u-operation-item u-color-red"
                  onClick={() => this.deleteEventAction(record, index)}
                >
                  恢復事件
                </span>
              </AuthWrapCom>
            )}
          </span>
        );
      },
    },
  ];

  componentDidMount() {
    this.handleKeyupEvent();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { report_channel_id, time } = values;
      if (
        this.checkSearchItemValueValidate(values) ||
        time ||
        report_channel_id !== null
      ) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { id, event_desc } = values;
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

    const _event_desc = event_desc.trim();
    if (_event_desc) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  // 编辑
  editEventAction(record, index) {
    if (!record.id) {
      return;
    }
    this.setState({
      currentEventInfo: record,
      isShowEventModal: true,
      isAdd: false,
    });
  }

  // 刪除
  deleteEventAction(record, index) {
    if (!record.id) {
      return;
    }
    const recordStatus = +record.status;
    const self = this;
    const content =
      recordStatus === 1 ? '確定要刪除該事件？' : '確定要恢復該事件嗎?';
    confirm({
      title: '提示',
      content,
      onOk() {
        return new Promise(async (resolve) => {
          const { data } =
            recordStatus === 1
              ? await updateEventRequest({
                id: record.id,
                action: 'delete',
              })
              : await recoverEventRequest({
                id: record.id,
              });
          if (data.status) {
            resolve();
            const {
              system: { query },
              integralManageEvent: {
                eventListInfo: { total },
              },
            } = self.props;
            let page = query.page;
            const pageSize = query.pageSize;
            if (page > 1 && total % pageSize === 1) {
              // eslint-disable-next-line operator-assignment
              page = page - 1;
            }
            self.reloadPage(page);
          }
        });
      },
    });
  }

  searchAction = () => {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.up_start_time = moment(values.time[0]).format('YYYY-MM-DD');
        query.up_end_time = moment(values.time[1]).format('YYYY-MM-DD');
      }
      query.page = 1;
      delete query.time;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  handleModalOkAction = (value) => {
    this.addOrUpdateEvent(value);
  };

  handleModalCancelAction = (e) => {
    this.setState({
      isShowEventModal: false,
      isLoading: false,
    });
  };

  // 新增事件
  async addOrUpdateEvent(postData) {
    this.setState({
      isLoading: true,
    });
    const updateData = Object.assign({}, postData, { action: 'update' });
    const { data } = postData.id
      ? await updateEventRequest(updateData)
      : await addEventRequest(postData);
    if (data.status) {
      message.success('成功');
      this.setState({
        isLoading: false,
        isShowEventModal: false,
      });
      this.reloadPage();
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  // 重新加载页面
  reloadPage(page) {
    const { history, location, system } = this.props;
    let query = system.query;
    if (page) {
      query = Object.assign(system.query, { page });
    }
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  }

  renderReportChannelOptions() {
    let { reportChannelList } = this.props.system;
    reportChannelList = [
      ...[{ id: '', channel_name: '全部' }],
      ...reportChannelList,
    ];
    return reportChannelList.map((item) => {
      return (
        <Option key={item.id} value={item.id}>
          {item.channel_name}
        </Option>
      );
    });
  }

  render() {
    const { eventListInfo } = this.props.integralManageEvent;
    const { list, total, loading } = eventListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    const { reportChannelList } = this.props.system;
    if (
      !isUserHasRights(updateRightList) &&
      !isUserHasRights(recoverRightList) &&
      !isUserHasRights(deleteRightList) &&
      this.columns.filter((item) => item.key === 'operation').length
    ) {
      this.columns.pop();
    }
    return (
      <div className="p-events-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="事件 ID：" {...formItemLayout}>
                  {getFieldDecorator('id', {
                    initialValue: query.id,
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字ID',
                      },
                    ],
                  })(<Input placeholder="請輸入事件 ID" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="事件描述：" {...formItemLayout}>
                  {getFieldDecorator('event_desc', {
                    initialValue: query.event_desc,
                  })(<Input placeholder="請輸入事件描述" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="上報渠道：" {...formItemLayout}>
                  {getFieldDecorator('report_channel_id', {
                    initialValue: +query.report_channel_id || '',
                  })(
                    <Select
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                    >
                      {this.renderReportChannelOptions()}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="更新時間：" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.up_start_time
                      ? [moment(query.up_start_time), moment(query.up_end_time)]
                      : null,
                  })(
                    <RangePicker
                      style={{ width: '100%' }}
                      disabledDate={(current) => current >= moment()}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col
                span={24}
                style={{
                  textAlign: 'center',
                }}
              >
                <Button
                  type="primary"
                  icon="search"
                  onClick={this.searchAction}
                  style={{ marginRight: 20 }}
                >
                  搜索
                </Button>
                <ResetBtn form={this.props.form} />
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card
          bordered={false}
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="全部事件"
          extra={
            <AuthWrapCom
              authList={['points_management', 'points_events', 'add_event']}
            >
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  this.setState({
                    isShowEventModal: true,
                    isAdd: true,
                    currentEventInfo: {},
                  });
                }}
              >
                定義新事件
              </Button>
            </AuthWrapCom>
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
        {this.state.isShowEventModal ? (
          <EventModal
            isAdd={this.state.isAdd}
            reportChannelList={reportChannelList}
            isLoading={this.state.isLoading}
            eventInfo={this.state.currentEventInfo}
            onOk={this.handleModalOkAction.bind(this)}
            onCancel={this.handleModalCancelAction.bind(this)}
          />
        ) : null}
      </div>
    );
  }
}
export default withRouter(
  connect(({ integralManageEvent, system }) => ({
    integralManageEvent: integralManageEvent.toJS(),
    system: system.toJS(),
  }))(Form.create()(EventListPage))
);
