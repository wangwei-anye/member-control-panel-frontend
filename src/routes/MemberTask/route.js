const ListPage = require('./index');
const Model = require('./model');

const IntegralManageGiveCustomConfigStep1 = import('./Custom/configStep1');
const IntegralManageGiveCustomConfigStep2 = import('./Custom/configStep2');
const IntegralManageGiveCustomConfigStep3 = import('./Custom/configStep3');
const IntegralManageGiveCustomConfigStep4 = import('./Custom/submit');

export default [
  {
    breadcrumbName: '任務管理',
    path: '/member-task/list',
    model: Model,
    component: ListPage,
    permit: 'member_tasks.tasks_list',
    routes: [
      {
        breadcrumbName: '新增會員任務',
        path: '/member-task/config/base',
        models: [Model],
        component: IntegralManageGiveCustomConfigStep1,
        permit: 'member_tasks.create',
      },
      {
        breadcrumbName: '新增會員任務',
        path: '/member-task/config/account',
        models: [Model],
        component: IntegralManageGiveCustomConfigStep2,
        permit: 'member_tasks.create',
      },
      {
        breadcrumbName: '新增會員任務',
        path: '/member-task/config/rule',
        models: [Model],
        component: IntegralManageGiveCustomConfigStep3,
        permit: 'member_tasks.create',
      },
      {
        breadcrumbName: '新增會員任務',
        path: '/member-task/config/submit',
        models: [Model],
        component: IntegralManageGiveCustomConfigStep4,
        permit: 'member_tasks.create',
      },
    ],
  },
];
