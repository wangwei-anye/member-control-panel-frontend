const IntegralManageAccoutMember = import('./member');
const IntegralManageAccoutMerchant = import('./merchant');
const IntegralManageAccoutOperation = import('./operation');
const IntegralManageAccoutOperationDetail = import('./operationDetail');
const IntegralManageIntegralExpired = import('./integralExpired');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: '積分賬戶',
    path: '/integral-manage/account/member',
    model: Model,
    component: IntegralManageAccoutMember,
    permit: 'points_management.points_account',
    routes: [
      {
        breadcrumbName: '積分餘額過期查詢',
        path: '/integral-manage/account/integralExpired',
        model: Model,
        component: IntegralManageIntegralExpired,
        permit: 'points_management.points_account',
      },
    ],
  },
  {
    breadcrumbName: '積分賬戶',
    path: '/integral-manage/account/merchant',
    model: Model,
    component: IntegralManageAccoutMerchant,
    permit: 'points_management.points_account',
  },
  {
    breadcrumbName: '積分賬戶',
    path: '/integral-manage/account/operation',
    model: Model,
    component: IntegralManageAccoutOperation,
    permit: 'points_management.points_account',
    routes: [
      {
        breadcrumbName: '運營積分帳戶詳情',
        path: '/integral-manage/account/operationDetail',
        model: Model,
        component: IntegralManageAccoutOperationDetail,
        permit: 'points_management.points_account',
      },
    ],
  },
];
