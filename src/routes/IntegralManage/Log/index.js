import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import { Form, Row, Col, Input, Button, Card, Select } from 'antd';
import FoldableCard from 'components/FoldableCard';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import LoadingCom from 'components/LoadingCom';
import { formatFormData, thousandFormat } from 'utils/tools';
import './log.less';

const FormItem = Form.Item;
const Option = Select.Option;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
class ApproveListPage extends React.Component {
  columns = [
    {
      title: '用戶ID',
      dataIndex: 'union_id',
    },
    {
      title: 'Brand_Id',
      dataIndex: 'brand_id',
    },
    {
      title: '計算代數式',
      dataIndex: 'calculation_record',
    },
    {
      title: '事件Key',
      dataIndex: 'event_key',
    },
    {
      title: '事件序列號',
      dataIndex: 'event_sn',
    },
    {
      title: '發放積分的100倍',
      // dataIndex: 'offer_cent',
      render: (record) => {
        return thousandFormat(record.offer_cent);
      },
    },
    {
      title: '發放項ID',
      dataIndex: 'offer_entry_id',
    },
    {
      title: '發放方ID',
      dataIndex: 'offer_owner_id',
    },
    {
      title: '結果類型',
      dataIndex: 'offer_result',
    },
    {
      title: '發放規則ID',
      dataIndex: 'offer_rule_id',
    },
    {
      title: '匹配腳本的精簡輸出',
      dataIndex: 'rule_script_record',
    },
    {
      title: '創建時間',
      dataIndex: 'created_at',
    },
    {
      title: '更新時間',
      dataIndex: 'updated_at',
    },
  ];

  // 搜索
  searchAction() {
    const { history, location, system } = this.props;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      const query = formatFormData(values);
      query.page = 1;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  }

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  render() {
    const { listInfo } = this.props.integralManageLog;
    const { total, list, loading } = listInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    return (
      <div className="p-log-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="事件Key" {...formItemLayout}>
                  {getFieldDecorator('event_key', {
                    initialValue: query.id,
                  })(
                    <Input
                      placeholder="請輸入"
                      onPressEnter={this.searchAction.bind(this)}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="用戶ID" {...formItemLayout}>
                  {getFieldDecorator('union_id', {
                    initialValue: query.union_id,
                  })(
                    <Input
                      placeholder="請輸入"
                      onPressEnter={this.searchAction.bind(this)}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="結果類型" {...formItemLayout}>
                  {getFieldDecorator('offer_result', {
                    initialValue: query.offer_result || '',
                  })(
                    <Select placeholder="請選擇">
                      <option value="zero_points">算分為0</option>
                      <option value="offer_pause">發放項暫停</option>
                      <option value="success">成功</option>
                      <option value="insufficient_balance">
                        運營賬戶余額不足
                      </option>
                      <option value="reach_stop_amount">觸及預警值</option>
                      <option value="request_fail">請求失敗</option>
                      <option value="forbidden_country_code">
                        賬號手機號地區不支持
                      </option>
                      <option value="email_forbidden">
                        賬號郵件地址不支持
                      </option>
                    </Select>
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
                  onClick={() => this.searchAction()}
                  style={{ marginRight: 20 }}
                >
                  搜索
                </Button>
                <ResetBtn
                  form={this.props.form}
                  onReset={() => this.setState({ dateString: [] })}
                />
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card
          bordered={false}
          bodyStyle={{ padding: '10px 20px' }}
          style={{ marginTop: 24 }}
          title="規則日誌列表"
        >
          {loading ? (
            <LoadingCom />
          ) : (
            <Table
              rowKey={(row, index) => index}
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          )}
        </Card>
      </div>
    );
  }
}
export default withRouter(
  connect(({ integralManageLog, system }) => ({
    integralManageLog: integralManageLog.toJS(),
    system: system.toJS(),
  }))(Form.create()(ApproveListPage))
);
