import React from 'react';
import { connect } from 'dva';
import { Modal, Button } from 'antd';
import menuConfig from 'config/menu.config';

class AppPage extends React.Component {
  state = {
    show: false,
    timer: null
  };

  componentDidMount() {
    const timer = setTimeout(() => this.setState({ show: true }), 200);
    this.setState({ timer });
  }
  componentWillUnmount() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.loginStatus === 'success') {
      if (window.sessionStorage.getItem('MCP_01_RETURN_URL')) {
        const returnUrl = decodeURIComponent(
          window.sessionStorage.getItem('MCP_01_RETURN_URL')
        );
        const [host, path] = returnUrl.split('#');
        // NOTE: 当登录成功的之后跳转的页面是 auth  或者是 login 页面; 那么就直接跳转到首页
        if (/^\/login/.test(path) || /^\/auth/.test(path)) {
          window.location.replace('/');
        } else {
          window.location.replace(returnUrl);
        }
      } else {
        this.props.history.replace(
          `${this.checkoutRouter(menuConfig, nextProps.auth.permissions)}`
        );
      }
    }
  }

  handleLogin = () => {
    this.props.history.replace('/login');
  };

  checkoutRouter = (menuArr, permissions) => {
    const path = menuArr.filter(item =>
      this.isPermit(item.permit.split('.'), permissions)
    );
    return path.length ? (path[0].path ? path[0].path : '/home') : '/home';
  };

  isPermit = (arr, obj) => {
    let permit = false;
    arr.map(item => {
      if (Array.isArray(obj)) {
        permit = obj.includes(item);
      } else if (item in obj) {
        obj = obj[item];
        permit = true;
      } else {
        permit = false;
      }
    });
    return permit;
  };

  render() {
    const { loginStatus, loginFailMessage } = this.props.auth;
    const fail = loginStatus === 'fail';
    const Footer = fail ? (
      <Button key="submit" type="primary" onClick={this.handleLogin}>
        重新登入
      </Button>
    ) : null;

    return this.state.show ? (
      <Modal title="Auth" visible closable={false} footer={Footer}>
        {!fail ? (
          <span>歡迎回來，正在載入頁面...</span>
        ) : (
          <span>{loginFailMessage || 'Oops，登入失敗了，請重試！'}</span>
          )}
      </Modal>
    ) : null;
  }
}

export default connect(({ auth, system }) => ({
  auth: auth.toJS(),
  system: system.toJS()
}))(AppPage);
