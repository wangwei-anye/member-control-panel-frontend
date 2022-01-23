import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import {
  Form,
  Select,
  Row,
  Col,
  Button,
  Modal,
  Card,
  DatePicker,
  Tag,
  message,
  Tooltip,
} from 'antd';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import AuthWrapCom from 'components/AuthCom';
import {
  formatFormData,
  thousandFormat,
  downLoadFileOneYearLimit,
} from 'utils/tools';
import { DEFAULT_PAGE_SIZE } from 'constants';
import LoadingCom from 'components/LoadingCom';
import ExportExcelBtnCom from 'components/ExportExcelBtnCom';
import eventEmmiter from 'utils/events';
import { releaseListExport } from 'services/finance/integral-summary/summary';
import ExportModal from 'components/ExportModal';
import '../finance.less';

const { confirm } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const { CheckableTag } = Tag;
// 表单项布局
const formItemLayout = {
  labelCol: {
    xs: 4,
    sm: 4,
    md: 4,
    lg: 4,
    xl: 4,
    xxl: 4,
  },
  wrapperCol: {
    xs: 20,
    sm: 20,
    md: 20,
    lg: 20,
    xl: 20,
    xxl: 20,
  },
};
const formItemLayoutName = {
  labelCol: {
    xs: 2,
    sm: 2,
    md: 2,
    lg: 2,
    xl: 2,
    xxl: 2,
  },
  wrapperCol: {
    xs: 20,
    sm: 20,
    md: 20,
    lg: 20,
    xl: 20,
    xxl: 20,
  },
};

class ListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultProjectId: '',
      modalVisible: false,
    };
  }
  columns = [
    {
      title: '日期',
      render: (text, record) => {
        return moment(record.statistic_date).format('YYYY-MM-DD');
      },
    },
    {
      title: '期初應發積分',
      render: (text, record) => {
        return thousandFormat(record.beginning_balance_cent);
      },
    },
    {
      title: '預估發分',
      dataIndex: 'recently_expire_amount',
      render: (text, record) => {
        return thousandFormat(record.estimate_offer_points_cent);
      },
    },
    {
      title: '發分取消',
      render: (text, record) => {
        return thousandFormat(record.cancel_points_cent);
      },
    },
    {
      title: '已發積分',
      render: (text, record) => {
        return thousandFormat(record.offered_points_cent);
      },
    },
    {
      title: '期末應發積分',
      render: (text, record) => {
        return thousandFormat(record.ending_balance_cent);
      },
    },
    {
      title: '更新時間',
      render: (text, record) => {
        return moment(record.update_date).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];

  async componentDidMount() {
    await this.props.dispatch({
      type: 'financeSummary/getProjectList',
      payload: {},
    });
    const { ProjectList } = this.props.financeSummary;
    if (ProjectList.length > 0) {
      this.setState(
        {
          defaultProjectId: ProjectList[0].id,
        },
        () => {
          const { history, location } = this.props;
          const query = { project_id: ProjectList[0].id };
          const querystring = qs.stringify(query);
          history.push({ ...location, search: `?${querystring}` });
        }
      );
    }
  }

  bindKeyupEvent() {
    eventEmmiter.on('keyup', this.handleKeyupEvent.bind(this));
  }

  handleKeyupEvent() {
    if (this.state.modalVisible) {
      return;
    }
    this.searchAction();
  }

  componentWillUnmount() {
    eventEmmiter.removeAllListeners('keyup');
  }

  searchAction() {
    const { history, location, system, form } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      if (this.state.defaultProjectId === '') {
        message.error('請選擇項目');
        return;
      }
      const query = formatFormData(values);
      if (values.time && values.time.length) {
        query.start_time = moment(values.time[0]).format('YYYY-MM-DD');
        query.end_time = moment(values.time[1]).format('YYYY-MM-DD');
      } else {
        query.start_time = '';
        query.end_time = '';
      }
      query.project_id = this.state.defaultProjectId;
      delete query.time;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  }

  exportExcelAction() {
    if (this.state.defaultProjectId === '') {
      message.error('請選擇項目');
      return;
    }

    const { ReleaseListInfo } = this.props.financeSummary;
    const { total } = ReleaseListInfo;
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

    query.project_id = this.state.defaultProjectId;
    delete query.time;
    const postData = query;
    // const url = 'estimate_offer_statistics/list';
    // downLoadFileOneYearLimit(url, postData, '應發積分匯總');

    const {
      start_time,
      end_time,
      start_date,
      end_date,
      grant_start_time,
      grant_end_time,
    } = postData;
    if (!(start_time || start_date || grant_start_time)) {
      message.error('請選擇導出的時間：僅支持導出一年內，並少於10萬條的數據');
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

    const newStartDate = new Date(start_time || start_date || grant_start_time);
    const newEndDate = new Date(end_time || end_date || grant_end_time);

    if (
      !(
        !moment(newStartDate).add(1, 'years').isBefore(newEndDate) &&
        moment(newStartDate).isBefore(newEndDate)
      )
    ) {
      message.error('僅支持導出一年內的數據，請優化篩選條件');
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
    const { data } = await releaseListExport({
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

  onReset = () => {
    const { ProjectList } = this.props.financeSummary;
    if (ProjectList.length > 0) {
      const { history, location } = this.props;
      const query = { project_id: ProjectList[0].id };
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    }
  };

  handleChange(id) {
    this.setState({ defaultProjectId: id });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { ReleaseListInfo, ProjectList } = this.props.financeSummary;
    const { total, data, loading } = ReleaseListInfo;
    const { query } = this.props.system;
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form {...formItemLayout} labelAlign="left">
            <Row>
              <Col span={24} className="input-box">
                <FormItem label="項目名稱" {...formItemLayoutName}>
                  {ProjectList.map((item, index) => {
                    return (
                      <CheckableTag
                        key={index}
                        checked={this.state.defaultProjectId === item.id}
                        onChange={(checked) =>
                          this.handleChange(item.id, checked)
                        }
                      >
                        {item.title}
                      </CheckableTag>
                    );
                  })}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12} className="input-box">
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
              <Col span={24} style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  onClick={() => this.searchAction()}
                  style={{ marginRight: 20 }}
                >
                  搜索
                </Button>
                <ResetBtn
                  form={this.props.form}
                  onReset={() => this.onReset()}
                />
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card
          bordered={false}
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="應發積分統計"
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
              rowKey={(row, index) => index}
              columns={this.columns}
              dataSource={data}
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
  connect(({ financeSummary, system }) => ({
    financeSummary: financeSummary.toJS(),
    system: system.toJS(),
  }))(Form.create()(ListPage))
);
