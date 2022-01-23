import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Form,
  Row,
  Col,
  DatePicker,
  Modal,
  Input,
  Button,
  Card,
  Tag
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import AuthWrapCom from 'components/AuthCom';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import qs from 'qs';
import moment from 'moment';
import { formatFormData, isUserHasRights } from 'utils/tools';
import {
  publistOrCancelDivisionRequest,
  deleteDivisionRequest
} from 'services/integralDivision/division';
import './index.less';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};
const confirm = Modal.confirm;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const addRightList = ['points_area', 'hot_activity', 'add'];
const deleteRightList = ['points_area', 'hot_activity', 'delete'];
const publishRightList = ['points_area', 'hot_activity', 'publish'];
const updateRightList = ['points_area', 'hot_activity', 'update'];
const detailRightList = ['points_area', 'hot_activity', 'detail'];
class activityPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createDateStrings: [],
      outDateStrings: []
    };
  }
  columns = [
    {
      title: 'ID',
      dataIndex: 'id'
    },
    {
      title: '活動名稱',
      width: '450px',
      dataIndex: 'title'
    },
    {
      title: '創建時間',
      render: (text, record) => {
        return record.created_at || '--';
      }
    },
    {
      title: '下架時間',
      render: (text, record) => {
        return record.plan_offline_at || '--';
      }
    },
    {
      title: '創建人',
      dataIndex: 'creator_name'
    },
    {
      title: '操作',
      width: '195px',
      render: (text, record) => {
        return this.renderOperation(record);
      }
    }
  ];
  toDetail(record, type = 'edit') {
    if (!record.id) {
      return;
    }
    this.props.history.push(
      `/integral-division/activity/detail?id=${record.id}&type=${type}`
    );
  }
  renderOperation(record) {
    const status = +record.status;
    const online_times = record.online_times;
    if (status === 1) {
      // 上架中
      return (
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record)}
          {this.publishReactDomCom(record, 'cancel')}
        </span>
      );
    }
    if (status === 2) {
      // 下架
      return (
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record)}
          {this.detailReactDomCom(record, 'edit')}
          {this.publishReactDomCom(record)}
        </span>
      );
    }
    if (status === 0) {
      return (
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record)}
          {this.detailReactDomCom(record, 'edit')}
          {this.publishReactDomCom(record)}
          {this.deleteReactDomCom(record)}
        </span>
      );
    }
    return (
      <span className="m-operation-wrap">{this.detailReactDomCom(record)}</span>
    );
  }
  detailReactDomCom(record, type = 'look') {
    return (
      <AuthWrapCom
        authList={type === 'look' ? detailRightList : updateRightList}
      >
        <span
          className="u-operation-item u-color-blue"
          onClick={() => this.toDetail(record, type)}
        >
          {type === 'look' ? '查看' : '編輯'}
        </span>
      </AuthWrapCom>
    );
  }
  publishReactDomCom(record, type = 'publish') {
    return (
      <AuthWrapCom authList={publishRightList}>
        <span
          className="u-operation-item u-color-red"
          onClick={() => this.publishOrCancel(record, type)}
        >
          {type === 'publish' ? '發佈' : '取消發佈'}
        </span>
      </AuthWrapCom>
    );
  }
  deleteReactDomCom(record) {
    return (
      <AuthWrapCom authList={deleteRightList}>
        <span
          className="u-operation-item u-color-red"
          onClick={() => this.deleteItem(record)}
        >
          刪除
        </span>
      </AuthWrapCom>
    );
  }
  publishOrCancel(record, type) {
    if (!record.id) {
      return;
    }
    const self = this;
    const title =
      type === 'cancel'
        ? '取消本活動會取消正在發佈的活動！'
        : '發佈本活動會將正在發佈中的熱門活動從積分中區取消發佈！';
    confirm({
      iconType: 'info-circle',
      title,
      content: '你還要繼續嗎？',
      okText: '繼續',
      onOk() {
        return new Promise(async resolve => {
          const { data } = await publistOrCancelDivisionRequest({
            id: record.id,
            action: type
          });
          if (data.status) {
            resolve();
            if (data.data.status === -1) {
              // 下架时间已经过期了
              self.checkPublishConfirm(record);
            } else {
              self.reloadPage();
            }
          }
        });
      }
    });
  }
  checkPublishConfirm(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    const title = '當前熱門活動的發佈時間已過期，重新調整下架時間後再嘗試';
    confirm({
      iconType: 'close-circle',
      title,
      content: '點擊【查看】進入熱門活動詳情調整下架時間',
      okText: '查看',
      onOk() {
        return new Promise(resolve => {
          resolve();
          self.props.history.push(
            `/integral-division/activity/detail?id=${record.id}&type=edit`
          );
        });
      }
    });
  }
  deleteItem(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定要刪除該項嗎?',
      onOk() {
        return new Promise(async resolve => {
          const { data } = await deleteDivisionRequest({ id: record.id });
          if (data.status) {
            resolve();
            self.reloadPage();
          }
        });
      }
    });
  }
  timeChangeAction = (type, date, dateString) => {
    const attr = type === 'create' ? 'createDateStrings' : 'outDateStrings';
    this.setState({
      [attr]: dateString
    });
  };
  searchAction() {
    const { history, location } = this.props;
    const { createDateStrings, outDateStrings } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      delete values.time;
      delete values.out_time;
      const query = formatFormData(values);
      if (createDateStrings && createDateStrings.length) {
        query.create_start_time = `${createDateStrings[0]} 00:00:00`;
        query.create_end_time = `${createDateStrings[1]} 23:59:59`;
      }
      if (outDateStrings && outDateStrings.length) {
        query.off_shelf_start_time = `${outDateStrings[0]} 00:00:00`;
        query.off_shelf_end_time = `${outDateStrings[1]} 23:59:59`;
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
  render() {
    const { activityListInfo } = this.props.integralDivision;
    const { total, list } = activityListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-integral-division-activity-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row>
              <Col span={7}>
                <FormItem label="ID：" {...formItemLayout}>
                  {getFieldDecorator('id', {
                    initialValue: query.id,
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字ID'
                      }
                    ]
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={7}>
                <FormItem label="活動名稱：" {...formItemLayout}>
                  {getFieldDecorator('title', {
                    initialValue: query.title
                  })(<Input placeholder="請輸入熱門活動名稱關鍵字" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="創建人" {...formItemLayout}>
                  {getFieldDecorator('create_by', {
                    initialValue: query.create_by
                  })(<Input placeholder="請輸入創建人關鍵字" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="創建時間" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.create_start_time
                      ? [
                          moment(query.create_start_time),
                          moment(query.create_end_time)
                        ]
                      : null
                  })(
                    <RangePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      disabledDate={current => current && current > moment()}
                      onChange={this.timeChangeAction.bind(this, 'create')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="下架時間" {...formItemLayout}>
                  {getFieldDecorator('out_time', {
                    initialValue: query.off_shelf_start_time
                      ? [
                          moment(query.off_shelf_start_time),
                          moment(query.off_shelf_end_time)
                        ]
                      : null
                  })(
                    <RangePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      onChange={this.timeChangeAction.bind(this, 'out')}
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
                  onClick={() => this.searchAction()}
                  style={{ marginRight: 20 }}
                >
                  搜索
                </Button>
                <ResetBtn
                  form={this.props.form}
                  onReset={() =>
                    this.setState({ createDateStrings: [], outDateStrings: [] })
                  }
                />
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card
          bordered={false}
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="热门活动列表"
          extra={
            <AuthWrapCom authList={addRightList}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  this.props.history.push('/integral-division/activity/detail');
                }}
              >
                新增热门活动
              </Button>
            </AuthWrapCom>
          }
        >
          <Table
            rowKey={(row, index) => index}
            columns={this.columns}
            dataSource={list}
            pagination={{ total }}
          />
        </Card>
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralDivision, system }) => ({
    integralDivision: integralDivision.toJS(),
    system: system.toJS()
  }))(Form.create()(activityPage))
);
