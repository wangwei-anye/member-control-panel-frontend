/**
 * a标签封装，用于打开站内受限文件
 * 添加SSO会话信息
 */
import React from 'react';
import { connect } from 'dva';
import fetch from 'dva/fetch';
import { Progress } from 'antd';
import { HEADER_TOKEN_NAME } from 'constants';

class A extends React.PureComponent {
  state = {
    percent: 0
  };

  handleClick = async e => {
    this.startProgress();
    const url = await this.fetchFile(this.props.href);
    const a = document.createElement('a');
    a.href = url;
    a.target = this.props.target || '_self';
    if (this.props.download) {
      a.download = this.props.download;
    }
    a.click();
    window.URL.revokeObjectURL(url);
    if (typeof this.props.onClick === 'function') {
      this.props.onClick(e);
    }
  };

  fetchFile = async url => {
    const option = {
      method: 'GET',
      mode: 'cors',
      // cache: 'force-cache',
      cache: 'default',
      credentials: 'include',
      headers: {
        [HEADER_TOKEN_NAME]: this.props.auth.jwt
      }
    };
    return fetch(url, option)
      .then(res => res.blob())
      .then(blob => {
        this.setState({
          percent: 100
        });
        return window.URL.createObjectURL(blob);
      });
  };

  startProgress = () => {
    const { percent } = this.state;
    if (percent === 100) {
      this.setState({
        percent: 0,
        showInfo: false
      });
      return;
    }
    this.setState({
      percent: percent + ((100 - percent) * 0.1)
    });
    setTimeout(this.startProgress, 500);
  };

  render() {
    const props = { ...this.props };
    delete props.auth;
    delete props.dispatch;
    delete props.href;

    return (
      <a
        {...props}
        style={{ display: 'inline-block', lineHeight: 1, ...props.style }}
        onClick={this.handleClick}
      >
        {props.children}
        <Progress
          hidden={this.state.percent === 0}
          percent={this.state.percent}
          status="active"
          strokeWidth={2}
          showInfo={false}
          style={{ lineHeight: 0 }}
        />
      </a>
    );
  }
}

export default connect(({ auth }) => ({
  auth: auth.toJS()
}))(A);
