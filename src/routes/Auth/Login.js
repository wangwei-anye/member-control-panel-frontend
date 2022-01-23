import React from 'react';
import { connect } from 'dva';
import { Button } from 'antd';
import { BROWSER_HISTORY } from 'constants';
import { authApi } from 'services/auth';
import Modal from 'components/Modal';
import menuConfig from 'config/menu.config';

class AppPage extends React.Component {
  state = {
    loading: false
  };

  componentWillMount() {
    if (this.props.auth.authorized) {
      // 已登录则跳转回首页
      this.goHome();
    }
    if (this.props.system.query.returnUrl) {
      const returnUrl = decodeURIComponent(this.props.system.query.returnUrl);
      window.sessionStorage.setItem(
        'MCP_01_RETURN_URL',
        encodeURIComponent(returnUrl)
      );
    }
  }

  handleOk = () => {
    this.setState({ loading: true }, () => {
      const cbUrl = encodeURIComponent(
        `${window.location.origin}/${BROWSER_HISTORY ? 'auth' : 'auth.html'}`
      );
      window.location.href = `${authApi}?callback=${cbUrl}`;
    });
  };

  goHome = () => {
    this.props.history.replace(
      `${this.checkoutRouter(menuConfig, this.props.auth.permissions)}`
    );
  };

  checkoutRouter = (menuArr, permissions) => {
    const path = menuArr.filter(item =>
      this.isPermit(item.permit.split('.'), permissions)
    );
    return path[0].path;
  };

  isPermit = (arr, obj) => {
    let permit = false;
    arr.map(item => {
      if (item in obj) {
        obj = obj[item];
        permit = true;
      }
    });
    return permit;
  };

  render() {
    const { loading } = this.state;
    return (
      <Modal
        title="Login"
        visible
        closable={false}
        maskClosable={false}
        footer={
          <Button type="primary" loading={loading} onClick={this.handleOk}>
            {loading ? '登入中...' : '去登入'}
          </Button>
        }
      >
        您未登入或登入失效，將使用google賬戶進行登入！
      </Modal>
    );
  }
}

export default connect(({ auth, system }) => ({
  auth: auth.toJS(),
  system: system.toJS()
}))(AppPage);
