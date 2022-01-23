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
  Badge,
  Select,
} from 'antd';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import _trim from 'lodash/trim';
import moment from 'moment';
import Table from 'components/Table';
import AuthWrapCom from 'components/AuthCom';
import ResetBtn from 'components/ResetBtn';
import FoldableCard from 'components/FoldableCard';
import { str2Md5 } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import { getUserSession } from 'utils/session';
import ee, { TASK_CENTER_PREVIEW } from 'utils/events';
import StringTip from './components/StringTip';
import ResultDueModal from './components/ResultDueModal';
import ResultPreviewModal from './components/ResultPreviewModal';
import './index.less';

const formItemLayout = {
  labelCol: { span: 6, xxl: { span: 5 } },
  wrapperCol: { span: 18, xxl: { span: 19 } },
};

const TASK_TYPE = {
  1: '會員批量篩選',
};

const Option = Select.Option;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const TASK_PREVIEW_RIGHT = ['task_center', 'task_operation', 'preview_result'];
const TASK_SEAL_RIGHT = ['task_center', 'task_operation', 'seal_up'];
const TASK_STOP_RIGHT = ['task_center', 'task_operation', 'stop'];
const TASK_DOWNLOAD_RIGHT = [
  'task_center',
  'task_operation',
  'download_select_result',
];
const TASK_SEARCH_TIME = ['task_center', 'task_operation', 'created_at'];
const TASK_SEARCH_USER = ['task_center', 'task_operation', 'created_by'];
const TASK_SEARCH_ID = ['task_center', 'task_operation', 'task_id'];
const TASK_SEARCH_NAME = ['task_center', 'task_operation', 'task_name'];
const TASK_SEARCH_TYPE = ['task_center', 'task_operation', 'task_type'];

class ListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: [],
      dueId: null,
      dueModal: false,
      dueAction: 'preview',
      dueFile: null,
      previewModal: false,
      hasSelectPermit: false,
    };
    this.isCanClick = true;
  }

  componentDidMount() {
    window.addEventListener('popstate', this.resetByStatePop);

    // 是否显示搜索栏
    let hasSelectPermit = false;
    const sess = getUserSession();
    if (sess) {
      const userPermit = getUserSession().permissions;
      if (
        userPermit &&
        userPermit.task_center &&
        userPermit.task_center.select_task &&
        userPermit.task_center.select_task.length
      ) {
        hasSelectPermit = true;
      }
      this.setState({ hasSelectPermit: true });
    }
    this.handleKeyupEvent();
  }

  // NOTE: @fix 解决 antd 日期控件内部不受控的 bug
  resetByStatePop = () => {
    const { system } = this.props;
    const { created_start } = system.query;
    const resetFields = [];
    if (!created_start) {
      resetFields.push('time');
    }
    this.props.form.resetFields(resetFields);
  };

  componentWillUnmount() {
    // NOTE: remove Listeners
    ee.removeAllListeners();
    window.removeEventListener('popstate', this.resetByStatePop);
  }

  handleKeyupEvent() {
    ee.on('keyup', () => {
      const { form } = this.props;
      const {
        time,
        id,
        task_name,
        created_by,
        task_type,
      } = form.getFieldsValue();
      if (
        this.checkSearchItemValueValidate(id, task_name, created_by) ||
        time ||
        task_type
      ) {
        return this.handleSearch();
      }
    });
  }

  checkSearchItemValueValidate = (id, task_name, created_by) => {
    let isValid = false;
    if (id !== null && id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的任務編號');
        return false;
      }
    }

    const _task_name = task_name.trim();
    if (_task_name) {
      isValid = true;
    }

    const _created_by = created_by.trim();
    if (_created_by) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  columns = [
    {
      title: '任務編號',
      dataIndex: 'id',
      width: '100px',
    },
    {
      title: '任務名稱/描述',
      render: (text, record) => {
        // @req 限制顯示15個字符
        // task_name 任务名称
        // remark 任务描述
        let remark = null;
        if (record.remark) {
          remark = <div className="c-string-tip__text">{record.remark}</div>;
          if (record.remark.length > 15) {
            remark = <StringTip text={record.remark} limit={15} />;
          }
        }
        return (
          <React.Fragment>
            <strong>{record.task_name}</strong>
            {remark}
          </React.Fragment>
        );
      },
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
    },
    {
      title: '創建人',
      dataIndex: 'created_by',
    },
    {
      title: '任務類型',
      dataIndex: 'task_type',
      render: (text) => TASK_TYPE[text],
    },
    {
      title: '任務狀態',
      width: '220px',
      render: (text, record, index) => {
        // status 1 处理中 2 处理成功 3 处理失败
        const statusMap = {
          1: {
            value: 'success',
            label: '處理中',
          }, // 处理中
          2: {
            value: 'default',
            label: '處理成功',
          }, // 已完成
          3: {
            value: 'error',
            label: '處理失敗',
          }, // 处理失败
        };

        let result = null;
        if (record.status === 3) {
          result = (
            <div
              className="p-task-center__fail-reason"
              style={{ color: '#f5222d' }}
            >
              {record.failed_reason}
            </div>
          );
        }
        return (
          <div>
            <Badge
              status={statusMap[record.status].value}
              text={statusMap[record.status].label}
            />
            {result}
          </div>
        );
      },
    },
    {
      title: '操作',
      width: '150px',
      render: (text, record) => {
        return this.renderOperation(record);
      },
    },
  ];

  // @style 增加封存样式
  addRowCls = (record) => {
    if (record.seal_up_status === 1) {
      return 'row-disabled';
    }
    return '';
  };

  // 表单处理停止任务
  handleStopTask = (record) => {
    if (!record.id) {
      return;
    }
    confirm({
      icon: 'info-circle',
      title: '任務停止后不可恢復！',
      content: '你還要繼續嗎？',
      okText: '繼續',
      onOk: async () => {
        try {
          const { data } = await this.props.dispatch({
            type: 'taskCenter/changeStatus',
            payload: {
              id: record.id,
              action: 'stop',
            },
          });
          if (data && data.status) {
            message.success('停止成功');
            this.reloadPage();
          }
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  // 表单处理预览
  handlePreview = async (record) => {
    if (record.seal_up_status === 1) {
      return;
    }
    await this.setState({
      dueId: record.id,
      dueFile: record.result_table,
      dueAction: 'preview',
    });
    if (record.has_password) {
      this.setState({
        dueModal: true,
      });
      return;
    }
    // 沒有密碼直接預覽
    this.preview(null);
  };

  // 打开预览模态框
  preview = (password) => {
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    const that = this;
    setTimeout(() => {
      that.isCanClick = true;
    }, 3000);
    ee.emit(TASK_CENTER_PREVIEW, password || null, async (fetchResult) => {
      this.isCanClick = true;
      // NOTE 如果有正确返回数据回调打开预览模态框
      if (fetchResult.data.status) {
        await this.setState({
          previewModal: true,
          dueModal: false,
        });
      }
      return this.state.previewModal;
    });
  };

  // 关闭预览模态框，回复模态框数据
  handleClosePreview = () => {
    this.setState({
      previewModal: false,
      dueId: null,
      dueFile: null,
      dueAction: 'preview',
    });
  };

  // 表单处理下载
  handleDownload = (record) => {
    if (record.seal_up_status === 1) {
      return;
    }
    if (record.has_password) {
      // 密码弹窗
      this.setState({
        dueId: record.id,
        dueFile: record.result_table,
        dueAction: 'download',
        dueModal: true,
      });
      return;
    }
    // 没有密码直接下载
    this.download(record.id, 'download');
  };

  // check_pw验证密码,download 下载
  download = async (id, action = 'check_pw', password) => {
    const query = { id, action };
    if (password) {
      query.password = str2Md5(password);
    }
    if (!this.isCanClick) {
      return;
    }
    this.isCanClick = false;
    const that = this;
    setTimeout(() => {
      that.isCanClick = true;
    }, 3000);
    const result = await this.props.dispatch({
      type: 'taskCenter/download',
      payload: query,
    });
    this.isCanClick = true;
    if (action === 'check_pw') {
      if (result && result.data && result.data.status) {
        this.download(id, 'download', password);
        this.setState({
          dueId: null,
          dueModal: false,
          dueAction: 'preview',
          dueFile: null,
        });
      }
    }
  };

  // 表单处理封存
  handleSeal = (record) => {
    if (!record.id || record.seal_up_status === 1) {
      return;
    }
    confirm({
      icon: 'info-circle',
      title: '任務封存后處理結果無法再下載且操作不可恢復！',
      content: '你還要繼續嗎？',
      okText: '繼續',
      onOk: async () => {
        try {
          const { data } = await this.props.dispatch({
            type: 'taskCenter/changeStatus',
            payload: {
              id: record.id,
              action: 'seal_up',
            },
          });
          if (data.status) {
            message.success('封存成功');
            this.reloadPage();
          }
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  // 渲染表单actions
  renderOperation(record) {
    const { status, online_times } = record;
    // status": "状态 1进行中,2已完成,3处理失败
    switch (status) {
      case 1:
        return (
          <span className="m-operation-wrap">
            {this.stopReactDomCom(record)}
          </span>
        );
      case 2:
        // 已完成
        return (
          <span className="m-operation-wrap">
            {this.previewReactDomCom(record)}
            {this.downloadReactDomCom(record)}
            {this.sealReactDomCom(record)}
          </span>
        );
      case 3:
        // 处理失败
        return (
          <span className="m-operation-wrap">
            {this.sealReactDomCom(record)}
          </span>
        );
      default:
        return (
          <span className="m-operation-wrap">
            {this.detailReactDomCom(record, 'look')}
          </span>
        );
    }
  }

  // 表单停止权限
  stopReactDomCom = (record) => {
    return (
      <AuthWrapCom authList={TASK_STOP_RIGHT}>
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.handleStopTask(record)}
        >
          停止
        </span>
      </AuthWrapCom>
    );
  };

  // 表单预览权限
  previewReactDomCom = (record) => {
    return (
      <AuthWrapCom authList={TASK_PREVIEW_RIGHT}>
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.handlePreview(record)}
        >
          預覽
        </span>
      </AuthWrapCom>
    );
  };

  // 表单封存权限
  sealReactDomCom = (record) => {
    return (
      <AuthWrapCom authList={TASK_SEAL_RIGHT}>
        <span
          className="u-operation-item u-color-red"
          onClick={() => this.handleSeal(record)}
        >
          封存
        </span>
      </AuthWrapCom>
    );
  };

  // 表单下载权限
  downloadReactDomCom = (record) => {
    return (
      <AuthWrapCom authList={TASK_DOWNLOAD_RIGHT}>
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.handleDownload(record)}
        >
          下載
        </span>
      </AuthWrapCom>
    );
  };

  // 密码模态框校验回调
  handlePassword = (password) => {
    if (this.state.dueAction === 'preview') {
      // 预览
      this.preview(password);
    } else {
      // 下载
      this.download(this.state.dueId, 'check_pw', password);
    }
  };

  handleSearch = () => {
    const { history, location } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const { id, task_name, task_type, created_by, time } = values;
      const query = {};
      if (time && time.length) {
        query.created_start = time[0].format('YYYY-MM-DD HH:mm:ss');
        query.created_end = time[1].format('YYYY-MM-DD HH:mm:ss');
      }
      if (_trim(id) !== '') {
        query.id = _trim(id);
      }
      if (_trim(task_name) !== '') {
        query.task_name = _trim(task_name);
      }
      if (task_type) {
        query.task_type = parseInt(task_type, 10);
      }
      if (_trim(created_by) !== '') {
        query.created_by = _trim(created_by);
      }
      if (Object.keys(query).length === 0) {
        // @Req 不可空白搜索
        message.info('請輸入搜索條件');
        return;
      }
      query.page = 1;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  handleCloseDueModal = () => {
    this.setState({ dueModal: false });
  };

  render() {
    const { list, total, loading } = this.props.taskCenter.indexList;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-activity-config-list-wrap">
        {this.state.hasSelectPermit ? (
          <FoldableCard
            title={<span>搜索條件</span>}
            bodyStyle={{ padding: '20px 24px 25px' }}
          >
            <Form labelAlign="left" {...formItemLayout}>
              <Row className="form-control-row" type="flex" gutter={48}>
                <AuthWrapCom authList={TASK_SEARCH_ID} com={React.Fragment}>
                  <Col span={8}>
                    <FormItem label="任務編號">
                      {getFieldDecorator('id', {
                        initialValue: query.id || '',
                        rules: [
                          {
                            pattern: /^\d*$/g,
                            message: '任務編號格式不正確',
                          },
                        ],
                      })(<Input placeholder="請輸入" />)}
                    </FormItem>
                  </Col>
                </AuthWrapCom>
                <AuthWrapCom authList={TASK_SEARCH_NAME} com={React.Fragment}>
                  <Col span={8}>
                    <FormItem label="任務名稱">
                      {getFieldDecorator('task_name', {
                        initialValue: query.task_name || '',
                      })(<Input placeholder="請輸入" />)}
                    </FormItem>
                  </Col>
                </AuthWrapCom>
                <AuthWrapCom authList={TASK_SEARCH_TYPE} com={React.Fragment}>
                  <Col span={8}>
                    <FormItem label="任務類型">
                      {getFieldDecorator('task_type', {
                        initialValue: query.task_type,
                      })(
                        <Select
                          placeholder="請選擇"
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentNode
                          }
                        >
                          <Option value="1">會員批量篩選</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </AuthWrapCom>
                <AuthWrapCom authList={TASK_SEARCH_USER} com={React.Fragment}>
                  <Col span={8}>
                    <FormItem label="創建人">
                      {getFieldDecorator('created_by', {
                        initialValue: query.created_by || '',
                      })(<Input placeholder="請輸入" />)}
                    </FormItem>
                  </Col>
                </AuthWrapCom>
                <AuthWrapCom authList={TASK_SEARCH_TIME} com={React.Fragment}>
                  <Col span={8}>
                    <FormItem label="創建時間">
                      {getFieldDecorator('time', {
                        initialValue: query.created_start
                          ? [
                              moment(query.created_start),
                              moment(query.created_end),
                            ]
                          : null,
                      })(
                        <RangePicker
                          style={{ width: '100%' }}
                          format="YYYY-MM-DD HH:mm:ss"
                          showTime
                        />
                      )}
                    </FormItem>
                  </Col>
                </AuthWrapCom>
              </Row>
              <Row className="form-control-row">
                <Col span={24} style={{ textAlign: 'center' }}>
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
        ) : null}
        <Card
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          bordered={false}
          title="任務列表"
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <Table
              rowKey={(row) => row.id}
              columns={this.columns}
              dataSource={list}
              rowClassName={this.addRowCls}
              pagination={{ total }}
              scroll={{ x: 1090 }}
            />
          )}
        </Card>
        <ResultDueModal
          visible={this.state.dueModal}
          type={this.state.dueAction}
          onClose={this.handleCloseDueModal}
          fileName={this.state.dueFile}
          onDuePassword={this.handlePassword}
        />
        <ResultPreviewModal
          visible={this.state.previewModal}
          onClose={this.handleClosePreview}
          fileName={this.state.dueFile}
          id={this.state.dueId}
          onDownload={this.download}
        />
      </div>
    );
  }
}
export default withRouter(
  connect(({ system, taskCenter }) => {
    return {
      taskCenter: taskCenter.toJS(),
      system: system.toJS(),
    };
  })(Form.create()(ListPage))
);
