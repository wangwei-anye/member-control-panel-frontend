import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import {
  message,
  Form,
  Row,
  Col,
  Input,
  Button,
  Card,
  DatePicker,
  Select,
} from 'antd';
import FoldableCard from 'components/FoldableCard';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import ExportExcelBtnCom from 'components/ExportExcelBtnCom';
import { formatFormData, thousandFormat, downLoadFile } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import { consumListExport } from 'services/finance/integral-detail/detail';
import ExportModal from 'components/ExportModal';
import '../finance.less';

const Option = Select.Option;
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
const json2Arr = (obj) => {
  const arr = [];
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    Object.keys(obj).forEach((item) => {
      arr.push({
        value: item,
        name: obj[item],
      });
    });
  }
  arr.unshift({
    value: '',
    name: '全部',
  });
  return arr;
};
class ListPage extends React.Component {
  state = {
    dateString: [],
    modalVisible: false,
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
      if (this.state.modalVisible) {
        return;
      }
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { transaction_type, time } = values;
      if (
        this.checkSearchItemValueValidate(values) ||
        time ||
        transaction_type !== null
      ) {
        return this.searchAction();
      }
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { out_sn, sn, to_union_id, from_union_id, entry_name } = values;
    let isValid = false;
    if (from_union_id) {
      const _from_union_id = from_union_id.trim();
      if (_from_union_id && /^\d*$/g.test(_from_union_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的發放賬戶ID');
        return false;
      }
    }

    if (to_union_id) {
      const _to_union_id = to_union_id.trim();
      if (_to_union_id && /^\d*$/g.test(_to_union_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的用戶賬戶ID');
        return false;
      }
    }

    const _sn = sn.trim();
    if (_sn) {
      isValid = true;
    }

    const _entry_name = entry_name.trim();
    if (_entry_name) {
      isValid = true;
    }

    const _out_sn = out_sn.trim();
    if (_out_sn) {
      isValid = true;
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  // 搜索
  searchAction = () => {
    const { history, location, system } = this.props;
    const { dateString } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.start_time = moment(values.time[0]).format('YYYY-MM-DD');
        query.end_time = moment(values.time[1]).format('YYYY-MM-DD');
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

  timeChangeAction(date, dateString) {
    this.setState({
      dateString,
    });
  }

  exportExcelAction() {
    // const query = this.props.system.query;
    // if (query.page) {
    //   delete query.page;
    // }
    // if (query.pageSize) {
    //   delete query.pageSize;
    // }
    // const url = 'points_detail/consume_list';
    // const postData = query;
    // downLoadFile(url, postData, '積分消費明細列表');
    const { consumListInfo } = this.props.financeDetail;
    const { total } = consumListInfo;
    if (total > 100000) {
      message.error('僅支持導出少於10萬條的數據');
      return;
    }

    const query = this.props.system.query;
    if (query.page) {
      delete query.page;
    }
    if (query.pageSize) {
      delete query.pageSize;
    }
    const postData = query;
    const {
      start_time,
      end_time,
      start_date,
      end_date,
      grant_start_time,
      grant_end_time,
    } = postData;
    if (!(start_time || start_date || grant_start_time)) {
      message.error('請選擇導出的時間：僅支持導出一個月內，並少於10萬條的數據');
      return;
    }

    if (
      (grant_start_time && grant_start_time === grant_end_time) ||
      (start_time && start_time === end_time) ||
      (start_date && start_date === end_date)
    ) {
      message.error('導出的開始時間和結束時間不能相同!');
      return;
    }
    let isInOneMonth = false;
    const newStartDate = new Date(start_time || start_date || grant_start_time);
    const newEndDate = new Date(end_time || end_date || grant_end_time);
    // 同年同月
    if (
      newStartDate.getFullYear() === newEndDate.getFullYear() &&
      newStartDate.getMonth() === newEndDate.getMonth()
    ) {
      isInOneMonth = true;
    }
    // 同年跨月
    if (
      newStartDate.getFullYear() === newEndDate.getFullYear() &&
      newStartDate.getMonth() + 1 === newEndDate.getMonth() &&
      newStartDate.getDate() >= newEndDate.getDate()
    ) {
      isInOneMonth = true;
    }
    // 跨年跨月
    if (
      newStartDate.getFullYear() + 1 === newEndDate.getFullYear() &&
      newStartDate.getMonth() === 11 &&
      newEndDate.getMonth() === 0 &&
      newStartDate.getDate() >= newEndDate.getDate()
    ) {
      isInOneMonth = true;
    }
    if (!isInOneMonth) {
      message.error('僅支持導出一個月內的數據，請優化篩選條件');
      return;
    }

    this.setState({
      modalVisible: true,
    });
  }

  createExportTask = async (param) => {
    const query = this.props.system.query;
    if (query.page) {
      delete query.page;
    }
    if (query.pageSize) {
      delete query.pageSize;
    }
    const postData = query;
    const { data } = await consumListExport({
      task_info: param,
      filter: postData,
    });
    if (data.status) {
      message.success('提交成功，請往任務中心查看狀態');
      this.setState({
        modalVisible: false,
      });
    }
  };

  render() {
    const { consumListInfo, searchConfig } = this.props.financeDetail;
    const { total, list, loading } = consumListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    if (!Object.keys(searchConfig).length) {
      return null;
    }
    const columns = [
      {
        title: '外部流水號',
        dataIndex: 'out_sn',
      },
      {
        title: '內部流水號',
        dataIndex: 'sn',
      },
      {
        title: '客户賬戶',
        dataIndex: 'from_union_id',
      },
      {
        title: '賬戶類型',
        render: (text, record) => {
          return searchConfig.account_type[record.to_role_type]
            ? searchConfig.account_type[record.to_role_type]
            : record.to_role_type || '--';
        },
      },
      {
        title: '日期',
        dataIndex: 'transact_time',
      },
      {
        title: '幣種',
        render: () => {
          return 'HKD';
        },
      },
      {
        title: '變動前餘額',
        // dataIndex: 'before_balance_cent',
        render: (record) => {
          return thousandFormat(record.before_balance_cent);
        },
      },
      {
        title: '發生金額',
        // dataIndex: 'amount_cent',
        render: (record) => {
          return thousandFormat(record.amount_cent);
        },
      },
      {
        title: '變動後金額',
        // dataIndex: 'after_balance_cent',
        render: (record) => {
          return thousandFormat(record.after_balance_cent);
        },
      },
      {
        title: '外部交易類型',
        render: (text, record) => {
          return searchConfig.source[record.source]
            ? searchConfig.source[record.source]
            : record.source || '--';
        },
      },
      {
        title: '內部交易類型',
        render: (text, record) => {
          return searchConfig.transaction_type[record.transaction_type]
            ? searchConfig.transaction_type[record.transaction_type]
            : record.transaction_type || '--';
        },
      },
      {
        title: '商戶ID',
        dataIndex: 'to_union_id',
      },
      {
        title: '商戶名稱',
        dataIndex: 'to_name',
      },
      {
        title: '備註信息',
        dataIndex: 'remark',
      },
    ];
    const transactionTypeList = json2Arr(searchConfig.transaction_type);
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="外部流水號" {...formItemLayout}>
                  {getFieldDecorator('out_sn', {
                    initialValue: query.out_sn || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="內部流水號" {...formItemLayout}>
                  {getFieldDecorator('sn', {
                    initialValue: query.sn || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="客戶賬戶ID" {...formItemLayout}>
                  {getFieldDecorator('from_union_id', {
                    initialValue: query.from_union_id || '',
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
                <FormItem label="發分積分賬戶" {...formItemLayout}>
                  {getFieldDecorator('entry_name', {
                    initialValue: query.entry_name || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="商户ID" {...formItemLayout}>
                  {getFieldDecorator('to_union_id', {
                    initialValue: query.to_union_id || '',
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
                <FormItem label="商戶名稱" {...formItemLayout}>
                  {getFieldDecorator('to_name', {
                    initialValue: query.to_name || '',
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11} className="none">
                <FormItem label="內部交易類型" {...formItemLayout}>
                  {getFieldDecorator('transaction_type', {
                    initialValue: query.transaction_type || '',
                  })(
                    <Select
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                    >
                      {transactionTypeList.map((item, index) => {
                        return (
                          <Option key={index} value={item.value}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="日期" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.start_time
                      ? [moment(query.start_time), moment(query.end_time)]
                      : null,
                  })(
                    <RangePicker
                      disabledDate={(current) => current >= moment()}
                      style={{ width: '100%' }}
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
          title="積分消費明細列表"
          extra={
            <div>
              <span style={{ marginRight: 15 }}>限定十萬條</span>
              <ExportExcelBtnCom
                disabled={loading}
                onClick={this.exportExcelAction.bind(this)}
              />
            </div>
          }
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={list}
              pagination={{ total }}
            />
          )}
        </Card>
        {this.state.modalVisible ? (
          <ExportModal
            createExportTask={this.createExportTask.bind(this)}
            handleCancel={() => {
              this.setState({
                modalVisible: false,
              });
            }}
          />
        ) : null}
      </div>
    );
  }
}
export default withRouter(
  connect(({ financeDetail, system }) => ({
    financeDetail: financeDetail.toJS(),
    system: system.toJS(),
  }))(Form.create()(ListPage))
);
