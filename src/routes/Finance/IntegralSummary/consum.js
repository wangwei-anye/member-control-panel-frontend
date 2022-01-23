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
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import { formatFormData, thousandFormat, downLoadFile } from 'utils/tools';
import { consumListExport } from 'services/finance/integral-summary/summary';
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
const forEachItem = (arr) => {
  let resultArr = [];
  arr.forEach((item) => {
    if (item.child && Array.isArray(item.child)) {
      resultArr = resultArr.concat(forEachItem(item.child));
    } else {
      resultArr.push(item);
    }
  });
  return resultArr;
};
class ListPage extends React.Component {
  state = {
    modalVisible: false,
  };
  columns = [
    {
      title: '日期',
      dataIndex: 'count_date',
    },
    {
      title: '商戶ID',
      dataIndex: 'union_id',
    },
    {
      title: '商戶名稱',
      dataIndex: 'name',
    },
    {
      title: '消費類型',
      render: (text, record) => {
        return <span>{+record.type === 1 ? '積分消費' : '商家收分'}</span>;
      },
    },
    {
      title: '消費金額',
      // dataIndex: 'total_points_cent',
      render: (record) => {
        return thousandFormat(record.total_points_cent);
      },
    },
    {
      title: '消費筆數',
      // dataIndex: 'total_num',
      render: (record) => {
        return thousandFormat(record.total_num);
      },
    },
    {
      title: '退貨金額',
      // dataIndex: 'total_refund_points_cent',
      render: (record) => {
        return thousandFormat(record.total_refund_points_cent);
      },
    },
    {
      title: '退貨筆數',
      // dataIndex: 'total_refund_num',
      render: (record) => {
        return thousandFormat(record.total_refund_num);
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
      if (this.state.modalVisible) {
        return;
      }
      const { form } = this.props;
      const { union_id, type, time } = form.getFieldsValue([
        'entry_id',
        'time',
        'union_id',
      ]);
      if (
        this.checkSearchItemValueValidate(union_id) ||
        time ||
        type !== null
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
    const { history, location } = this.props;
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

  exportExcelAction() {
    // const query = this.props.system.query;
    // if (query.page) {
    //   delete query.page;
    // }
    // if (query.pageSize) {
    //   delete query.pageSize;
    // }
    // const url = 'point_collect/transact_list';
    // const postData = query;
    // downLoadFile(url, postData, '積分消費匯總');

    const { consumListInfo } = this.props.financeSummary;
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
    const { consumListInfo } = this.props.financeSummary;
    const { total, list, loading } = consumListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11} className="none">
                <FormItem label="消費類型" {...formItemLayout}>
                  {getFieldDecorator('type', {
                    initialValue: query.type || '',
                  })(
                    <Select>
                      <Option value="">全部</Option>
                      <Option value="2">商家收分</Option>
                      <Option value="1">積分消費</Option>
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
              <Col span={11}>
                <FormItem label="商戶ID" {...formItemLayout}>
                  {getFieldDecorator('union_id', {
                    initialValue: query.union_id,
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
                  {getFieldDecorator('union_name', {
                    initialValue: query.union_name,
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
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="積分消費匯總"
          bordered={false}
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
          {!loading ? (
            <Table
              rowKey="id"
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          ) : (
            <LoadingCom />
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
  connect(({ financeSummary, system }) => ({
    financeSummary: financeSummary.toJS(),
    system: system.toJS(),
  }))(Form.create()(ListPage))
);
