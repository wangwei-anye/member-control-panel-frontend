const Statistics = import('./index');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '應用概況',
    path: '/',
    model: Model,
    component: Statistics,
    permit: 'app_info.index',
  },
];
