import React from 'react';
import TabRouter from 'components/TabRouter';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { INTEGRAL_GIVE_TABLIST } from 'config/ob.config.js';
import { Form, Icon, Input, Row, Col, Button, Card, Divider } from 'antd';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import qs from 'qs';
import AuthWrapCom from 'components/AuthCom';
import FoldableCard from 'components/FoldableCard';
import LoadingCom from 'components/LoadingCom';
import { formatFormData, isUserHasRights } from 'utils/tools';
import '../give.less';

const FormItem = Form.Item;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const fixedLitRightList = [
  'points_management',
  'points_offer',
  'fixed',
  'index',
];
class FixedListPage extends React.Component {
  columns = [
    {
      title: '序號',
      dataIndex: 'id',
    },
    {
      title: '固定發放項名稱',
      dataIndex: 'entry_name',
    },
    {
      title: '更新時間',
      dataIndex: 'edit_time',
    },
    {
      title: '編輯人',
      dataIndex: 'edit_by',
    },
    {
      title: '操作',
      key: 'operation',
      width: 160,
      render: (text, record) => {
        const { entry_fixed_type, id } = record;
        return (
          <span>
            <AuthWrapCom authList={fixedLitRightList}>
              <span
                style={{ color: '#1890ff' }}
                onClick={() => this.toDetailAction(record, 'look')}
              >
                查看
              </span>
              {entry_fixed_type === 0 ? (
                <React.Fragment>
                  <Divider type="vertical" />
                  <span
                    style={{ color: '#F5222D' }}
                    onClick={() => this.toDetailAction(record, 'edit')}
                  >
                    更改配置
                  </span>
                </React.Fragment>
              ) : (
                ''
              )}
            </AuthWrapCom>
          </span>
        );
      },
    },
  ];

  toDetailAction(record, type) {
    const { id } = record;
    if (!id) {
      return;
    }
    this.props.history.push(
      `/integral-manage/give-fixed/detail?group_id=${record.id}&type=${type}&entry_fixed_type=${record.entry_fixed_type}`
    );
  }

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

  render() {
    const {
      total,
      list,
      loading,
    } = this.props.integralManageGive.fixedListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    if (
      !isUserHasRights(fixedLitRightList) &&
      this.columns.filter((item) => item.key === 'operation').length
    ) {
      this.columns.pop();
    }
    return (
      <div className="p-fixed-list-wrap p-give-wrap">
        <TabRouter tabList={INTEGRAL_GIVE_TABLIST} defaultKey="fixed" />
        <div className="give-content-wrap">
          <FoldableCard
            className="custom-card"
            title={
              <span>
                <Icon type="search" /> 搜索條件
              </span>
            }
            bodyStyle={{ borderTop: '1px solid #e8e8e8' }}
          >
            <Form>
              <Row>
                <Col span={9}>
                  <FormItem label="發放項名稱：" {...formItemLayout}>
                    {getFieldDecorator('entry_name', {
                      initialValue: query.entry_name,
                    })(
                      <Input
                        placeholder="請輸入發放項名稱關鍵字"
                        onPressEnter={() => this.searchAction()}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col
                  span={6}
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
            title="全部固定發放項"
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
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralManageGive, system }) => ({
    integralManageGive: integralManageGive.toJS(),
    system: system.toJS(),
  }))(Form.create()(FixedListPage))
);
