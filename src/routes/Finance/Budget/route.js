const ListPage = import('./index');
const DetailPage = import('./detail');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '預算審批',
    path: '/finance/budget',
    model: Model,
    component: ListPage,
    permit: 'budget_management.budget_approval.index',
    routes: [
      {
        breadcrumbName: '詳情',
        path: '/finance/budget/detail',
        component: DetailPage,
        models: [Model],
        permit: 'budget_management.budget_approval.detail'
      }
    ]
  }
];
