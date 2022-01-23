const TaskPage = import('./task');
const ActivityPage = import('./activity');
const DetailPage = import('./detail');
const selectedActivities = import('./selectedActivities');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '積分任務管理',
    path: '/integral-division/task',
    model: Model,
    component: TaskPage,
    permit: 'points_area.points_task'
  },
  {
    breadcrumbName: '精選活動',
    path: '/integral-division/selected-activities',
    component: selectedActivities,
    permit: 'points_area.selected_activity.index'
  },
  {
    breadcrumbName: '熱門活動管理',
    path: '/integral-division/activity',
    model: Model,
    component: ActivityPage,
    permit: 'points_area.hot_activity.index',
    routes: [
      {
        breadcrumbName: '活動詳情',
        path: '/integral-division/activity/detail',
        models: [Model],
        component: DetailPage,
        permit: 'points_area.hot_activity'
      }
    ]
  }
];
