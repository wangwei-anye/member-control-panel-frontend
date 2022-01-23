const ListPage = import('./list');
const Detail = import('./detail');
const HistroyListPage = import('./historyList');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: '01權益包',
    path: '/equities_package/list',
    model: Model,
    component: ListPage,
    permit: 'operation_manage.points_offer_package.list',
    routes: [
      {
        breadcrumbName: '新增權益包',
        path: '/equities_package/add',
        component: Detail,
        models: [Model],
        permit: 'operation_manage.points_offer_package.add'
      },
      {
        breadcrumbName: '權益包详情',
        path: '/equities_package/detail/:id',
        component: Detail,
        models: [Model],
        permit: 'operation_manage.points_offer_package.detail'
      }
    ]
  }
];
