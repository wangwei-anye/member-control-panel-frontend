/**
 * 授权组件
 * 用于整个系统的按钮、链接等资源的授权
 * 仅需配置按钮将会调用到的接口，便可自动进行授权处理
 *
 * @prop  {string}  permit      Dom组件将会请求的api地址
 * @prop  {boolean} disable     可选，是否默认禁用。如设置该值为true，则总是禁用该资源
 * @prop  {string}  disableType 可选，禁用方式，可选值disable、hide，缺省为disable
 */
/* eslint-disable */
import React from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { DEFAULT_EMPOWER_DISABLE_TYPE } from 'constants';
import { convertJsonToKeys } from 'utils/permissionTree';

const disabledCss = {
  color: '#ccc',
  cursor: 'not-allowed',
  textDecoration: 'none',
};

/**
 * 函数式判断是否授权
 * 对于无法使用Empower的特殊组件，可使用该函数判断授权
 * @param  {string}  permit 权限路径，形如：user.list.add
 * @param  {object}  auth   权限系统配置
 * @return {boolean}        已授权则返回true
 */
export const isEmpowered = (permit, auth) => {
  const permits = convertJsonToKeys(auth.permissions);
  return permits.some((it) => it === permit);
};

class Empower extends React.Component {
  static propTypes = {
    permit: PropTypes.string.isRequired,
    disable: PropTypes.bool,
    disableType: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.disabledChildren = null;
  }

  state = {
    disabled: false,
    disableType: DEFAULT_EMPOWER_DISABLE_TYPE,
  };

  componentWillMount() {
    this.authorize(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.authorize(nextProps);
  }

  // 阻止默认事件
  handlePreventEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // 授权处理
  authorize(props) {
    const { children, permit, auth, disabled: notAllowed } = props;
    const disableType =
      props.disableType ||
      props['disable-type'] ||
      DEFAULT_EMPOWER_DISABLE_TYPE;
    const disabled = notAllowed || !isEmpowered(permit, auth);
    if (disableType === 'disable' && disabled) {
      this.disabledChildren = this.disableChildren(children);
    }
    this.setState({
      disabled,
      disableType,
    });
  }

  // 禁用子节点
  disableChildren(children) {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) {
      return React.Children.map(children, (child) =>
        this.disableChildren(child)
      );
    }
    const { type, props } = children;
    const tagName =
      typeof type === 'function' ? type.name || type.displayName : type;
    const newProps = { ...props };

    if (props.children) {
      newProps.children = this.disableChildren(props.children);
    }

    // 禁用策略
    Object.assign(newProps, {
      // title: '无此权限',
      onClick: (e) => this.handlePreventEvent(e),
      disabled: true,
      style: Object.assign({}, props.style, disabledCss, this.props.style),
    });
    if (newProps.href) {
      newProps.href = '';
    }
    if (newProps.to) {
      newProps.to = '';
    }
    if (newProps.trigger) {
      newProps.trigger = '';
    }
    if (newProps.onChange) {
      newProps.onChange = (e) => this.handlePreventEvent(e);
    }
    if (newProps.onSelect) {
      newProps.onSelect = (e) => this.handlePreventEvent(e);
    }

    return React.cloneElement(children, newProps);
  }

  render() {
    const { children } = this.props;
    const { disabled, disableType } = this.state;

    if (disableType === 'hide' && disabled) {
      return null;
    } else if (disableType === 'disable' && disabled) {
      return this.disabledChildren;
    }
    return children;
  }
}

export default connect(({ auth }) => ({
  auth: auth.toJS(),
}))(Empower);
