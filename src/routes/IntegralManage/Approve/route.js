const IntegralManageApproveList = import('./index');
const IntegralManageApproveSet = import('./set');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: '積分審批',
    path: '/integral-manage/approve',
    model: Model,
    component: IntegralManageApproveList,
    permit: 'points_management.points_approval.index',
    routes: [
      {
        breadcrumbName: '審批配置',
        path: '/integral-manage/approve/set',
        models: [Model],
        component: IntegralManageApproveSet,
        permit: 'points_management.points_approval.index',
      },
    ],
  },
];
