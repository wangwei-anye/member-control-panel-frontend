/**
 * 权限wrap，如果有权限则显示children 没有则不展示
 */
import React from 'react';
import PropTypes from 'prop-types';
import { isUserHasRights } from 'utils/tools';

class Span extends React.Component {
  render() {
    return (
      <span>{this.props.children}</span>
    );
  }
}

export default class AuthWrapCom extends React.Component { // eslint-disable-line
  static defaultProps = {
    com: Span
  }

  state = {
    isHasAuth: false // 默认无权限
  };

  componentDidMount() {
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextPros) {
    this.updateStateByProps(nextPros);
  }

  updateStateByProps(nextProps) {
    const authList = nextProps.authList;
    this.setState({
      isHasAuth: isUserHasRights(authList)
    });
  }

  render() {
    const { isHasAuth } = this.state;
    const { children } = this.props;
    const Com = this.props.com;
    return isHasAuth ? <Com>{children}</Com> : null;
  }
}
