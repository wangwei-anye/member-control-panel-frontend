import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import { message, Form, Row, Col, Input, Button, Card, DatePicker } from 'antd';
import FoldableCard from 'components/FoldableCard';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import ExportExcelBtnCom from 'components/ExportExcelBtnCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import { formatFormData, thousandFormat, downLoadFile } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import { systemListExport } from 'services/finance/integral-summary/summary';
import ExportModal from 'components/ExportModal';
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
    dateString: [],
    modalVisible: false,
  };
  columns = [
    {
      title: '日期',
      dataIndex: 'count_date',
    },
    {
      title: '發放項ID',
      dataIndex: 'entry_id',
    },
    {
      title: '發放名稱',
      dataIndex: 'entry_title',
    },
    {
      title: '發放部門',
      dataIndex: 'department_name',
    },
    {
      title: '發放帳戶',
      dataIndex: 'union_id',
    },
    {
      title: '發放積分總額',
      // dataIndex: 'total_points_cent',
      render: (record) => {
        return thousandFormat(record.total_points_cent);
      },
    },
    {
      title: '筆數',
      // dataIndex: 'offer_num',
      render: (record) => {
        return thousandFormat(record.offer_num);
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
      const { union_id, entry_id, time } = form.getFieldsValue([
        'entry_id',
        'time',
        'union_id',
      ]);
      if (
        this.checkSearchItemValueValidate(entry_id) ||
        time ||
        union_id.trim()
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
      if (query.department === 'all') {
        delete query.department;
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
    // const url = 'point_collect/offer_list';
    // const postData = query;
    // downLoadFile(url, postData, '積分發放匯總');

    const { systemListInfo } = this.props.financeSummary;
    const { total } = systemListInfo;
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
    const { data } = await systemListExport({
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
    const { systemListInfo } = this.props.financeSummary;
    const { total, list, loading } = systemListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="發放項ID" {...formItemLayout}>
                  {getFieldDecorator('entry_id', {
                    initialValue: query.entry_id || '',
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字ID',
                      },
                    ],
                  })(<Input placeholder="請輸入發放項ID" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="發放賬戶" {...formItemLayout}>
                  {getFieldDecorator('union_id', {
                    initialValue: query.union_id || '',
                  })(<Input placeholder="請輸入發放賬戶" />)}
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
                <FormItem label="部門：" {...formItemLayout}>
                  {getFieldDecorator('department', {
                    initialValue: query.department,
                  })(
                    <PartmentTreeSelect
                      partmentList={this.props.system.partmentList}
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
          title="積分發放匯總"
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
