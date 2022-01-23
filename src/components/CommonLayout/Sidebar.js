import React from 'react';
import { connect } from 'dva';
import { Menu, Icon } from 'antd';
import { Link } from 'dva/router';
import { createGUID } from 'utils/tools';
import menuConfig from 'config/menu.config';
import { isEmpowered } from 'components/Empower';

import './Sidebar.less';

const MenuItemGroup = Menu.ItemGroup;
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

// 产生菜单，并添加key
const produceMenu = (list) => {
  return list.map((item) => {
    const ret = { ...item, key: createGUID() };
    if (Array.isArray(item.list)) {
      ret.list = produceMenu(item.list);
    }
    return ret;
  });
};

const menuList = produceMenu(menuConfig);

// 查询目标keys
const findKeysByPath = (list, path, keys = []) => {
  let found = false;
  list.some((item) => {
    found = item.path === path;
    if (found) {
      keys.push(item.key);
    } else if (Array.isArray(item.list)) {
      keys.push(item.key);
      const find = findKeysByPath(item.list, path, keys);
      found = find.found;
    }
    return found;
  });
  if (!found) {
    keys.pop();
  }
  return { keys, found };
};

class Sidebar extends React.PureComponent {
  state = {
    selectedKey: '',
    openKeys: [],
  };

  componentWillMount() {
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const newRouter = nextProps.routes;
    const oldRouter = this.props.routes;
    if (oldRouter.length !== newRouter.length) {
      this.updateStateByProps(nextProps);
    }
    if (
      oldRouter.length === newRouter.length &&
      oldRouter.length === 1 &&
      oldRouter[0].path !== newRouter[0].path
    ) {
      this.updateStateByProps(nextProps);
    }
  }

  onToggle = (openKeys) => {
    this.setState({
      openKeys,
    });
  };

  handleClick = (e) => {
    this.setState({
      selectedKey: e.key,
      openKeys: e.keyPath.slice(1),
    });
  };

  // 設置  左邊 導航欄 的 選中標籤
  updateStateByProps(props) {
    // 手動發分  必須 定位到 積分發放（自定義發分）
    if (
      props.routes &&
      props.routes.length > 0 &&
      props.routes[0].path === '/integral-manage/give-hand/detail'
    ) {
      props.routes[0].path = '/integral-manage/give-custom';
    }
    // 手動發分審批 ——》創建手動發分；批量篩選  成功-》任務中心  這2中情況需要刷新導航欄
    if (
      !this.state.selectedKey ||
      (props.routes.length > 0 && props.routes[0].path === '/') ||
      (props.routes.length > 0 &&
        props.routes[0].path === '/integral-manage/give-custom') ||
      (props.routes.length > 0 && props.routes[0].path === '/task-center/list')
    ) {
      this.initKeys(props.routes);
    }
  }

  initKeys = (routes) => {
    let keys = [];

    // 查找keys
    [...routes].reverse().some((item) => {
      const find = findKeysByPath(menuList, item.path);
      if (find.found) {
        keys = find.keys;
      }
      return find.found;
    });
    this.setState({
      selectedKey: keys[keys.length - 1],
      openKeys: [...keys].reverse().slice(1),
    });
  };

  createMenu(list) {
    const { auth } = this.props;
    return list
      .filter((it) => (it.permit ? isEmpowered(it.permit, auth) : true))
      .map((item) => {
        if (Array.isArray(item.list)) {
          const children = this.createMenu(item.list).filter(
            (child) => child !== null
          );
          return children.length > 0 ? (
            <SubMenu
              key={item.key}
              title={
                <span>
                  <Icon type={item.icon || 'appstore'} />
                  <span>{item.title}</span>
                </span>
              }
            >
              {children}
            </SubMenu>
          ) : null;
        }
        return (
          <MenuItem key={item.key}>
            <Link to={item.path}>
              <Icon type={item.icon} />
              <span className="nav-text">{item.name}</span>
            </Link>
          </MenuItem>
        );
      });
  }

  render() {
    const { selectedKey, openKeys } = this.state;
    const { collapsed } = this.props;
    const props = {
      selectedKeys: [selectedKey],
      onClick: this.handleClick,
      onOpenChange: this.onToggle,
    };
    if (!collapsed) {
      props.openKeys = openKeys;
    }

    return (
      <Menu mode="inline" {...props}>
        {this.createMenu(menuList)}
      </Menu>
    );
  }
}

export default connect(({ auth }) => ({
  auth: auth.toJS(),
}))(Sidebar);
