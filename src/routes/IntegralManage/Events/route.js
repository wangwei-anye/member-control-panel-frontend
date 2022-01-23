const EventList = import('./index');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: '事件管理',
    path: '/integral-manage/events',
    model: Model,
    component: EventList,
    permit: 'points_management.points_events.index'
  }
];
