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
  InputNumber,
} from 'antd';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import qs from 'qs';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import {
  getOriginQuestionDeatil,
  originQuestionEdit,
} from 'services/promotion';
import {
  formatFormData,
  convertValidDateToText,
  downLoadFile,
} from 'utils/tools';
// import { DEFAULT_PAGE_SIZE, API_BASE } from 'constants';
import LoadingCom from 'components/LoadingCom';
import { HEADER_TOKEN_NAME } from 'constants';
import eventEmmiter from 'utils/events';
import { getToken } from 'utils/session';
import './index.less';

const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;

const { RangePicker } = DatePicker;
// 表单项布局
const formItemLayout = {
  labelCol: {
    xs: 10,
    sm: 10,
    md: 10,
    lg: 10,
    xl: 7,
    xxl: 6,
  },
  wrapperCol: {
    xs: 14,
    sm: 14,
    md: 14,
    lg: 14,
    xl: 17,
    xxl: 18,
  },
};
// modal表单项布局
const ModalformItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17, offset: 1 },
};

// 状态:1发放中,2审批中,3即将开始,4已驳回,5已停发,0未完成,-1已失效,-2已废弃,999全部
const status2Json = {
  2: {
    name: '失敗',
    className: 'status-lose',
  },
  1: {
    name: '成功',
    className: 'status-give',
  },
  0: {
    name: '待發放',
    className: 'status-approve',
  },
  3: {
    name: '發放中',
    className: 'status-soon',
  },
};

const LIMIT_JSON = {
  day: '每天',
  week: '每周',
  month: '每月',
  quarter: '每季',
  year: '每年',
  lifelong: '终身',
  'un-limit': '不限制',
};

const QUESTION_TYPE = {
  0: '選擇題',
};

class RecordListPage extends React.Component {
  state = {
    detail: {},
    dateString: [],
    disabled: false,
    currentPage: 1,
    // modal
    modalVisiable: false,
    modalLoading: false,
    modalDisable: false,
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '題幹名稱',
      dataIndex: 'value',
    },
    {
      title: '題型',
      dataIndex: 'question_style',
      render: (text, record) => {
        return QUESTION_TYPE[record.question_style];
      },
    },
    {
      title: '答題限制',
      dataIndex: 'answer_limit',
      render: (text, record) => {
        return record.answer_limit !== 'un-limit'
          ? `${LIMIT_JSON[record.answer_limit]}最多${record.max_answer_limit}次`
          : '不限制';
      },
    },
    {
      title: '更新時間',
      dataIndex: 'updated_at',
    },
    {
      title: '編輯人',
      dataIndex: 'updater_name',
    },
    {
      title: '操作',
      width: '160px',
      render: (text, record) => {
        return this.renderOperation(record);
      },
    },
  ];

  async componentDidMount() {
    this.handleKeyupEvent();
  }

  componentWillUnmount() {}

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      return this.handleSearchBtn();
    });
  }

  renderOperation(record) {
    const { status, online_times, activity_type } = record;
    // status": "状态,0未完成,1进行中,2已结束,3即将开始
    return (
      <div className="m-operation-wrap-box">
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record, 'look')}
        </span>
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record, 'edit')}
        </span>
      </div>
    );
  }
  detailReactDomCom(record, type = 'look') {
    return (
      <AuthWrapCom
        authList={[
          'operation_manage',
          'promotional_activity',
          'questions',
          type === 'look' ? 'origin_question_detail' : 'origin_question_edit',
        ]}
      >
        <span
          className="u-operation-item u-color-blue"
          onClick={this.handleToDetail.bind(this, record, type)}
        >
          {type === 'look' ? '查看' : '編輯'}
        </span>
      </AuthWrapCom>
    );
  }

  handleToDetail = async (record, type) => {
    this.setState({
      disabled: type === 'look' ? true : false,
      modalVisiable: true,
    });
    const { data } = await getOriginQuestionDeatil({ id: record.id });
    if (data.status) {
      if (data.data.answer_limit === '0') {
        data.data.answer_limit = 'un-limit';
      }
      this.setState({
        detail: data.data,
      });
    } else {
      message.error('請求錯誤');
    }
  };

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

      if (query.type && query.type === '') {
        delete query.type;
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

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  modalOkAction = async () => {
    const { detail } = this.state;
    const { data } = await originQuestionEdit({
      id: detail.id,
      answer_limit: detail.answer_limit,
      max_answer_limit:
        detail.answer_limit === 'un-limit' ? 0 : detail.max_answer_limit,
    });
    if (data.status) {
      this.setState({
        modalVisiable: false,
      });
      this.reloadPage();
    } else {
      message.error('請求錯誤');
    }
  };
  modalCancelAction() {
    this.setState({
      modalVisiable: false,
    });
  }

  inputNumberChange = (e) => {
    const data = Object.assign({}, this.state.detail, {
      max_answer_limit: e,
    });
    this.setState({
      detail: data,
    });
  };

  changeSelect = (e) => {
    let data = Object.assign({}, this.state.detail, {
      answer_limit: e,
    });
    if (e !== 'un-limit') {
      data = Object.assign({}, data, {
        max_answer_limit: 1,
      });
    }
    this.setState({
      detail: data,
    });
  };

  render() {
    const { originQuestionInfo } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { total, list, loading } = originQuestionInfo;
    const {
      detail,
      currentPage,
      modalVisiable,
      modalLoading,
      modalDisable,
    } = this.state;

    const {
      query: { title, type, start_time, end_time },
    } = this.props.system;

    const optionArr = Object.keys(LIMIT_JSON).map((item, index) => {
      return (
        <Option key={index} value={item}>
          {LIMIT_JSON[item]}
        </Option>
      );
    });

    return (
      <div className="p-fixed-list-wrap p-give-wrap question-wrap">
        <div>
          <FoldableCard
            className="qr-code-card"
            bodyStyle={{ borderTop: '1px solid #e8e8e8' }}
            title="搜索條件"
          >
            <Form>
              <Row gutter={48}>
                <Col span={7}>
                  <FormItem label="題幹名稱" {...formItemLayout}>
                    {getFieldDecorator('title', {
                      initialValue: title || '',
                      rules: [],
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={7}>
                  <FormItem label="題型" {...formItemLayout}>
                    {getFieldDecorator('type', {
                      initialValue: type || undefined,
                    })(
                      <Select placeholder="請選擇">
                        <Option value="">全部</Option>
                        <Option value="0">選擇題</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem label="更新時間" {...formItemLayout}>
                    {getFieldDecorator('time', {
                      initialValue: start_time
                        ? [moment(start_time), moment(end_time)]
                        : '',
                    })(<RangePicker showTime style={{ width: '100%' }} />)}
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
          >
            {loading ? (
              <LoadingCom />
            ) : (
              <Table
                rowKey="id"
                columns={this.columns}
                dataSource={list}
                pagination={{
                  total,
                  showSizeChanger: true,
                  page: currentPage,
                }}
                onChange={this.pageChange}
              />
            )}
          </Card>
        </div>

        <Modal
          width={600}
          title="題目詳情"
          visible={modalVisiable}
          onOk={() => this.modalOkAction()}
          onCancel={() => this.modalCancelAction()}
          destroyOnClose
          okButtonProps={{
            disabled: modalDisable,
            loading: modalLoading,
          }}
          cancelButtonProps={{ disabled: modalLoading }}
          okText="提交"
        >
          <div className="question-modal">
            <Row>
              <Col span={24}>
                <FormItem label="題幹" {...ModalformItemLayout}>
                  <div>{detail.value}</div>
                </FormItem>
                <FormItem label="題型" {...ModalformItemLayout}>
                  <div>{QUESTION_TYPE[detail.question_style]}</div>
                </FormItem>
                <FormItem label="選項" {...ModalformItemLayout}>
                  <div>{detail.option}</div>
                </FormItem>
                <FormItem label="答題限制" {...ModalformItemLayout}>
                  <Select
                    disabled={this.state.disabled}
                    placeholder="請選擇"
                    style={{ width: 180, marginRight: 30 }}
                    value={detail.answer_limit}
                    onChange={(e) => this.changeSelect(e)}
                  >
                    {optionArr}
                  </Select>
                  {this.state.detail.answer_limit === 'un-limit' ||
                  this.state.detail.answer_limit === '0' ? null : (
                    <React.Fragment>
                      {' '}
                      最多答&nbsp;
                      <InputNumber
                        min={1}
                        max={999}
                        disabled={this.state.disabled}
                        value={detail.max_answer_limit}
                        onChange={(e) => this.inputNumberChange(e)}
                      />
                      &nbsp;次
                    </React.Fragment>
                  )}
                </FormItem>
              </Col>
            </Row>
          </div>
        </Modal>
      </div>
    );
  }
}

export default withRouter(
  connect(({ system, auth, activityConfig }) => ({
    originQuestionInfo: activityConfig.get('originQuestionInfo').toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(Form.create()(RecordListPage))
);
