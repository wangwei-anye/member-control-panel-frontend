const LogListPage = import('./index');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: '規則日誌',
    path: '/integral-manage/log',
    model: Model,
    component: LogListPage,
    permit: 'points_management.rule_events.index'
  }
];
