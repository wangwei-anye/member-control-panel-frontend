import React from 'react';
import { withRouter } from 'dva/router';
import { connect } from 'dva';
import { Row, Col, Card, Avatar, Tag, Button, Tree } from 'antd';
import {
  createTreeNode,
  convertKeysToJson,
  generateKeys
} from 'utils/permissionTree';
import './accountDetail.less';

class AccountDetail extends React.Component {
  state = {
    checkedKeys: []
  };
  async componentDidMount() {
    await this.props.dispatch({
      type: 'role/getRights',
      payload: {}
    });
    const { account } = this.props;
    const accountList = account.accountList;
    const { rights } = this.props.role;
    // const { permissions } = this.props.role.detail;
    const permissions = accountList.filter(
      item => item.id == this.props.system.query.id
    )[0].user_rights;
    if (permissions) {
      // const { keys } = generateKeys(rights, JSON.parse(permissions));
      const { keys } = generateKeys(
        rights,
        typeof permissions === 'string' ? JSON.parse(permissions) : permissions
      );
      this.setState({ checkedKeys: keys });
    } else {
      this.setState({ checkedKeys: [] });
    }
  }
  onCheck = value => {
    this.setState({
      checkedKeys: value
    });
  };
  handleOk = values => {
    console.log(values);
  };
  handleCancel = () => {};
  render() {
    const { rights } = this.props.role;
    return (
      <div className="account-detail-wrap">
        <Card title="帳號基礎信息" bordered={false}>
          <div className="detail-header-wrap">
            <div className="detail-header-item">
              <div className="header-avatar">
                <Avatar
                  icon="user"
                  style={{ width: 60, height: 60, borderRadius: '50%' }}
                />
              </div>
              <div className="header-detail-wrap">
                <div className="name-role">
                  <div className="name-wrap">
                    <p className="name-cn">大哥</p>
                    <p className="name-en">Marh Chraw</p>
                  </div>
                  <div className="role-wrap">
                    <Tag color="pink">香港01-會員部</Tag>
                  </div>
                </div>
                <div>
                  <p>
                    <span>賬戶ID：120</span>
                    <span>最後操作時間：2018-03-12 12:20:32</span>
                  </p>
                </div>
                <div>
                  <p>電話號碼：+86 18712345678</p>
                </div>
              </div>
            </div>
            <div className="detail-header-item">
              <Button type="primary">編輯</Button>
            </div>
          </div>
        </Card>
        <Card title="帳號權限" style={{ marginTop: 24 }} bordered={false}>
          <div>
            <Tree
              checkable
              checkedKeys={this.state.checkedKeys}
              onSelect={this.onSelect}
              onCheck={this.onCheck}
            >
              {createTreeNode(rights)}
            </Tree>
          </div>
        </Card>
      </div>
    );
  }
}
export default withRouter(
  connect(({ account, system, role }) => ({
    account: account.toJS(),
    system: system.toJS(),
    role: role.toJS()
  }))(AccountDetail)
);
