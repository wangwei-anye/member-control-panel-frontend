/*  用户积分 */
import React from 'react';
import qs from 'qs';
import { DatePicker, Alert, Row, Col, Tabs } from 'antd';
import Table from 'components/Table';
import { getMemberUserInfo } from 'services/user/users';
import moment from 'moment';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import TabRouter from 'components/TabRouter';
import { USRE_TYPE, MEMBER_DETAIL_TABLIST } from 'config/ob.config';
import { isUserHasRights, thousandFormat } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import './members.less';

const { RangePicker } = DatePicker;

// const flowTypeJson = {
//   1: '發表文章',
//   2: '積分兌換'
// };

const { TabPane } = Tabs;

// 積分明細列表查看
const integralListRights = [
  'member_manage',
  'member_detail',
  'integral_flow',
  'integral_flow_list',
];
// 積分有效期查看
const pointValidRights = [
  'member_manage',
  'member_detail',
  'integral_flow',
  'points_valid',
];
// 積分冻结列表查看
const freezeRecordRights = [
  'member_manage',
  'member_detail',
  'integral_flow',
  'freeze_record_list',
];
const userInfoRights = [
  'member_manage',
  'member_detail',
  'integral_flow',
  'user_info',
];

// const linkRights = ['member_manage', 'integral_flow', 'order_number_url']; // 查看訂單號跳轉鏈接(到訂單詳情)

const freezeStatus = {
  freezing: '冻结中',
  cancelled: '已取消',
  transacted: '已转成交易',
};
class UserIntegral extends React.Component {
  columns = [
    {
      title: '流水號',
      key: 'id',
      render: (text, record) => {
        return record.id || '--';
      },
    },
    {
      title: '變動前餘額',
      key: 'id',
      render: (text, record) => {
        return thousandFormat(record.before_balance_amount);
      },
    },
    {
      title: '變動數額',
      render: (text, record) => {
        return thousandFormat(record.amount);
      },
    },
    {
      title: '變動后餘額',
      render: (text, record) => {
        return thousandFormat(record.after_balance_amount);
      },
    },
    {
      title: '內部交易類型',
      dataIndex: 'record_type_name',
    },
    {
      title: '外部交易類型',
      dataIndex: 'source',
    },
    {
      title: '相關訂單號',
      dataIndex: 'out_sn',
    },
    {
      title: '備註',
      dataIndex: 'remark',
    },
    {
      title: '變動時間',
      render: (text, record) => {
        return moment(record.updated_at).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];

  pointsValidityColumns = [
    {
      title: '過期時間',
      render: (record) => {
        // console.log(record);
        const { expire_at } = record;
        return moment(expire_at).format('YYYY-MM-DD');
      },
    },
    {
      title: '積分數額',
      render: (record) => {
        const { balance_amount } = record;
        return thousandFormat(balance_amount);
      },
    },
  ];

  freezeRecordColumns = [
    {
      title: '流水號',
      dataIndex: 'id',
    },
    {
      title: '凍結數額',
      dataIndex: 'freeze_amount',
    },
    {
      title: '外部交易類型',
      dataIndex: 'source',
    },
    {
      title: '相關訂單號',
      dataIndex: 'out_sn',
    },
    {
      title: '備註',
      dataIndex: 'remark',
    },
    {
      title: '原因',
      dataIndex: 'reason',
    },
    {
      title: '狀態',
      render: (record) => {
        const { status } = record;
        return freezeStatus[status];
      },
    },
    {
      title: '變動時間',
      render: (record) => {
        const { updated_at } = record;
        return moment(updated_at).format('YYYY-MM-DD');
      },
    },
  ];

  constructor(props) {
    super(props);
    const {
      system: { query },
    } = this.props;
    const {
      pointValidTablePageSize,
      freezeRecordTablePageSize,
      dealDetailTablePageSize,
      pointValidTablePage,
      freezeRecordTablePage,
      dealDetailTablePage,
    } = query;
    this.genMonthFilterBar();
    this.state = {
      // eslint-disable-next-line radix
      pointValidTablePage: parseInt(pointValidTablePage || 1),
      // eslint-disable-next-line radix
      freezeRecordTablePage: parseInt(freezeRecordTablePage || 1),
      // eslint-disable-next-line radix
      dealDetailTablePage: parseInt(dealDetailTablePage || 1),
      // eslint-disable-next-line radix
      dealDetailTablePageSize: parseInt(dealDetailTablePageSize || 10),
      // eslint-disable-next-line radix
      pointValidTablePageSize: parseInt(pointValidTablePageSize || 10),
      // eslint-disable-next-line radix
      freezeRecordTablePageSize: parseInt(freezeRecordTablePageSize || 10),
      nick_name: '',
      updated_at: '',
      balance_amount: 0,
      freeze_amount: 0,
      activeKey: null,
      pickerValue: [],
    };
  }

  async componentDidMount() {
    const {
      system: { query },
    } = this.props;
    if (isUserHasRights(userInfoRights)) {
      const {
        data: { status, data },
      } = await getMemberUserInfo(query.id);
      if (status) {
        // eslint-disable-next-line prefer-const
        let { nick_name, updated_at, balance_amount, freeze_amount } = data;
        if (updated_at) {
          updated_at = moment(updated_at).format('YYYY-MM-DD HH:mm:ss');
        } else {
          updated_at = '--';
        }
        if (nick_name && nick_name.length > 16) {
          const text1 = nick_name.slice(0, 16);
          const text2 = nick_name.slice(16, 32);
          if (nick_name.length > 32) {
            nick_name = `${text1}\n${text2}...`;
          } else {
            nick_name = `${text1}\n${text2}`;
          }
        }
        this.setState({ nick_name, updated_at, balance_amount, freeze_amount });
      }
    }
    this.genTabsActiveKey();
    this.initDefaultPickerValue();
  }

  initDefaultPickerValue = () => {
    const {
      system: { query },
    } = this.props;
    const { start_time, end_time } = query;
    if (start_time && end_time) {
      const [v1, v2] = start_time.split(' ');
      if (v2) {
        this.setState({ pickerValue: [moment(start_time), moment(end_time)] });
      }
    }
  };

  handleTabsChange = (activeIndex) => {
    const {
      history,
      location,
      system: { query },
    } = this.props;
    this.setState({ activeKey: `${activeIndex}` });
    const dateStr = this.list[activeIndex];
    if (dateStr !== '全部') {
      const [year, month] = dateStr.split('-');
      const start_time = `${year}-${month}-1`;
      // eslint-disable-next-line radix
      const days = this.getCurrentMonthDays(parseInt(year), parseInt(month));
      const end_time = `${year}-${month}-${days}`;
      query.start_time = start_time;
      query.end_time = end_time;
    } else {
      delete query.start_time;
      delete query.end_time;
      this.setState({ pickerValue: [] });
    }
    query.type = 'deal';
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  };

  getCurrentMonthDays = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  handleDatePickerConfrim = (values) => {
    const {
      history,
      location,
      system: { query },
    } = this.props;
    if (values.length === 0) {
      return;
    }
    this.setState({ pickerValue: values });
    query.start_time = moment(values[0]).format('YYYY-MM-DD HH:mm:ss');
    query.end_time = moment(values[1]).format('YYYY-MM-DD HH:mm:ss');
    this.setState({ activeKey: null });
    query.type = 'deal';
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  };

  pointsValidTableChange = (pagination) => {
    const { history, location, system } = this.props;
    let query = system.query;
    this.setState({
      pointValidTablePage: pagination.current,
      pointValidTablePageSize: pagination.pageSize,
    });
    query = {
      ...query,
      type: 'valid',
      pointValidTablePage: pagination.current,
      pointValidTablePageSize: pagination.pageSize,
    };
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  };

  freezeRecordTableChange = (pagination) => {
    const { history, location, system } = this.props;
    let query = system.query;
    this.setState({
      freezeRecordTablePage: pagination.current,
      freezeRecordTablePageSize: pagination.pageSize,
    });
    query = {
      ...query,
      type: 'freezeRecord',
      freezeRecordTablePage: pagination.current,
      freezeRecordTablePageSize: pagination.pageSize,
    };
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  };

  handleDealDetailTableChange = (pagination) => {
    const { history, location, system } = this.props;
    let query = system.query;
    this.setState({
      dealDetailTablePage: pagination.current,
      dealDetailTablePageSize: pagination.pageSize,
    });
    query = {
      ...query,
      type: 'deal',
      dealDetailTablePage: pagination.current,
      dealDetailTablePageSize: pagination.pageSize,
    };
    const querystring = qs.stringify(query);
    history.push({ ...location, search: `?${querystring}` });
  };

  genTabsActiveKey = () => {
    const { system } = this.props;
    const query = system.query;
    const start_time = query.start_time;
    if (start_time) {
      let i = null;
      const [v1, v2] = start_time.split(' ');
      if (v2) {
        this.setState({ activeKey: null });
        return;
      }
      const [year, month, day] = moment(new Date(start_time))
        .format('YYYY-MM-DD')
        .split('-');
      this.list.forEach((item, index) => {
        if (item === `${year}-${month}`) {
          i = index;
        }
      });
      return this.setState({ activeKey: `${i}` });
    }
    return this.setState({ activeKey: `${this.list.length - 1}` });
  };

  genMonthFilterBar = () => {
    this.list = [];
    const startYear = 2019;
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const intervalYear = currentYear - startYear;
    // const intervalYear = 2;
    if (intervalYear > 0) {
      for (let i = 0; i < intervalYear; i += 1) {
        for (let j = 1; j < 13; j += 1) {
          const m = j < 10 ? `0${j}` : j;
          this.list.push(`${startYear + i}-${m}`);
        }
      }
    }
    for (let i = 1; i < currentMonth; i += 1) {
      const m = i < 10 ? `0${i}` : i;
      this.list.push(`${currentYear}-${m}`);
    }
    this.list.push('全部');
  };

  handlePickerChange = (values) => {
    this.setState({ pickerValue: values });
  };

  render() {
    const {
      memberInfo,
      system: { query },
    } = this.props;
    const { userIntegralInfo, pointsValidData, freezeRecordData } = memberInfo;
    const { list, total, loading } = userIntegralInfo;
    const { id } = query;
    const {
      activeKey,
      balance_amount,
      freeze_amount,
      updated_at,
      nick_name,
      pointValidTablePage,
      pointValidTablePageSize,
      freezeRecordTablePage,
      freezeRecordTablePageSize,
      dealDetailTablePage,
      dealDetailTablePageSize,
      pickerValue,
    } = this.state;
    return (
      <div className="user-detail-wrap">
        <div className="user-integral-wrap">
          <TabRouter tabList={MEMBER_DETAIL_TABLIST} defaultKey="integral" />
          <div className="integral-content">
            <div className="account-info">
              <h3 className="title">積分帳戶信息</h3>
              {isUserHasRights(userInfoRights) ? (
                <Row
                  className="content"
                  type="flex"
                  gutter={{ xs: 8, sm: 16, md: 24 }}
                >
                  <Col className="box first" span={4}>
                    <p className="sub-title">會員 ID</p>
                    <p className="text">{id}</p>
                  </Col>
                  <Col className="box" span={8}>
                    <p className="sub-title">暱稱</p>
                    <p className="text">{nick_name}</p>
                  </Col>
                  <Col className="box" span={6}>
                    <p className="sub-title">更新時間</p>
                    <p className="text">{updated_at || '--'}</p>
                  </Col>
                  <Col className="box" span={3}>
                    <p className="sub-title">帳戶餘額</p>
                    <p className="text">{thousandFormat(balance_amount)}</p>
                  </Col>
                  <Col className="box" span={3}>
                    <p className="sub-title">凍結分數</p>
                    <p className="text">{thousandFormat(freeze_amount)}</p>
                  </Col>
                </Row>
              ) : (
                // eslint-disable-next-line react/jsx-indent
                <Alert
                  message="沒有權限查看積分帳戶信息"
                  type="error"
                  showIcon
                />
              )}
            </div>
          </div>
        </div>

        <div className="points-validator-table">
          <h3 className="title">
            <span>積分有效期</span>
            <span className="points">
              總計： <em>{thousandFormat(pointsValidData.total_amount)}積分</em>
            </span>
          </h3>
          <div className="content">
            {isUserHasRights(pointValidRights) ? (
              pointsValidData.loading ? (
                <LoadingCom />
              ) : (
                <Table
                  columns={this.pointsValidityColumns}
                  dataSource={pointsValidData.list}
                  rowKey={(row, index) => index}
                  pagination={{
                    total: pointsValidData.total,
                    pageSize: pointValidTablePageSize,
                    current: pointValidTablePage,
                  }}
                  onChange={this.pointsValidTableChange}
                />
              )
            ) : (
              // eslint-disable-next-line react/jsx-indent
              <Alert message="沒有權限查看積分有效期" type="error" showIcon />
            )}
          </div>
        </div>

        <div className="points-validator-table">
          <h3 className="title">
            <span>凍結中積分</span>
            <span className="points">
              總計： <em>{thousandFormat(freeze_amount)}積分</em>
            </span>
          </h3>
          <div className="content">
            {isUserHasRights(freezeRecordRights) ? (
              freezeRecordData.loading ? (
                <LoadingCom />
              ) : (
                <Table
                  columns={this.freezeRecordColumns}
                  dataSource={freezeRecordData.list}
                  rowKey={(row, index) => index}
                  pagination={{
                    total: freezeRecordData.total,
                    pageSize: freezeRecordTablePageSize,
                    current: freezeRecordTablePage,
                  }}
                  onChange={this.freezeRecordTableChange}
                />
              )
            ) : (
              // eslint-disable-next-line react/jsx-indent
              <Alert message="沒有權限查看凍結中積分" type="error" showIcon />
            )}
          </div>
        </div>

        <div className="points-detail-table">
          <h3 className="title">交易明細</h3>
          <Row className="filter-bar" justify="space-between" type="flex">
            <Col span={12} className="tabs">
              <Tabs
                activeKey={activeKey}
                tabPosition="top"
                onChange={this.handleTabsChange}
              >
                {this.list.map((item, i) => (
                  <TabPane tab={item} key={i} />
                ))}
              </Tabs>
            </Col>
            <Col span={6}>
              <RangePicker
                showTime
                value={pickerValue}
                style={{ width: '100%' }}
                onOk={this.handleDatePickerConfrim}
                onChange={this.handlePickerChange}
              />
            </Col>
          </Row>
          <div className="content">
            {isUserHasRights(integralListRights) ? (
              loading ? (
                <LoadingCom />
              ) : (
                <Table
                  columns={this.columns}
                  dataSource={list}
                  rowKey={(row, index) => index}
                  pagination={{
                    total,
                    current: dealDetailTablePage,
                    pageSize: dealDetailTablePageSize,
                  }}
                  onChange={this.handleDealDetailTableChange}
                />
              )
            ) : (
              // eslint-disable-next-line react/jsx-indent
              <Alert message="沒有權限查看積分明細列表" type="error" showIcon />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(
  connect(({ memberInfo, system }) => ({
    memberInfo: memberInfo.toJS(),
    system: system.toJS(),
  }))(UserIntegral)
);
