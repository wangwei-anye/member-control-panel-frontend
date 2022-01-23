import React from 'react';
import TabRouter from 'components/TabRouter';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { INTEGRAL_GIVE_TABLIST } from 'config/ob.config.js';
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
} from 'antd';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import qs from 'qs';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import {
  updateCustomStatusRequest,
  changePositionRequest,
} from 'services/memberTask';
import LoadingCom from 'components/LoadingCom';
import { formatFormData, convertValidDateToText } from 'utils/tools';
import eventEmmiter from 'utils/events';
import './index.less';

const confirm = Modal.confirm;
const Option = Select.Option;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const status2Json = {
  0: {
    name: '未生效',
    className: 'status-undone',
  },
  1: {
    name: '生效中',
    className: 'status-give',
  },
  2: {
    name: '已失效',
    className: 'status-approve',
  },
  3: {
    name: '已下架',
    className: 'status-soon',
  },
  4: {
    name: '已刪除',
    className: 'status-reject',
  },
  5: {
    name: '審批中',
    className: 'status-stop',
  },
  6: {
    name: '審批拒絕',
    className: 'status-soon',
  },
  7: {
    name: '暫停發分',
    className: 'status-approve',
  },
};
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
class ListPage extends React.Component {
  state = {
    customOrder: '',
    dateString: [],
  };

  columns = [
    {
      title: '任務ID',
      dataIndex: 'id',
    },
    {
      title: '任務標題',
      dataIndex: 'task_title',
    },
    {
      title: '任務對象',
      render: (record) => {
        return (
          <span>{record.task_open_for === '0' ? '所有會員' : '白名單'}</span>
        );
      },
    },
    {
      title: '生效時間',
      render: (record) => {
        return (
          moment(record.updated_at).format('YYYY-MM-DD HH:mm') +
          ' ~ ' +
          moment(record.updated_at).format('YYYY-MM-DD HH:mm')
        );
      },
    },
    {
      title: '任務週期',
      render: (record) => {
        return this.renderPeriod(record);
      },
    },
    {
      title: '編輯人',
      dataIndex: 'edit_by',
    },
    {
      title: '展示順序',
      key: 'position',
      width: '220px',
      render: (text, record, index) => {
        return this.renderPostion(record, index);
      },
    },
    {
      title: '狀態',
      render: (text, record) => {
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
      title: '操作',
      width: 260,
      render: (text, record, index) => {
        return this.renderOperation(record, index);
      },
    },
  ];

  componentDidMount() {
    this.handleKeyupEvent();
  }

  componentWillUnmount() {
    eventEmmiter.removeAllListeners('keyup');
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { time, out_time } = values;
      if (this.checkSearchItemValueValidate(values) || time || out_time) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { id, entry_name, offer_account_name } = values;
    let isValid = false;
    if (id !== null && id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的預算編號ID');
        return false;
      }
    }

    const _entry_name = entry_name.trim();
    if (_entry_name) {
      isValid = true;
    }

    const _offer_account_name = offer_account_name.trim();
    if (_offer_account_name) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  renderPeriod(record) {
    const weekConfig = {
      0: '週日',
      1: '週一',
      2: '週二',
      3: '週三',
      4: '週四',
      5: '週五',
      6: '週六',
    };
    if (record.task_cycle.is_repeat === '0') {
      return <span>不重複</span>;
    }
    if (record.task_cycle.cycle_type === 'day') {
      return (
        <span>
          每{record.task_cycle.cycle_value}天,重複
          {record.task_cycle.cycle_repeat_time}次
        </span>
      );
    }
    if (record.task_cycle.cycle_type === 'week') {
      return (
        <span>
          每{record.task_cycle.cycle_value}周
          {weekConfig[record.task_cycle.cycle_type_value]},重複
          {record.task_cycle.cycle_repeat_time}次
        </span>
      );
    }
    if (record.task_cycle.cycle_type === 'month') {
      return (
        <span>
          每{record.task_cycle.cycle_value}月
          {record.task_cycle.cycle_type_value}號,重複
          {record.task_cycle.cycle_repeat_time}次
        </span>
      );
    }
    return <span>--</span>;
  }

  renderOperation(record, index) {
    const status = +record.status;
    if (status === 0 || status === 6) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          <AuthBtnCom authList={record.permission} currrentAuth="update">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetailAction(record, 'edit')}
            >
              編輯
            </span>
          </AuthBtnCom>
          <AuthBtnCom
            authList={record.permission}
            currrentAuth="change_position"
          >
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.handleOrderTop(record)}
            >
              優先排序
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    if (
      status === 2 ||
      status === 3 ||
      status === 4 ||
      status === 5 ||
      status === 7
    ) {
      return (
        <span className="m-operation-wrap">
          <AuthBtnCom authList={record.permission} currrentAuth="detail">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查閱
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    // 已失效
    if (status === 1) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          <AuthBtnCom authList={record.permission} currrentAuth="update">
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.toDetailAction(record, 'edit')}
            >
              編輯
            </span>
          </AuthBtnCom>
          <AuthBtnCom
            authList={record.permission}
            currrentAuth="change_position"
          >
            <span
              className="u-operation-item u-color-blue"
              onClick={() => this.handleOrderTop(record)}
            >
              優先排序
            </span>
          </AuthBtnCom>
          <AuthBtnCom authList={record.permission} currrentAuth="change_status">
            <span
              className="u-operation-item  u-color-red"
              onClick={() => this.offItemAction(record)}
            >
              下架
            </span>
          </AuthBtnCom>
        </span>
      );
    }
    return (
      <span className="m-operation-wrap">
        {this.lookDetailReactDom(record)}
      </span>
    );
  }

  renderPostion(record, index) {
    const { total } = this.props.memberTask.customListInfo;
    const No = record.position;
    let { status } = record;
    status = parseInt(status, 10);
    if (status !== 1) {
      return <span className="m-operation-wrap">--</span>;
    }
    return (
      <span className="m-operation-wrap">
        <span className="u-operation-item u-color-red">
          <b>{No}</b>
        </span>
        <span>
          <span>
            {No === 1 ? null : (
              <span
                className="u-operation-item u-color-blue"
                onClick={this.handleOrder.bind(this, record, index, 'up')}
              >
                上升
              </span>
            )}
            {No === total ? null : (
              <span
                className="u-operation-item u-color-blue"
                onClick={this.handleOrder.bind(this, record, index, 'down')}
              >
                下降
              </span>
            )}
          </span>
          <span
            className="u-operation-item u-color-blue"
            onClick={this.handleCustomOrder.bind(this, record, index)}
          >
            自定義
          </span>
        </span>
      </span>
    );
  }

  // 查看详情 react dom
  lookDetailReactDom(record) {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="detail">
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.toDetailAction(record, 'look')}
        >
          查閱
        </span>
      </AuthBtnCom>
    );
  }

  toDetailAction(record, type) {
    if (!record.id) {
      return;
    }
    this.props.history.push(
      `/member-task/config/base?id=${record.id}&type=${type}`
    );
  }

  offItemAction(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要下架該項嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await updateCustomStatusRequest({
            id: record.id,
          });
          resolve();
          if (data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  handleOrder = async (record, index, type) => {
    const { data } = await changePositionRequest({
      id: record.id,
      position: type === 'up' ? record.position - 1 : +record.position + 1,
    });
    if (data.status) {
      this.reloadPage();
    }
  };

  handleOrderTop = async (record) => {
    const { data } = await changePositionRequest({
      id: record.id,
      position: 1,
    });
    if (data.status) {
      this.reloadPage();
    }
  };

  handleCustomOrder = (record, index) => {
    const self = this;
    confirm({
      iconType: 'info-circle',
      title: '輸入你想要改活動在推薦分頁展示的位置',
      content: (
        <Input
          placeholder="請輸入"
          onChange={self.handleCustomOrderChange}
          maxLength={10}
        />
      ),
      onOk() {
        return new Promise(async (resolve, reject) => {
          const { customOrder } = self.state;
          if (!/^\d+$/g.test(customOrder)) {
            message.error('请输入純数字');
            reject();
            return;
          }
          if (parseInt(customOrder, 10) <= 0) {
            message.error('请输入大于0数字');
            reject();
            return;
          }
          const { data } = await changePositionRequest({
            id: record.id,
            position: parseInt(customOrder, 10),
          });
          if (data.status) {
            resolve();
            self.reloadPage();
          } else {
            reject();
          }
        });
      },
    });
  };
  handleCustomOrderChange = (e) => {
    const { value } = e.target;
    this.setState({
      customOrder: value,
    });
  };

  // 搜索
  searchAction = () => {
    const { history, location, system } = this.props;
    const { dateString } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.start_time = moment(values.time[0]).format('YYYY-MM-DD');
        query.end_time = moment(values.time[1]).format('YYYY-MM-DD');
      }
      query.page = 1;
      delete query.time;
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
    const { customListInfo } = this.props.memberTask;
    const { list, total, loading } = customListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-fixed-list-wrap p-give-wrap">
        <div className="give-content-wrap">
          <FoldableCard
            className="custom-card"
            bodyStyle={{ borderTop: '1px solid #e8e8e8' }}
          >
            <Form>
              <Row gutter={48}>
                <Col span={11}>
                  <FormItem label="任務名稱" {...formItemLayout}>
                    {getFieldDecorator('id', {
                      initialValue: query.id || '',
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="生效時間" {...formItemLayout}>
                    {getFieldDecorator('time', {
                      initialValue: query.start_time
                        ? [moment(query.start_time), moment(query.end_time)]
                        : '',
                    })(<RangePicker style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="任務狀態" {...formItemLayout}>
                    {getFieldDecorator('status', {
                      initialValue: query.status || '',
                    })(
                      <Select
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentNode
                        }
                      >
                        <Option value="">全部</Option>
                        <Option value="valid">正常</Option>
                        <Option value="invalid">已凍結</Option>
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
            style={{ marginTop: '24px' }}
            title="全部自定義發放項"
            extra={
              <AuthWrapCom authList={['member_tasks', 'create']}>
                <Button
                  icon="plus"
                  type="primary"
                  onClick={() => {
                    this.props.history.push('/member-task/config/base');
                  }}
                >
                  創建任務
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
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(({ memberTask, system }) => ({
    memberTask: memberTask.toJS(),
    system: system.toJS(),
  }))(Form.create()(ListPage))
);
