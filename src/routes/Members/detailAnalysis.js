import React from 'react';
import { withRouter } from 'react-router-dom';
import { Card, Collapse, Row, Col, Statistic, Icon, List, Alert } from 'antd';
import _maxBy from 'lodash/maxBy';
import TabRouter from 'components/TabRouter';
import { MEMBER_DETAIL_TABLIST } from 'config/ob.config';
import { isUserHasRights, parseSearch } from 'utils/tools';
import { fetchMemberAnalysis } from 'services/user/users';

import './members.less';
import './analysis.less';

const Panel = Collapse.Panel;
const couponListRights = ['member_manage', 'member_detail', 'personal_portray'];

@withRouter
export default class UserAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      loading: true,
    };
  }
  async componentDidMount() {
    if (!isUserHasRights(couponListRights)) {
      this.setState({
        loading: false,
      });
      return;
    }
    try {
      const id = parseSearch(this.props.location.search).id;
      const { data } = await fetchMemberAnalysis(id);
      if (data.status) {
        this.setState({
          list: data.data || [],
        });
      }
    } catch (error) {
    } finally {
      this.setState({
        loading: false,
      });
    }
  }
  render() {
    const search = parseSearch(this.props.location.search);
    const id = search ? search.id : '';
    return (
      <div className="user-detail-wrap">
        <div className="user-coupon-wrap">
          <TabRouter tabList={MEMBER_DETAIL_TABLIST} defaultKey="analysis" />
          <div className="coupon-content">
            {isUserHasRights(couponListRights) ? (
              <Card
                bodyStyle={{ borderTop: '1px solid #eee' }}
                loading={this.state.loading}
                bordered={false}
              >
                <List
                  header={null}
                  footer={null}
                  dataSource={[`會員ID: ${id}`]}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
                <Collapse defaultActiveKey={['0']}>
                  {this.state.list.map((item, index) => {
                    const {
                      answer_data,
                      question_name: questionName,
                      question_type: questionType,
                    } = item;
                    const opts = answer_data.map((opt, i) => (
                      <p key={i}>
                        {`${opt.option_answer || opt.option_name}  ${
                          opt.proportion
                        }`}
                      </p>
                    ));
                    // NOTE: 从 answer_data 这个 list 中获取根据第二个参数放回的 value 来进行比较, 从而得到最大一个项
                    const maxV = _maxBy(answer_data, (o) =>
                      parseFloat(o.proportion)
                    );
                    // result => string
                    let result = maxV.option_answer || maxV.option_name;
                    // NOTE: answer_data 是用户回答的选项, 如果大于 1; 那么说明是多项选择,那么需要将所有的选项的名字拼接为一个长字符串
                    // question_type 1多选 2单选
                    if (questionType && questionType === 1) {
                      result = answer_data
                        .map((opt) => {
                          const { option_answer, option_name } = opt;
                          return option_answer || option_name;
                        })
                        .join(', ');
                    }
                    return (
                      <Panel
                        header={`${item.question_name}: ${result}`}
                        key={`${index}`}
                      >
                        <div>{opts}</div>
                      </Panel>
                    );
                  })}
                </Collapse>
                {this.state.list.length === 0 ? (
                  <Alert
                    style={{ marginTop: 25 }}
                    message="尚無分析數據"
                    type="info"
                    closeText="關閉"
                  />
                ) : null}
              </Card>
            ) : (
              // <p className="no-persission-tips">沒有權限查看優惠券列表</p>
              <Alert message="沒有權限查看會員分析" type="error" showIcon />
            )}
          </div>
        </div>
      </div>
    );
  }
}
