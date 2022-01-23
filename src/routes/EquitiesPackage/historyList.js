import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import {
  Card,
  Button,
  Form,
  Empty,
  Row,
  Col,
  DatePicker,
  Input,
  message,
  Select,
  Tooltip,
} from 'antd';
import moment from 'moment';
import Table from 'components/Table';
import AuthWrapCom from 'components/AuthCom';
import ResetBtn from 'components/ResetBtn';
import { formatFormData, downLoadFileNoTimeLimit } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import { DEFAULT_PAGE_SIZE } from 'constants';
import './index.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Option = Select.Option;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

class HistoryListPage extends React.Component {
  state = {
    currentPage: 1,
  };

  componentWillUnmount() {
    // NOTE: remove Listeners
    eventEmmiter.removeAllListeners();
  }

  componentDidMount() {
    this.handleSearch();
  }

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      if (values.received_time || this.checkSearchItemValueValidate(values)) {
        return this.handleSearch();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { account_id: id, username } = values;
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
    const _username = username.trim();
    if (_username) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  handleSearch = () => {
    const { history, location, system, dispatch } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.received_time && values.received_time.length) {
        query.start_time = moment(values.received_time[0]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        query.end_time = moment(values.received_time[1]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        delete query.received_time;
      }
      query.page = 1;

      const { params } = this.props.system;

      const { pageSize, page } = this.props.system.query;

      if (params.id) {
        query.offer_package_id = parseInt(params.id, 0);
        dispatch({
          type: 'equitiesPackage/getHistoryList',
          payload: {
            ...query,
            limit: pageSize || DEFAULT_PAGE_SIZE,
            page: page || 1,
          },
        });
      }
    });
  };

  resetAction = () => {
    this.props.form.resetFields();
    this.handleSearch();
  };

  renderTable = () => {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
      },
      {
        title: '兌換人會員ID',
        dataIndex: 'account_id',
      },
      {
        title: '兌換碼',
        dataIndex: 'redeem_code_sku',
      },
      {
        title: '會員名稱',
        render: (record) => {
          const { username } = record;
          return username || '--';
        },
      },
      {
        title: '兌換時間',
        dataIndex: 'received_time',
      },
    ];
  };

  exportExcelAction() {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.received_time && values.received_time.length) {
        query.start_time = moment(values.received_time[0]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        query.end_time = moment(values.received_time[1]).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        delete query.received_time;
      }
      const { params } = this.props.system;
      if (params.id) {
        query.offer_package_id = parseInt(params.id, 0);
        const postData = query;
        const url = 'points_offer_package/download_used_record';
        downLoadFileNoTimeLimit(url, postData, '權益包兌換記錄');
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    const { equitiesPackage } = this.props;
    const { currentPage } = this.state;
    const {
      historyListInfo: { list, total, loading, package_total, received_total },
    } = equitiesPackage;
    return (
      <div className="p-fixed-list-wrap p-give-wrap">
        <div className="give-content-wrap">
          <Card>
            <Form>
              <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
                <Col span={11} className="input-box">
                  <FormItem label="兌換人會員ID" {...formItemLayout}>
                    {getFieldDecorator('account_id', {
                      initialValue: query.account_id || '',
                      rules: [
                        {
                          pattern: /^\d*$/g,
                          message: '請輸入純數字ID',
                        },
                      ],
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={11} className="input-box">
                  <FormItem label="會員名稱" {...formItemLayout}>
                    {getFieldDecorator('username', {
                      initialValue: query.username || '',
                    })(<Input placeholder="請輸入" />)}
                  </FormItem>
                </Col>
                <Col span={11} className="input-box">
                  <FormItem label="兌換時間：" {...formItemLayout}>
                    {getFieldDecorator('received_time', {
                      initialValue: query.start_time
                        ? [moment(query.start_time), moment(query.end_time)]
                        : '',
                    })(<RangePicker showTime style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col span={11} className="input-box">
                  <FormItem label="兌換碼" {...formItemLayout}>
                    {getFieldDecorator('redeem_code_sku', {
                      initialValue: query.redeem_code_sku || '',
                    })(<Input placeholder="請輸入" />)}
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
                    onClick={this.handleSearch}
                    style={{ marginRight: 20 }}
                  >
                    搜索
                  </Button>
                  <Button onClick={this.resetAction} iscom="hui">
                    重置
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
          {loading ? (
            <LoadingCom />
          ) : (
            <Card
              bordered={false}
              bodyStyle={{ padding: '10px 20px' }}
              style={{ marginTop: '24px' }}
              title="權益包兌換記錄"
              extra={
                <AuthWrapCom
                  authList={[
                    'operation_manage',
                    'points_offer_package',
                    'download_used_record',
                  ]}
                >
                  <Tooltip title="導出的記錄為1小時前數據">
                    <Button
                      icon="export"
                      type="primary"
                      onClick={this.exportExcelAction.bind(this)}
                    >
                      導出Excel
                    </Button>
                  </Tooltip>
                </AuthWrapCom>
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
                  onChange={this.pageChange}
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
  connect(({ equitiesPackage, system }) => ({
    equitiesPackage: equitiesPackage.toJS(),
    system: system.toJS(),
  }))(Form.create()(HistoryListPage))
);
