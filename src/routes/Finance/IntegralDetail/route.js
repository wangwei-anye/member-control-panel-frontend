const ChangePage = import('./change');
const ConsumPage = import('./consum');
const UserPage = import('./user');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '積分變動明細',
    path: '/finance/integral-detail/change',
    model: Model,
    component: ChangePage,
    permit: 'finance_management.points_change_detail.points_detail_list',
  },
  {
    breadcrumbName: '用戶積分發放明細',
    path: '/finance/integral-detail/user',
    model: Model,
    component: UserPage,
    permit: 'finance_management.points_change_detail.points_offer_detail',
  },
  {
    breadcrumbName: '積分消費明細',
    path: '/finance/integral-detail/consum',
    model: Model,
    component: ConsumPage,
    permit: 'finance_management.points_change_detail.points_consume_detail',
  },
];
