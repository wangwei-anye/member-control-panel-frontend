import React from 'react';
import { connect } from 'dva';
import {
  message,
  Form,
  Card,
  Row,
  Col,
  Input,
  Button,
  DatePicker,
  Modal,
} from 'antd';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import Table from 'components/Table';
import AuthWrapCom from 'components/AuthCom';
import AuthBtnCom from 'components/AuthBtnCom';
import ResetBtn from 'components/ResetBtn';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import { formatFormData, isUserHasRights } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import {
  publishOrCancelRequest,
  deleteRequest,
  changePositionRequest,
} from 'services/infinite/infinite';
import './index.less';

const formItemLayout = {
  labelCol: {
    xs: 10,
    sm: 10,
    md: 9,
    lg: 6,
    xl: 5,
    xxl: 4,
  },
  wrapperCol: {
    xs: 14,
    sm: 14,
    md: 15,
    lg: 18,
    xl: 18,
    xxl: 18,
  },
};
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const addAndUpdateRightList = [
  'operation_manage',
  'points_area',
  'earn_points',
  'add_and_update',
];
const deleteRightList = [
  'operation_manage',
  'points_area',
  'earn_points',
  'delete',
];
const publishRightList = [
  'operation_manage',
  'points_area',
  'earn_points',
  'publish',
];
const detailRightList = [
  'operation_manage',
  'points_area',
  'earn_points',
  'detail',
];
const changePositionRightList = [
  'operation_manage',
  'points_area',
  'earn_points',
  'change_position',
];

class ListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createdDateStringList: [],
    };
  }
  componentWillUnmount() {
    // NOTE: remove Listeners
    eventEmmiter.removeAllListeners();
  }
  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: '80px',
    },
    {
      title: '主標題',
      dataIndex: 'title',
    },
    {
      title: '創建時間',
      render: (text, record) => {
        return record.created_at || '--';
      },
    },
    {
      title: '上下架時間',
      render: (text, record) => {
        if (record.plan_online_at && record.plan_offline_at) {
          return (
            moment(record.plan_online_at).format('YYYY-MM-DD HH:mm') +
            '-' +
            moment(record.plan_offline_at).format('YYYY-MM-DD HH:mm')
          );
        }
        return '--';
      },
    },
    {
      title: '創建人',
      width: '120px',
      dataIndex: 'creator_name',
    },
    {
      title: '展示順序',
      width: '220px',
      render: (text, record, index) => {
        return this.renderPosition(record, index);
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

  componentDidMount() {
    this.handleKeyupEvent();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { off_at, created_at } = values;
      if (this.checkSearchItemValueValidate(values) || created_at) {
        return this.handleSearch();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { id, title, create_by } = values;
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

    const _create_by = create_by.trim();
    if (_create_by) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  renderOperation(record) {
    let { status } = record;
    status = parseInt(status, 10);
    if (status === 1 || status === 3) {
      // 上架中
      return (
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record, 'look')}
          {this.publishReactDomCom(record, 'cancel')}
        </span>
      );
    }
    if (status === 2) {
      // 下架
      return (
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record, 'look')}
          {this.detailReactDomCom(record, 'edit')}
          {this.publishReactDomCom(record, 'publish')}
        </span>
      );
    }
    if (status === 0) {
      return (
        <span className="m-operation-wrap">
          {this.detailReactDomCom(record, 'look')}
          {this.detailReactDomCom(record, 'edit')}
          {this.publishReactDomCom(record, 'publish')}
          {this.deleteReactDomCom(record)}
        </span>
      );
    }
    return (
      <span className="m-operation-wrap">
        {this.detailReactDomCom(record, 'look')}
      </span>
    );
  }

  renderPosition(record, index) {
    let { status } = record;
    status = parseInt(status, 10);
    const { total } = this.props.infinite.areaInfo;
    const No = record.position;
    if (status !== 1) {
      return <span className="m-operation-wrap">--</span>;
    }
    return (
      <span className="m-operation-wrap">
        <span className="u-operation-item u-color-red">
          <b>{No}</b>
        </span>
        <span>
          {isUserHasRights(changePositionRightList) ? (
            <span>
              {total <= 1 ? null : (
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
                      onClick={this.handleOrder.bind(
                        this,
                        record,
                        index,
                        'down'
                      )}
                    >
                      下降
                    </span>
                  )}
                </span>
              )}
            </span>
          ) : null}
        </span>
      </span>
    );
  }

  detailReactDomCom(record, type = 'look') {
    return (
      <AuthBtnCom
        authList={record.permission}
        currrentAuth={type === 'look' ? 'detail' : 'add_and_update'}
      >
        <span
          className="u-operation-item u-color-blue"
          onClick={this.handleToDetail.bind(this, record, type)}
        >
          {type === 'look' ? '查看' : '編輯'}
        </span>
      </AuthBtnCom>
    );
  }

  publishReactDomCom(record, type = 'publish') {
    return (
      <AuthBtnCom authList={record.permission} currrentAuth="publish">
        <span
          className="u-operation-item u-color-red"
          onClick={this.handlePublishOrCancel.bind(this, record, type)}
        >
          {type === 'publish' ? '發佈' : '取消發佈'}
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

  handleToDetail = (record, type = 'look') => {
    if (!record.id) {
      return;
    }
    this.props.history.push(
      `/01-infinite/area/detail?id=${record.id}&type=${type}`
    );
  };

  handlePublishOrCancel = (record, type) => {
    if (!record.id) {
      return;
    }
    const self = this;
    const content =
      type === 'publish'
        ? '確定要發佈該項內容嗎？'
        : '確定要取消發佈該項內容嗎？';
    confirm({
      iconType: 'info-circle',
      title: '',
      content,
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await publishOrCancelRequest({
            id: record.id,
            action: type,
            port_key: 'member_points_earn',
          });
          resolve();
          if (data.status) {
            if (data.data.status === -1) {
              self.checkPublishConfirm(record);
            } else {
              self.reloadPage();
            }
          }
        });
      },
    });
  };

  checkPublishConfirm(record) {
    const self = this;
    confirm({
      iconType: 'info-circle',
      title: '',
      content: '當前推薦內容的發佈時間已經過期，請調整發佈時間後再嘗試',
      onOk() {
        return new Promise((resolve) => {
          resolve();
          self.props.history.push(
            `/01-infinite/area/detail?id=${record.id}&type=edit`
          );
        });
      },
    });
  }

  handleDelete = (record) => {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      iconType: 'info-circle',
      title: '',
      content: '刪除操作不可恢復，你還要繼續嗎？',
      okText: '繼續',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await deleteRequest({
            id: record.id,
            port_key: 'member_points_earn',
          });
          if (data.status) {
            self.reloadPage();
          }
          resolve();
        });
      },
    });
  };

  handleOrder = async (record, index, type) => {
    const { data } = await changePositionRequest({
      id: record.id,
      position: type === 'up' ? record.position - 1 : +record.position + 1,
      port_key: 'member_points_earn',
    });
    if (data.status) {
      this.reloadPage();
    }
  };
  handleAddShopClick = () => {
    this.props.history.push('/01-infinite/area/detail');
  };
  timeChangeAction = (type, date, dateString) => {
    const attr = `${type}DateStringList`;
    this.setState({
      [attr]: dateString,
    });
  };
  handleSearch = () => {
    const { history, location } = this.props;
    const { createdDateStringList } = this.state;
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      delete values.created_at;
      delete values.off_at;
      const query = formatFormData(values);
      if (createdDateStringList.length) {
        query.create_start_time = createdDateStringList[0];
        query.create_end_time = createdDateStringList[1];
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
  render() {
    const { areaInfo } = this.props.infinite;
    const { list, total, loading } = areaInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-recommendlist-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row
              className="form-control-row"
              gutter={{ xs: 8, sm: 16, md: 24 }}
            >
              <Col span={11}>
                <FormItem label="ID" {...formItemLayout}>
                  {getFieldDecorator('id', {
                    initialValue: query.id,
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
                <FormItem label="主標題" {...formItemLayout}>
                  {getFieldDecorator('title', {
                    initialValue: query.title || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="創建人" {...formItemLayout}>
                  {getFieldDecorator('create_by', {
                    initialValue: query.create_by || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="創建時間" {...formItemLayout}>
                  {getFieldDecorator('created_at', {
                    initialValue: query.create_start_time
                      ? [
                          moment(query.create_start_time),
                          moment(query.create_end_time),
                        ]
                      : null,
                  })(
                    <RangePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD HH:mm:ss"
                      showTime
                      disabledDate={(current) => {
                        return (
                          current &&
                          new Date(current.format('YYYY-MM-DD')) * 1 >
                            new Date(moment().format('YYYY-MM-DD')) * 1
                        );
                      }}
                      onChange={this.timeChangeAction.bind(this, 'created')}
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
                <ResetBtn
                  form={this.props.form}
                  onReset={() =>
                    this.setState({
                      createdDateStringList: [],
                    })
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
          title="賺分任務列表"
          extra={
            <AuthWrapCom authList={addAndUpdateRightList}>
              <Button
                icon="plus"
                type="primary"
                onClick={this.handleAddShopClick}
              >
                新增賺分任務
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
              onChange={this.pageChange}
            />
          )}
        </Card>
      </div>
    );
  }
}
export default withRouter(
  connect(({ system, infinite }) => {
    return {
      infinite: infinite.toJS(),
      system: system.toJS(),
    };
  })(Form.create()(ListPage))
);
