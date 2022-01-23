import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import { Form, Row, Col, Button, Card, message, DatePicker, Empty } from 'antd';
import moment from 'moment';
import FoldableCard from 'components/FoldableCard';
import ResetBtn from 'components/ResetBtn';
import { thousandFormat } from 'utils/tools';
import './account.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
// 表单项布局
const formItemLayout = {
  labelCol: {
    sm: { span: 4 },
    md: { span: 4 },
    lg: { span: 4 },
    xl: { span: 4 },
    xxl: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 18 },
    md: { span: 18 },
    lg: { span: 18 },
    xl: { span: 18 },
    xxl: { span: 18 },
  },
};

class MemberContentCom extends React.Component {
  componentDidMount() {}

  handleKeyupEvent() {
    const { form } = this.props;
    if (this.checkSearchItemValueValidate()) {
      return this.searchAction();
    }
  }

  checkSearchItemValueValidate = () => {
    const isValid = false;
    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  timeChangeAction = (date, dateString) => {
    this.setState({
      time: dateString,
    });
  };

  searchAction() {
    const { history, location, system, form } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      if (values.time === '' || !values.time) {
        message.error('請輸入查詢時間');
        this.props.dispatch({
          type: 'integralManageAccount/save',
          payload: {
            expiredData: {
              total_account: -1,
              total_expired_points: 0,
            },
          },
        });
        return;
      }
      const query = {};
      if (values.time && values.time.length) {
        query.start_time = moment(values.time[0]).format('YYYY-MM-DD');
        query.end_time = moment(values.time[1]).format('YYYY-MM-DD');
      }
      if (moment(values.time[0]).diff(moment(values.time[1]), 'days') < -366) {
        message.error('查詢日期篩選上限為366天');
        return;
      }

      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  }

  componentWillUnmount() {
    this.reset();
  }

  reset = () => {
    this.props.dispatch({
      type: 'integralManageAccount/clearBalanceExpired',
      payload: {},
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { expiredData } = this.props.integralManageAccount;
    const { query } = this.props.system;
    return (
      <div className="p-integralmanage-account-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form {...formItemLayout} labelAlign="left">
            <Row gutter={48}>
              <Col span={12} className="input-box">
                <FormItem label="過期日" {...formItemLayout}>
                  {getFieldDecorator('time', {
                    initialValue: query.start_time
                      ? [moment(query.start_time), moment(query.end_time)]
                      : null,
                  })(
                    <RangePicker
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      showTime
                      onChange={this.timeChangeAction}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  onClick={() => this.searchAction()}
                  style={{ marginRight: 20 }}
                >
                  搜索
                </Button>
                <ResetBtn form={this.props.form} onReset={this.reset} />
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card
          bordered={false}
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="查詢結果"
        >
          {expiredData.total_account !== -1 ? (
            <div className="integralExpired">
              <div>
                總人數：
                <span className="number">
                  {thousandFormat(expiredData.total_account)}
                </span>
                人
              </div>
              <div>
                過期積分總數：
                <span className="number">
                  {thousandFormat(expiredData.total_expired_points)}
                </span>
                積分
              </div>
            </div>
          ) : (
            <Empty description="暫無數據" />
          )}
        </Card>
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralManageAccount, system }) => ({
    integralManageAccount: integralManageAccount.toJS(),
    system: system.toJS(),
  }))(Form.create()(MemberContentCom))
);
