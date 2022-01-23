const ListPage = import('./index');
const DetailPage = import('./detail');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '手動發放審批',
    path: '/finance/hand',
    model: Model,
    component: ListPage,
    permit: 'budget_management.manual_approval.index',
    routes: [
      {
        breadcrumbName: '詳情',
        path: '/finance/hand/detail',
        component: DetailPage,
        models: [Model],
        permit: 'budget_management.manual_approval.manual_detail'
      }
    ]
  }
];
