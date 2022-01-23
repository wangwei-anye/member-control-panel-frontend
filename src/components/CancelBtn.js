//  重置按钮
import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Button } from 'antd';

class CancelBtnCom extends React.Component {
  /**
   * 重置表單  如果只有page 和 pageSize 则不刷新页面，或者需要刷新页面
   */
  cancelAction() {
    const { history } = this.props;
    if (this.props.onClick && typeof this.props.onClick === 'function') {
      this.props.onClick();
    } else if (history.length) {
      history.go(-1);
    } else {
      history.push('/');
    }
  }
  render() {
    const { title } = this.props;
    const props = this.props;
    const attr = {
      disabled: props.disabled,
      icon: props.icon,
      loading: props.loading,
      size: props.size,
      type: props.type,
      ghost: props.ghost
    };
    return (
      <Button onClick={() => this.cancelAction()} {...attr}>
        {title || '返回'}
      </Button>
    );
  }
}
export default withRouter(
  connect(({ system }) => ({
    system: system.toJS()
  }))(CancelBtnCom)
);
