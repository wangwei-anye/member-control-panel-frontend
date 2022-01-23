import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import { message, Form, Row, Col, Input, Button, Card, DatePicker } from 'antd';
import FoldableCard from 'components/FoldableCard';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import ExportExcelBtnCom from 'components/ExportExcelBtnCom';
import { formatFormData, thousandFormat, downLoadFile } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import '../finance.less';

const { RangePicker } = DatePicker;
const FormItem = Form.Item;
// 表单项布局
const formItemLayout = {
  labelCol: {
    xs: 8,
    sm: 8,
    md: 8,
    lg: 8,
    xl: 6,
    xxl: 4,
  },
  wrapperCol: {
    xs: 16,
    sm: 16,
    md: 16,
    lg: 16,
    xl: 18,
    xxl: 20,
  },
};

class ListPage extends React.Component {
  state = {
    dateString: [],
  };
  columns = [
    {
      title: '日期',
      dataIndex: 'count_date',
      align: 'center',
    },
    {
      title: '所屬部門',
      dataIndex: 'department_name',
      align: 'center',
    },
    {
      title: ' 賬戶ID',
      dataIndex: 'union_id',
      align: 'center',
    },
    {
      title: '期初餘額',
      align: 'center',
      render: (text, record) => {
        return <span>{thousandFormat(record.begining_balance_cent)}</span>;
      },
    },
    {
      title: '積分授予',
      align: 'center',
      render: (text, record) => {
        return <span>{thousandFormat(record.grant_cent)}</span>;
      },
    },
    {
      title: '積分發放',
      align: 'center',
      render: (text, record) => {
        return <span>{thousandFormat(record.offer_cent)}</span>;
      },
    },
    {
      title: '消費收分',
      children: [
        {
          title: '支付',
          // dataIndex: 'pay_cent',
          align: 'center',
          key: 'pay_cent',
          render: (text, record) => {
            return <span>{thousandFormat(record.pay_cent)}</span>;
          },
        },
        {
          title: '退款',
          // dataIndex: 'refund_cent',
          key: 'refund_cent',
          align: 'center',
          render: (text, record) => {
            return <span>{thousandFormat(record.refund_cent)}</span>;
          },
        },
      ],
    },
    {
      title: '期末餘額',
      align: 'center',
      render: (text, record) => {
        return <span>{thousandFormat(record.ending_balance_cent)}</span>;
      },
    },
  ];

  componentWillUnmount() {
    // NOTE: remove Listeners
    eventEmmiter.removeAllListeners();
  }

  componentDidMount() {
    this.handleKeyupEvent();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const { department_id, time, union_id } = form.getFieldsValue([
        'department_id',
        'time',
        'union_id',
      ]);
      if (
        this.checkSearchItemValueValidate(union_id) ||
        time ||
        department_id !== null
      ) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (id) => {
    if (id !== null && id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        return true;
      }
      message.error('請輸入純數字ID');
      return false;
    }
    return true;
  };

  // 搜索
  searchAction = () => {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.start_date = moment(values.time[0]).format('YYYY-MM-DD');
        query.end_date = moment(values.time[1]).format('YYYY-MM-DD');
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

  exportExcelAction() {
    const query = this.props.system.query;
    if (query.page) {
      delete query.page;
    }
    if (query.pageSize) {
      delete query.pageSize;
    }
    const url = 'point_collect/bu_account_points_list';
    const postData = query;
    downLoadFile(url, postData, 'BU賬戶積分變動匯總');
  }

  render() {
    const { BUAccountListInfo } = this.props.financeSummary;
    const { total, list, loading } = BUAccountListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="發起部門：" {...formItemLayout}>
                  {getFieldDecorator('department_id', {
                    initialValue: query.department_id,
                  })(
                    <PartmentTreeSelect
                      partmentList={this.props.system.partmentList}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="日期" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.start_date
                      ? [moment(query.start_date), moment(query.end_date)]
                      : null,
                  })(
                    <RangePicker
                      disabledDate={(current) => current >= moment()}
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="賬戶ID" {...formItemLayout}>
                  {getFieldDecorator('union_id', {
                    initialValue: query.union_id,
                    rules: [
                      {
                        message: '請輸入純數字ID',
                        pattern: /^\d*$/,
                      },
                    ],
                  })(<Input placeholder="請輸入賬戶ID" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="賬戶名稱" {...formItemLayout}>
                  {getFieldDecorator('union_name', {
                    initialValue: query.union_name,
                  })(<Input placeholder="請輸入賬戶名稱" />)}
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
          title="BU賬戶積分變動匯總"
          extra={
            <ExportExcelBtnCom onClick={this.exportExcelAction.bind(this)} />
          }
        >
          {!loading ? (
            <Table
              bordered
              rowKey={(row, index) => index}
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          ) : (
            <LoadingCom />
          )}
        </Card>
      </div>
    );
  }
}
export default withRouter(
  connect(({ financeSummary, system }) => ({
    financeSummary: financeSummary.toJS(),
    system: system.toJS(),
  }))(Form.create()(ListPage))
);
