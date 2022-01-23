/* 用户行为 */
import React from 'react';
import { Row, Col, Icon, Divider, Tag, Spin } from 'antd';
import {
  APP_TO_JSON,
  USRE_TYPE,
  MEMBER_DETAIL_TABLIST
} from 'config/ob.config.js';
import TabRouter from 'components/TabRouter';
import LoadingCom from 'components/LoadingCom';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import './members.less';

// 定义喜欢和权限所对应的color
const authColorList = ['blue', 'orange'];
const hobbyColorList = ['cyan', 'green', 'magenta'];
const loadingStyle = {
  textAlign: 'center',
  padding: '20px'
};
class UserAction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }
  async componentDidMount() {
    const { system } = this.props;
    await this.props.dispatch({
      type: 'memberInfo/getMemberAction',
      payload: {
        ...system.query
      }
    });
    this.setState({
      isLoading: false
    });
  }
  render() {
    const { userActionInfo } = this.props.memberInfo;
    const { isLoading } = this.state;
    if (!Object.keys(userActionInfo).length) {
      return (
        <div className="user-detail-wrap">
          <div className="user-action-wrap">
            <TabRouter tabList={MEMBER_DETAIL_TABLIST} defaultKey="action" />
            <div style={loadingStyle} className="action-content">
              {isLoading ? <LoadingCom /> : <p>暫無數據</p>}
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="user-detail-wrap">
        <div className="user-action-wrap">
          <TabRouter tabList={MEMBER_DETAIL_TABLIST} defaultKey="action" />
          <div className="action-content">
            <Row>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">會員ID：</span>
                  <span className="item-value">{userActionInfo.id}</span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">會員類型：</span>
                  <span className="item-value">
                    {USRE_TYPE[userActionInfo.account_type]}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">註冊時間：</span>
                  <span className="item-value">
                    {userActionInfo.created_at}
                  </span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">註冊渠道：</span>
                  <span className="item-value">
                    {APP_TO_JSON[userActionInfo.reg_channel]}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">訪問權限：</span>
                  <span className="item-value">
                    {userActionInfo.access.split(',').map((item, index) => {
                      return (
                        <Tag color={authColorList[index]} key={index}>
                          {APP_TO_JSON[item] || '--'}
                        </Tag>
                      );
                    })}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">內容興趣偏好：</span>
                  <span className="item-value">
                    <div style={{ position: 'relative' }}>
                      {userActionInfo.interest.split(',').map((item, index) => {
                        return (
                          <Tag color={hobbyColorList[index]} key={index}>
                            {item}
                          </Tag>
                        );
                      })}
                      <p
                        style={{
                          color: 'rgba(0, 0, 0, 0.45)',
                          fontSize: 12,
                          position: 'absolute',
                          top: '120%',
                          left: 0
                        }}
                      >
                        用戶頻道點擊次數前3位
                      </p>
                    </div>
                  </span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">操作系統：</span>
                  <span className="item-value">{userActionInfo.os}</span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">品牌型號：</span>
                  <span className="item-value">
                    {userActionInfo.phone_brand}
                  </span>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">版本號：</span>
                  <span className="item-value">
                    {Object.keys(userActionInfo.version).map((item, index) => {
                      return (
                        <p className="app-list" key={index}>
                          <span className="app-01 app-type">{item}</span>
                          {userActionInfo.version[item]}
                        </p>
                      );
                    })}
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className="list-item">
                  <span className="item-name">是否接收推送：</span>
                  <span className="item-value">
                    {Object.keys(userActionInfo.is_accept_push).map(
                      (item, index) => {
                        return (
                          <p className="app-list" key={index}>
                            <span className="app-01 app-type">{item}</span>{' '}
                            {userActionInfo.is_accept_push[item] ? '是' : '否'}
                          </p>
                        );
                      }
                    )}
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ memberInfo, system }) => ({
    memberInfo: memberInfo.toJS(),
    system: system.toJS()
  }))(UserAction)
);
