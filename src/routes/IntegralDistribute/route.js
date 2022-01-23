const IntegralPage = import('./integral');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '會員積分分佈',
    path: '/integral/distribute',
    model: Model,
    component: IntegralPage,
    permit: 'member_balance.member_balance.index'
  }
];
