import React from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import { withRouter } from 'react-router';
import './index.less';
import StackComponent from './components/stackComponent';

const appInfoNavList = [
  {
    name: '新用戶數', // 显示的名称
    en: 'new_user_quantity', // 所对应的接口字段名称
    url: 'new_user', // 对应调用接口所需要传递的detail 字段名
    chartTipName: '分時用戶', // echarts tips 提示的name
    chartYUnit: '人' // echarts Y轴显示的单位
  },
  {
    name: '啓動用戶數',
    en: 'starting_user_quantity',
    url: 'starting_user',
    chartTipName: '分時用戶',
    chartYUnit: '人'
  },
  {
    name: 'Session 啓動次數',
    en: 'starting_quantity',
    url: 'starting_quantity',
    chartTipName: '啓動次數',
    chartYUnit: '次'
  },
  {
    name: '人均日啓動次數',
    en: 'user_per_times',
    url: 'user_per_time',
    chartTipName: '人均日啓動次數',
    chartYUnit: '次'
  },
  {
    name: '人均使用時長',
    en: 'per_start_times',
    url: 'per_start_time',
    chartTipName: '人均啓動時長',
    chartYUnit: ''
  },
  {
    name: '次均使用時長',
    en: 'second_per_start_duration',
    url: 'second_per_start_duration',
    chartTipName: '次均啓動時長',
    chartYUnit: ''
  }
];
const webInfoNavList = [
  {
    name: '瀏覽量(PV)',
    en: 'page_view',
    url: 'pv',
    chartTipName: '分時瀏覽量',
    chartYName: '次'
  },
  {
    name: '訪客數(UV)',
    en: 'user_view',
    url: 'uv',
    chartTipName: '分時訪客',
    chartYUnit: '人'
  },
  // NOTE: mcp1.7隐藏改field
  // {
  //   name: 'IP數',
  //   en: 'ip_quantity',
  //   url: 'ip_quantity',
  //   chartTipName: '分時用戶',
  //   chartYUnit: '人'
  // },
  {
    name: '跳出率',
    en: 'bounce_rate',
    url: 'bounce_rate',
    chartTipName: '跳出率',
    chartYUnit: ''
  },
  {
    name: '平均訪問時長',
    en: 'per_start_times',
    url: 'ave_access_time',
    chartTipName: '平均訪問時長',
    chartYUnit: ''
  }
];
class AppPage extends React.PureComponent {
  render() {
    const { indexDataInfo } = this.props.statistics;
    return (
      <div className="index-wrap">
        <Card title="香港01APP應用概況" bordered={false}>
          <StackComponent
            name="hk01app"
            navList={appInfoNavList}
            dataInfo={indexDataInfo.app_info}
          />
        </Card>
        <Card title="香港01網站概況" bordered={false}>
          <StackComponent
            name="hk01web"
            navList={webInfoNavList}
            dataInfo={indexDataInfo.web_info}
          />
        </Card>
      </div>
    );
  }
}

export default withRouter(
  connect(({ statistics }) => ({
    statistics: statistics.toJS()
  }))(AppPage)
);
