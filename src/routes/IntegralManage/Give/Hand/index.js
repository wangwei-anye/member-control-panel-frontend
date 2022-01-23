import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import {
  Form,
  Row,
  Col,
  Input,
  Button,
  Card,
  DatePicker,
  Modal,
  Select,
} from 'antd';
import FoldableCard from 'components/FoldableCard';

import { INTEGRAL_GIVE_TABLIST } from 'config/ob.config.js';
import TabRouter from 'components/TabRouter';
import { cancelApplication } from 'services/integralManage/approve/approve';
import { deleteHandRequest } from 'services/integralManage/give/give';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import AuthWrapCom from 'components/AuthCom';
import LoadingCom from 'components/LoadingCom';
import { formatFormData } from 'utils/tools';
import '../give.less';

const confirm = Modal.confirm;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const status2Json = {
  0: {
    name: '未完成',
    className: 'status-undone',
  },
  1: {
    name: '正常',
    className: 'status-give',
  },
  2: {
    name: '提交審批',
    className: 'status-approve',
  },
  3: {
    name: '部門拒絕',
    className: 'status-reject',
  },
  4: {
    name: '部門同意',
    className: 'status-give',
  },
  5: {
    name: '財務拒絕',
    className: 'status-reject',
  },
};
const deleteRightList = [
  'points_management',
  'points_offer',
  'manual',
  'delete',
];
const detailRightList = [
  'points_management',
  'points_offer',
  'manual',
  'detail',
];
class HandListPage extends React.Component {
  state = {
    dateString: [],
  };
  columns = [
    {
      title: '發放項 ID',
      dataIndex: 'id',
    },
    {
      title: '發放帳戶',
      dataIndex: 'account_name',
    },
    {
      title: '發起部門',
      dataIndex: 'department_name',
    },
    {
      title: '發放數量',
      dataIndex: 'amount',
    },
    {
      title: '接受賬戶(id)',
      render: (record) => {
        return (
          <div>
            {record.receiver_info.map((item, index) => {
              return (
                <p key={index}>
                  <b>
                    {item.receive_name || (
                      <span style={{ color: 'red' }}>無暱稱</span>
                    )}
                  </b>
                  （{item.receive_id}）
                </p>
              );
            })}
          </div>
        );
      },
    },
    {
      title: '發起時間',
      render: (record) => {
        return moment(record.created_at * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '發起人',
      dataIndex: 'admin_name',
    },
    {
      title: '狀態',
      render: (record) => {
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
      title: '操作',
      render: (text, record, index) => {
        return this.renderOpeartion(record, index);
      },
    },
  ];
  renderOpeartion(record, index) {
    const status = +record.status;
    if (status === 0) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
          {this.deleteReactDom(record)}
        </span>
      );
    }
    // 审批
    if (status === 2) {
      return (
        <span className="m-operation-wrap">
          {this.lookDetailReactDom(record)}
        </span>
      );
    }
    // 拒绝或者驳回的 部门驳回或者财务驳回
    if (status === 3 || status === 5) {
      return (
        <span className="m-operation-wrap">{this.deleteReactDom(record)}</span>
      );
    }
    return (
      <span className="m-operation-wrap">
        {this.lookDetailReactDom(record)}
      </span>
    );
  }
  // 查看详情 reactDom
  lookDetailReactDom(record) {
    return (
      <AuthWrapCom authList={detailRightList}>
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.toDetail(record, 'look')}
        >
          查看
        </span>
      </AuthWrapCom>
    );
  }
  // 删除reactDom
  deleteReactDom(record) {
    return (
      <AuthWrapCom authList={deleteRightList}>
        <span
          className="u-operation-item u-color-red"
          onClick={() => this.deleteApplicationAction(record)}
        >
          刪除
        </span>
      </AuthWrapCom>
    );
  }
  // 查看详情
  toDetail(record, type) {
    let url = `/integral-manage/give-hand/detail?id=${record.id}`;
    if (type) {
      url += `&type=${type}`;
    }
    this.props.history.push(url);
  }
  // 删除
  async deleteApplicationAction(record, index) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要刪除該發放項嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const res = await deleteHandRequest({ id: record.id });
          const dataInfo = res.data;
          resolve();
          if (dataInfo.status) {
            self.reloadPage();
          }
        });
      },
    });
  }
  // 取消申请
  cancelApplicationAction(record, index) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要取消該審批嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const res = await cancelApplication({ id: record.id });
          const dataInfo = res.data;
          resolve();
          if (dataInfo.status) {
            self.reloadPage();
          }
        });
      },
    });
  }
  // 搜索
  searchAction() {
    const { history, location, system } = this.props;
    const { dateString } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      delete values.time;
      const query = formatFormData(values);
      if (dateString && dateString.length) {
        query.begin_time = dateString[0];
        query.end_time = dateString[1];
      }
      query.page = 1;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  }
  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }
  timeChangeAction(date, dateString) {
    this.setState({
      dateString,
    });
  }
  render() {
    const { handListInfo } = this.props.integralManageGive;
    const { total, list, loading } = handListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query, partmentList } = this.props.system;
    return (
      <div className="p-give-wrap p-hand-list-wrap">
        <TabRouter tabList={INTEGRAL_GIVE_TABLIST} defaultKey="hand" />
        <div
          className="give-content-wrap"
          style={{ borderTop: '1px solid #e8e8e8' }}
        >
          <FoldableCard className="custom-card" title={<span>搜索條件</span>}>
            <Form>
              <Row>
                <Col span={11}>
                  <FormItem label="發放項 ID：" {...formItemLayout}>
                    {getFieldDecorator('id', {
                      initialValue: query.id,
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="發放賬戶名稱：" {...formItemLayout}>
                    {getFieldDecorator('account_name', {
                      initialValue: query.account_name,
                    })(<Input placeholder="請輸入賬戶名稱關鍵字" />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="發放部門：" {...formItemLayout}>
                    {getFieldDecorator('department', {
                      initialValue: query.department,
                    })(<PartmentTreeSelect partmentList={partmentList} />)}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem label="發起時間" {...formItemLayout}>
                    {getFieldDecorator('time', {
                      initialValue: query.begin_time
                        ? [moment(query.begin_time), moment(query.end_time)]
                        : null,
                    })(
                      <RangePicker
                        style={{ width: '100%' }}
                        disabledDate={(current) => current >= moment()}
                        onChange={(date, dateString) =>
                          this.timeChangeAction(date, dateString)
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    icon="search"
                    onClick={() => this.searchAction()}
                    style={{ marginRight: 20 }}
                  >
                    搜索
                  </Button>
                  <ResetBtn
                    form={this.props.form}
                    onReset={() => this.setState({ dateString: [] })}
                  />
                </Col>
              </Row>
            </Form>
          </FoldableCard>
          <Card
            bordered={false}
            bodyStyle={{ padding: '10px 20px' }}
            style={{ marginTop: 24 }}
            title="全部手動發放項"
            extra={
              <AuthWrapCom
                authList={[
                  'points_management',
                  'points_offer',
                  'manual',
                  'create',
                ]}
              >
                <Button
                  icon="plus"
                  type="primary"
                  onClick={() => {
                    this.props.history.push(
                      '/integral-manage/give-hand/detail'
                    );
                  }}
                >
                  發起手動審批
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
  connect(({ integralManageGive, system }) => ({
    integralManageGive: integralManageGive.toJS(),
    system: system.toJS(),
  }))(Form.create()(HandListPage))
);
