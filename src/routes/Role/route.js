const RolePage = import('./role');
const CreateRole = import('./CreateRole');
const AccountList = import('./AccountList');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '角色管理',
    path: '/role',
    model: Model,
    component: RolePage,
    permit: 'system_management.role.index',
    routes: [
      {
        // 新建角色
        breadcrumbName: '創建角色',
        path: '/role/add',
        component: CreateRole,
        models: [Model],
      },
      {
        // 编辑角色
        breadcrumbName: '編輯角色',
        path: '/role/edit',
        component: CreateRole,
        models: [Model],
      },
      {
        // 角色 賬號列表
        breadcrumbName: '配置角色帳號',
        path: '/role/accountList',
        component: AccountList,
        models: [Model],
      },
    ],
  },
];
