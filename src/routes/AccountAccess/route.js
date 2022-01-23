const AccountPage = import('./account');
const CreateAccount = import('./CreateAccount');
const Department = import('./department');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '帳號權限',
    path: '/account',
    model: Model,
    component: AccountPage,
    permit: 'system_management.account.user_list',
    routes: [
      {
        // 帳號權限
        breadcrumbName: '創建帳號',
        path: '/account/add',
        component: CreateAccount,
        permit: 'system_management.account.user_add',
        models: [Model],
      },
      {
        // 帳號權限
        breadcrumbName: '編輯帳號',
        path: '/account/edit',
        component: CreateAccount,
        models: [Model],
      },
    ],
  },
  {
    breadcrumbName: '帳號權限',
    path: '/department',
    model: Model,
    component: Department,
    permit: 'system_management.department.list',
  },
];
