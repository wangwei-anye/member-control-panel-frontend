import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Icon, Modal, Avatar } from 'antd';
import './Header.less';

class Header extends React.Component {
  constructor() {
    super();
    this.state = {
      headLoadError: false,
    };
  }
  logout() {
    Modal.confirm({
      content: '確實要註銷嗎？',
      onOk: () => {
        if (sessionStorage.getItem('MCP_01_OUT_APP_ID')) {
          sessionStorage.removeItem('MCP_01_OUT_APP_ID');
        }
        if (sessionStorage.getItem('MCP_01_OUT_OUT_SN')) {
          sessionStorage.removeItem('MCP_01_OUT_OUT_SN');
        }
        if (sessionStorage.getItem('MCP_01_RETURN_URL')) {
          sessionStorage.removeItem('MCP_01_RETURN_URL');
        }
        this.props.history.push('/logout');
      },
    });
  }
  setDefaultHead = () => {
    this.setState({
      headLoadError: true,
    });
  };
  render() {
    const { props } = this;
    const routes = props.system.routes;
    const { headLoadError } = this.state;
    const { username } = props.auth;

    let headName = 'U';
    if (username) {
      headName = username.length > 1 ? username.substr(0, 1) : username;
    }

    return (
      <header className="flex">
        <div style={{ flex: 1 }}>
          <Icon
            style={{
              cursor: 'pointer',
              width: '24px',
              height: '24px',
              fontSize: 20,
            }}
            className="trigger"
            type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.props.onCollapse}
          />
        </div>
        {props.auth.authorized ? (
          <div>
            <span>
              {props.auth.avatar_url && !headLoadError ? (
                <img
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    marginRight: 10,
                    position: 'relative',
                    top: -2,
                  }}
                  src={props.auth.avatar_url}
                  alt="avatar"
                  onError={this.setDefaultHead}
                />
              ) : (
                // <Avatar
                //   size={30}
                //   icon="user"
                //   style={{ marginRight: 10, position: 'relative', top: -2 }}
                // />
                <div
                  style={{
                    backgroundColor: '#ccc',
                    borderRadius: '50%',
                    color: '#fff',
                    width: 30,
                    height: 30,
                    fontSize: 10,
                    lineHeight: '30px',
                    marginRight: 10,
                    position: 'relative',
                    textAlign: 'center',
                    display: 'inline-block',
                  }}
                >
                  {headName}
                </div>
              )}
              {props.auth.username}
            </span>
            <span
              style={{ marginLeft: 10, cursor: 'pointer' }}
              onClick={() => this.logout()}
            >
              <Icon type="logout" /> 注銷
            </span>
          </div>
        ) : (
          <div>
            <span>
              <Icon type="user" /> 訪客
            </span>
          </div>
        )}
      </header>
    );
  }
}
export default withRouter(
  connect(({ auth, system }) => ({
    auth: auth.toJS(),
    system: system.toJS(),
  }))(Header)
);
