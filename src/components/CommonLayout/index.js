import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { connect } from 'dva';
import { withRouter, Link } from 'dva/router';
import HeaderComp from './Header';
import PageLoading from './PageLoading';
import Sidebar from './Sidebar';
import ForCommonCom from '../ForCommonCom';

const { Header, Content, Sider } = Layout;
const windowWidth = window.innerWidth;
const minScreenWidth = 1370; // 最小的限制屏幕宽度
// 隐藏 面包屑导航栏 的pathname list
const hideBreadcrumbPathnameList = [
  '/01-infinite/shop', // 01商场
  '/01-infinite/activity', // 01活动
  '/integral-division/selected-activities' // 精选活动
];
class CommonLayout extends React.PureComponent {
  state = {
    collapsed: windowWidth <= minScreenWidth,
    mode: 'inline'
  };

  componentDidMount() {
    if (window.localStorage) {
      let menuCollapsed =
        window.localStorage.getItem('menuCollapsed') || 'false';
      if (menuCollapsed === 'false') {
        menuCollapsed = windowWidth <= minScreenWidth ? 'true' : 'false';
      }
      this.setState({
        collapsed: menuCollapsed === 'true'
      });
    }
  }

  onCollapse = () => {
    this.setState(
      {
        collapsed: !this.state.collapsed
      },
      () => {
        this.collapseMenu();
      }
    );
  }
  collapseMenu = () => {
    if (window.localStorage) {
      window.localStorage.setItem(
        'menuCollapsed',
        this.state.collapsed.toString()
      );
    }
    this.props.dispatch({
      type: 'system/save',
      payload: {
        menuCollapsed: this.state.collapsed
      }
    });
  }
  handleBreakpoint = (breakpoint) => {
    this.setState({
      collapsed: breakpoint
    }, () => {
      this.collapseMenu();
    });
  }
  render() {
    const { routes, pathname } = this.props.system;
    const { collapsed } = this.state;

    return (
      <div id="common-page">
        <Layout style={{ height: '100%' }}>
          <Sider
            id="common-sidebar"
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            breakpoint="lg"
            onBreakpoint={this.handleBreakpoint}
          >
            <div className="logo-wrap">
              <h1>
                <ForCommonCom />
                <img
                  src="/static/img/hk01.png"
                  alt="hk01 Logo"
                  className="logo-img"
                />
                {!collapsed ? (
                  <span className="logo-text">會員控制台</span>
                ) : null}
              </h1>
            </div>
            <Sidebar routes={routes} collapsed={collapsed} />
          </Sider>
          <Layout id="common-main-wrapper">
            <Header id="common-header">
              <PageLoading style={{ position: 'absolute', top: 0, left: 0 }} />
              <HeaderComp collapsed={collapsed} onCollapse={this.onCollapse} />
            </Header>
            {hideBreadcrumbPathnameList.includes(pathname) ? null : (
              <div className="nav-bread-wrap ant-layout-header">
                <Breadcrumb>
                  {(routes || []).map((item, index) => (
                    <Breadcrumb.Item key={index}>
                      {index === routes.length - 1 ? (
                        item.breadcrumbName
                      ) : (
                        <Link to={item.path}>{item.breadcrumbName}</Link>
                      )}
                    </Breadcrumb.Item>
                  ))}
                </Breadcrumb>
              </div>
            )}
            <Content id="common-main-content">{this.props.children}</Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default connect(({ system, auth }) => ({
  system: system.toJS(),
  auth: auth.toJS()
}))(withRouter(CommonLayout));
