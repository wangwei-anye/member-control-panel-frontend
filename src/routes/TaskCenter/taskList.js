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
import { getUserSession, getToken } from 'utils/session';
import ee, { TASK_CENTER_PREVIEW } from 'utils/events';
import request from 'utils/request';

import StringTip from './components/StringTip';
import ResultDueModal from './components/ResultDueModal';
import ResultPreviewModal from './components/ResultPreviewModal';
import './index.less';

const formItemLayout = {
  labelCol: { span: 6, xxl: { span: 5 } },
  wrapperCol: { span: 18, xxl: { span: 19 } },
};

const TASK_TYPE = {
  1: '發放項審批',
  2: '手動發分審批',
  3: '預算審批',
  4: '批量篩選',
  5: '積分餘額變動導出',
  6: '積分發放匯總導出',
  7: '積分消費匯總導出',
  8: '積分消費明細導出',
  9: '積分變動明細導出',
  10: '用戶積分發放明細導出',
  11: '應發積分匯總導出',
  12: '彩蛋領取記錄導出',
  13: '答題統計導出',
};

const Option = Select.Option;
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const TASK_PREVIEW_RIGHT = ['task_center', 'task_flow_list', 'detail'];

class TaskListPage extends React.Component {
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
      taskType: '',
    };
    this.isCanClick = true;
  }

  componentDidMount() {
    window.addEventListener('popstate', this.resetByStatePop);
    const { query } = this.props.system;
    if (query.task_type) {
      this.setState({
        taskType: query.task_type,
      });
    }

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
    const { start_time } = system.query;
    const resetFields = [];
    if (!start_time) {
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
      title: '負責人',
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
        return <div>{record.status_desc}</div>;
      },
    },
    {
      title: '操作',
      width: '180px',
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
    return (
      <span className="m-operation-wrap">
        <AuthWrapCom authList={TASK_PREVIEW_RIGHT}>
          <span
            className="u-operation-item u-color-blue"
            onClick={() => {
              let link = record.operation_link;
              if (link.includes('/#')) {
                const tempArr = link.split('/#');
                if (tempArr.length === 2) {
                  link = tempArr[0] + tempArr[1];
                }
              }
              window.location.href = link;
            }}
          >
            查看詳情
          </span>
        </AuthWrapCom>
        {record.button ? (
          <span
            className="u-operation-item u-color-blue"
            onClick={() => {
              this.downloadHandle(record.button.url);
            }}
          >
            {record.button.button_name}
          </span>
        ) : null}
      </span>
    );
  }
  downloadHandle = (url) => {
    const query = {
      'mc-admin-api-key': getToken(),
      action: 'download',
    };
    const querystring = qs.stringify(query);
    const a = document.createElement('a');
    a.setAttribute('download', '');
    a.setAttribute('href', `${url}&${querystring}`);
    a.click();
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
      const {
        id,
        task_name,
        task_type,
        task_status,
        created_by,
        time,
      } = values;
      const query = {};
      if (time && time.length) {
        query.start_time = time[0].format('YYYY-MM-DD HH:mm:ss');
        query.end_time = time[1].format('YYYY-MM-DD HH:mm:ss');
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
      if (task_status) {
        query.task_status = parseInt(task_status, 10);
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

  handleSelectChange = (value) => {
    this.setState({
      taskType: value,
    });
    this.props.form.setFieldsValue({
      task_status: '',
    });
  };

  render() {
    const { list, total, loading } = this.props.taskCenter.taskList;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    const { taskType } = this.state;
    let taskStatus = {};
    if (taskType === '3' || taskType === '2' || taskType === '1') {
      taskStatus = {
        1: '審批通過',
        2: '審批中',
        4: '待財務審批',
        6: '待業務審批',
        999: '審批拒絕',
      };
    } else {
      taskStatus = {
        1: '處理中',
        2: '處理成功',
        3: '處理失敗',
      };
    }
    return (
      <div className="p-activity-config-list-wrap">
        {this.state.hasSelectPermit ? (
          <FoldableCard
            title={<span>搜索條件</span>}
            bodyStyle={{ padding: '20px 24px 25px' }}
          >
            <Form labelAlign="left" {...formItemLayout}>
              <Row className="form-control-row" type="flex" gutter={48}>
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
                <Col span={8}>
                  <FormItem label="任務名稱">
                    {getFieldDecorator('task_name', {
                      initialValue: query.task_name || '',
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="負責人">
                    {getFieldDecorator('created_by', {
                      initialValue: query.created_by || '',
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="創建時間">
                    {getFieldDecorator('time', {
                      initialValue: query.start_time
                        ? [moment(query.start_time), moment(query.end_time)]
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
                        onChange={this.handleSelectChange}
                      >
                        <Option value="3">預算審批</Option>
                        <Option value="2">手動發放審批</Option>
                        <Option value="1">發放項審批</Option>
                        <Option value="4">會員批量篩選</Option>
                        <Option value="5">積分餘額變動導出</Option>
                        <Option value="6">積分發放匯總導出</Option>
                        <Option value="7">積分消費匯總導出</Option>
                        <Option value="8">積分消費明細導出</Option>
                        <Option value="9">積分變動明細導出</Option>
                        <Option value="10">用戶積分發放明細導出</Option>
                        <Option value="11">應發積分匯總導出</Option>
                        <Option value="12">彩蛋領取記錄導出</Option>
                        <Option value="13">答題統計導出</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="狀態">
                    {getFieldDecorator('task_status', {
                      initialValue: query.task_status || '',
                    })(
                      <Select
                        disabled={taskType === ''}
                        placeholder="請選擇"
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentNode
                        }
                      >
                        <Option value="">全部</Option>
                        {Object.entries(taskStatus).map(([key, name]) => {
                          return (
                            <Option value={key} key={key}>
                              {name}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
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
                  <ResetBtn
                    form={this.props.form}
                    onReset={() => {
                      this.setState({
                        taskType: '',
                      });
                    }}
                  />
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
  })(Form.create()(TaskListPage))
);
