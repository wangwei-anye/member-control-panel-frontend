// 此组件为一些公用数据或者组件，比如 部门列表，上报渠道等公用数据获取在该组件通过请求获取，存在system modal中公用；
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  fetchDepartmentList,
  fetchReportChannelListRequest
} from 'services/common/common';

class CommonCom extends React.Component {
  async componentWillMount() {
    if (this.props.auth.authorized) {
      await Promise.all([
        this.fetchPartmentList(),
        this.fetchReportChannelList()
      ]);
    }
  }
  async fetchReportChannelList() {
    const { data } = await fetchReportChannelListRequest();
    if (data.status) {
      const list = data.data;
      const reportChannelJson = {};
      list.forEach(item => {
        reportChannelJson[item.id] = item.channel_name;
        reportChannelJson[item.channel_name] = item.id;
      });
      this.props.dispatch({
        type: 'system/save',
        payload: {
          reportChannelList: list,
          reportChannelJson
        }
      });
    }
  }
  async fetchPartmentList() {
    const { data } = await fetchDepartmentList();
    if (data.status) {
      this.props.dispatch({
        type: 'system/save',
        payload: {
          partmentList: data.data.list
        }
      });
    }
  }
  render() {
    return null;
  }
}
export default withRouter(
  connect(({ system, auth }) => ({
    auth: auth.toJS(),
    system: system.toJS()
  }))(CommonCom)
);
