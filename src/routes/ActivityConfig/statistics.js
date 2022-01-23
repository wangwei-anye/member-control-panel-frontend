/* eslint-disable max-len */
/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { connect } from 'dva';
import {
  Form,
  Card,
  Row,
  Col,
  Input,
  Button,
  DatePicker,
  Modal,
  Progress,
  Icon,
  Popover,
  message,
} from 'antd';
import { withRouter } from 'react-router-dom';
import qs from 'qs';
import moment from 'moment';
import LoadingCom from 'components/LoadingCom';
import { answerListExport } from 'services/promotion';
import ExportModal from 'components/ExportModal';
import { getUserSession } from '../../utils/session';
import { API_BASE, HEADER_TOKEN_NAME } from '../../constants';
import { styleMapAnswer } from './constants';
import FoldableCard from '../../components/FoldableCard';

import './index.less';

const formItemLayout = {
  labelCol: {
    xs: 10,
    sm: 10,
    md: 10,
    lg: 10,
    xl: 8,
    xxl: 6,
  },
  wrapperCol: {
    xs: 14,
    sm: 14,
    md: 14,
    lg: 14,
    xl: 16,
    xxl: 18,
  },
};
const confirm = Modal.confirm;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

class ListPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      time: [],
      modalVisible: false,
    };
  }

  componentDidMount() {}

  handleSearch = () => {
    const { history, location } = this.props;
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }
      const { activity_id, time } = values;
      const query = {};
      if (time && time.length) {
        query.start_time = time[0].format('YYYY-MM-DD HH:mm:ss');
        query.end_time = time[1].format('YYYY-MM-DD HH:mm:ss');
      }
      if (activity_id) {
        query.activity_id = activity_id;
      } else {
        message.warning('請輸入活動ID後搜索');
        return;
      }
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  onReset = () => {
    const { history, location } = this.props;
    this.props.form.resetFields();
    history.push({ ...location.pathname });
  };

  exportExcelAction() {
    const query = this.props.system.query;
    if (query.activity_id) {
      this.setState({
        modalVisible: true,
      });
    }
  }

  createExportTask = async (param) => {
    const query = this.props.system.query;
    const postData = query;
    const { data } = await answerListExport({
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
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    const content = (
      <div>
        <p>選項百分比 = 該選項被選擇次數 / 有效填寫人次</p>
      </div>
    );
    const { answerTotalList, loading } = this.props.answerTotalListInfo;

    const removeSpaceChar = (value) => {
      if (value) {
        return value.replace(/\s/g, '');
      }
      return '';
    };
    return (
      <div className="p-activity-config-statistics-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row className="form-control-row" type="flex" gutter={48}>
              <Col span={7}>
                <FormItem label="*活動ID" {...formItemLayout}>
                  {getFieldDecorator('activity_id', {
                    initialValue: query.activity_id || '',
                    normalize: removeSpaceChar,
                    rules: [
                      {
                        pattern: /^\d*$/g,
                        message: '請輸入純數字ID',
                      },
                    ],
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label="答題時間" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.start_time
                      ? [moment(query.start_time), moment(query.end_time)]
                      : null,
                  })(
                    <RangePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD HH:mm:ss"
                      showTime
                      onChange={this.timeChangeAction}
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
                <Button onClick={this.onReset} iscom="hui">
                  重置
                </Button>
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="統計結果"
          bordered={false}
          extra={
            answerTotalList.length > 0 ? (
              <Button
                icon="export"
                type="primary"
                onClick={this.exportExcelAction.bind(this)}
              >
                導出Excel
              </Button>
            ) : null
          }
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <div className="question-list">
              {answerTotalList.length > 0 ? (
                answerTotalList.map((item, index) => {
                  return (
                    <div className="item" key={index}>
                      <div className="title">
                        問題{index + 1}：{item.origin_value}
                        {item.value === '' ? null : '(' + item.value + ')'} [
                        {styleMapAnswer[item.alias_style]}]
                      </div>
                      <div className="table-title">
                        <div className="txt">選項</div>
                        <div className="num">填寫人次</div>
                        <div className="rate">
                          比例
                          <Popover content={content} placement="topLeft">
                            <Icon className="Info-circle" type="info-circle" />
                          </Popover>
                        </div>
                      </div>
                      <div className="table-data">
                        {item.option.map((subItem, subIndex) => {
                          return (
                            <div className="table-item" key={subIndex}>
                              <div className="txt">
                                {subItem.origin_value}
                                {subItem.value === ''
                                  ? null
                                  : '(' + subItem.value + ')'}
                              </div>
                              <div className="num">{subItem.counts}</div>
                              <div className="rate">
                                <Progress
                                  percent={parseFloat(
                                    subItem.percentile
                                  ).toFixed(2)}
                                  status="normal"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="line" />
                      <div className="count">
                        <div className="txt">本題有效填寫 人數/人次</div>
                        <div className="num">
                          {item.counts}人/{item.counts}次
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="ant-empty ant-empty-normal">
                  <div className="ant-empty-image">
                    <img
                      alt="無此資料"
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA2NCA0MSIgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAxKSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgIDxlbGxpcHNlIGZpbGw9IiNGNUY1RjUiIGN4PSIzMiIgY3k9IjMzIiByeD0iMzIiIHJ5PSI3Ii8+CiAgICA8ZyBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0Q5RDlEOSI+CiAgICAgIDxwYXRoIGQ9Ik01NSAxMi43Nkw0NC44NTQgMS4yNThDNDQuMzY3LjQ3NCA0My42NTYgMCA0Mi45MDcgMEgyMS4wOTNjLS43NDkgMC0xLjQ2LjQ3NC0xLjk0NyAxLjI1N0w5IDEyLjc2MVYyMmg0NnYtOS4yNHoiLz4KICAgICAgPHBhdGggZD0iTTQxLjYxMyAxNS45MzFjMC0xLjYwNS45OTQtMi45MyAyLjIyNy0yLjkzMUg1NXYxOC4xMzdDNTUgMzMuMjYgNTMuNjggMzUgNTIuMDUgMzVoLTQwLjFDMTAuMzIgMzUgOSAzMy4yNTkgOSAzMS4xMzdWMTNoMTEuMTZjMS4yMzMgMCAyLjIyNyAxLjMyMyAyLjIyNyAyLjkyOHYuMDIyYzAgMS42MDUgMS4wMDUgMi45MDEgMi4yMzcgMi45MDFoMTQuNzUyYzEuMjMyIDAgMi4yMzctMS4zMDggMi4yMzctMi45MTN2LS4wMDd6IiBmaWxsPSIjRkFGQUZBIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K"
                    />
                  </div>
                  <p className="ant-empty-description">無此資料</p>
                </div>
              )}
            </div>
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
  connect(({ system, activityConfig }) => {
    return {
      answerTotalListInfo: activityConfig.get('answerTotalListInfo').toJS(),
      system: system.toJS(),
    };
  })(Form.create()(ListPage))
);
