import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import { Card, Button, Form, Empty, Row, Col, DatePicker } from 'antd';
import moment from 'moment';
import Table from 'components/Table';
import AuthWrapCom from 'components/AuthCom';
import ResetBtn from 'components/ResetBtn';
import FoldableCard from 'components/FoldableCard';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';

import './index.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class QrCodeDataRecordPage extends React.Component {
  state = {
    currentPage: 1,
  };

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
      const { time } = form.getFieldsValue(['time']);
      if (time) {
        return this.handleSearch();
      }
    });
  }

  handleSearch = () => {
    const { history, location, system } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const { time } = values;
      if (!time || !time.length) {
        return;
      }
      const query = { ...system.query };
      query.page = 1;
      query.start_time = time[0].format('YYYY-MM-DD HH:mm:ss');
      query.end_time = time[1].format('YYYY-MM-DD HH:mm:ss');
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
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

  renderTable = () => {
    return [
      {
        title: '交易流水號',
        dataIndex: 'out_sn',
      },
      {
        title: '會員ID',
        dataIndex: 'account_id',
        width: 100,
      },
      // {
      //   title: '會員暱稱',
      //   dataIndex: 'nick_name',
      // },
      {
        title: '變動時間',
        dataIndex: 'created_at',
      },
      // {
      //   title: '變動前餘額',
      //   dataIndex: 'before_balance_amount',
      // },
      {
        title: '積分變動',
        dataIndex: 'amount',
      },
      // {
      //   title: '變動後餘額',
      //   dataIndex: 'after_balance_amount',
      // },
      {
        title: 'QR Code 名稱',
        dataIndex: 'entry_name',
      },
      {
        title: '積分明細顯示文案',
        dataIndex: 'title',
      },
      {
        title: '發分帳戶 ID',
        dataIndex: 'from_union_id',
      },
      {
        title: '發放帳戶名稱',
        dataIndex: 'from_union_name',
      },
    ];
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    const { qrcode } = this.props;
    const { currentPage } = this.state;
    const { fetchQrcodeAccountListFlag } = qrcode;
    const {
      list,
      total_record: total,
      total_amount,
      transaction_count,
    } = qrcode.accountRecord;
    return (
      <div className="p-fixed-list-wrap p-give-wrap">
        <div className="give-content-wrap">
          <FoldableCard
            className="qr-code-card"
            bodyStyle={{ borderTop: '1px solid #e8e8e8' }}
            title="搜索條件"
          >
            <Form>
              <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
                <Col span={11}>
                  <FormItem label="篩選時間：" {...formItemLayout}>
                    {getFieldDecorator('time', {
                      initialValue: query.start_time
                        ? [moment(query.start_time), moment(query.end_time)]
                        : '',
                    })(<RangePicker showTime style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col
                  span={13}
                  style={{
                    textAlign: 'right',
                    marginBottom: 10,
                  }}
                >
                  <Button
                    type="primary"
                    icon="search"
                    onClick={this.handleSearch}
                    style={{ marginRight: 20 }}
                  >
                    搜索
                  </Button>
                  <ResetBtn form={this.props.form} />
                </Col>
              </Row>
            </Form>
          </FoldableCard>
          {fetchQrcodeAccountListFlag ? (
            <LoadingCom />
          ) : (
            <Card
              bordered={false}
              bodyStyle={{ padding: '10px 20px' }}
              style={{ marginTop: '24px' }}
              title="領取記錄"
              extra={
                <div>
                  <span className="text-1">總計：</span>
                  <span className="text-2">{total_amount} 積分</span>
                  <span className="line" />
                  <span className="text-1">總交易筆數：</span>
                  <span className="text-2">{transaction_count} 筆</span>
                </div>
              }
            >
              {list.length > 0 ? (
                <Table
                  rowKey={(row, index) => index}
                  columns={this.renderTable()}
                  dataSource={list}
                  pagination={{
                    total,
                    showSizeChanger: true,
                    page: currentPage,
                  }}
                  scroll={{ x: 1300 }}
                  onChange={this.pageChange}
                  bordered
                />
              ) : (
                <Empty description="暫無數據" />
              )}
            </Card>
          )}
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ qrcode, system }) => ({
    qrcode: qrcode.toJS(),
    system: system.toJS(),
  }))(Form.create()(QrCodeDataRecordPage))
);
