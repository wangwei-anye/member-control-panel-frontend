import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import { message, Form, Row, Col, Input, Button, Card } from 'antd';
import FoldableCard from 'components/FoldableCard';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import { formatFormData, thousandFormat } from 'utils/tools';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import '../finance.less';

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
  columns = [
    {
      title: '運營賬戶ID',
      dataIndex: 'union_id',
    },
    {
      title: '賬戶名稱',
      dataIndex: 'account_name',
    },
    {
      title: '賬戶類型',
      render: () => {
        return '運營積分帳戶';
      },
    },
    {
      title: '所屬部門',
      dataIndex: 'department_name',
    },
    {
      title: '收分子賬戶餘額',
      render: (record) => {
        return thousandFormat(record.balance);
      },
    },
    {
      title: '收分筆數',
      render: (record) => {
        return thousandFormat(record.expand.income_count);
      },
    },
    {
      title: '收分數額',
      render: (record) => {
        return thousandFormat(record.expand.income_sum);
      },
    },
    {
      title: '退分筆數',
      render: (record) => {
        return thousandFormat(record.expand.refund_count);
      },
    },
    {
      title: '退分數額',
      render: (record) => {
        return thousandFormat(record.expand.refund_sum);
      },
    },
    {
      title: '更新日期',
      render: (record) => {
        return moment.unix(record.updated_at).format('YYYY-MM-DD HH:mm:ss');
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
      const { form } = this.props;
      const { union_id, type, time } = form.getFieldsValue([
        'type',
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
      if (values.department === 'all') {
        delete values.department;
      }
      const query = formatFormData(values);
      query.page = 1;
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
    });
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  render() {
    const { subAccountListInfo, searchConfig } = this.props.financeSummary;
    const { total, list, loading } = subAccountListInfo;
    const { getFieldDecorator } = this.props.form;
    const { query } = this.props.system;
    const acccoutTypeList = json2Arr(searchConfig.account_type);
    return (
      <div className="p-finance-common-wrap p-budget-list-wrap">
        <FoldableCard title={<span>搜索條件</span>}>
          <Form>
            <Row gutter={48}>
              <Col span={11}>
                <FormItem label="運營賬戶ID" {...formItemLayout}>
                  {getFieldDecorator('union_id', {
                    initialValue: query.union_id,
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="運營賬戶名稱" {...formItemLayout}>
                  {getFieldDecorator('account_name', {
                    initialValue: query.account_name,
                  })(<Input placeholder="請輸入" />)}
                </FormItem>
              </Col>
              <Col span={11}>
                <FormItem label="所屬部門：" {...formItemLayout}>
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
        >
          {!loading ? (
            <Table
              bordered
              rowKey="id"
              columns={this.columns}
              dataSource={list}
              pagination={{ total }}
            />
          ) : (
            <LoadingCom />
          )}
        </Card>
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
