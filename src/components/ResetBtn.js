//  重置按钮
import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Button } from 'antd';
import qs from 'qs';
import { DEFAULT_PAGE_SIZE } from 'constants';

class ResetBtnCom extends React.Component {
  /**
   * 重置表單  如果只有page 和 pageSize 则不刷新页面，或者需要刷新页面
   */
  resetAction = () => {
    if (this.props.onReset && typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
    const { location, system } = this.props;
    const search = location.search;

    this.props.form.resetFields();
    if (search) {
      const querystring = qs.stringify(this.genQuery());
      this.props.history.replace(`${location.pathname}?${querystring}`);
    }
  };

  genQuery() {
    const { location, system } = this.props;
    const pathname = location.pathname;
    const { query } = system;
    const pageSize = query.pageSize || DEFAULT_PAGE_SIZE;
    const offer_entry_id = query.offer_entry_id;
    if (pathname === '/finance/IntegralSummary/releasePoints') {
      return {
        page: 1,
        pageSize,
        project_id: query.project_id,
      };
    }
    if (pathname === '/role/accountList') {
      return {
        page: 1,
        pageSize,
        group_id: query.group_id,
      };
    }
    if (pathname === '/qr_code/record') {
      return {
        page: 1,
        pageSize,
        offer_entry_id,
      };
    }

    return {
      page: 1,
      pageSize,
    };
  }
  render() {
    const { disabled } = this.props;
    return (
      <Button onClick={this.resetAction} iscom="hui" disabled={disabled}>
        重置
      </Button>
    );
  }
}
export default withRouter(
  connect(({ system }) => ({
    system: system.toJS(),
  }))(ResetBtnCom)
);
