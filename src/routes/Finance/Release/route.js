const ListPage = import('./index');
const DetailPage = import('./detail');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '發放項審批',
    path: '/finance/release',
    model: Model,
    component: ListPage,
    permit: 'budget_management.offer_approval.index',
    routes: [
      {
        breadcrumbName: '詳情',
        path: '/finance/release/detail',
        component: DetailPage,
        models: [Model],
        permit: 'budget_management.offer_approval.detail'
      }
    ]
  }
];
