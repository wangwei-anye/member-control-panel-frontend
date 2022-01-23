const ListPage = require('./list');
const RecordListPage = require('./record');
const Detail = require('./detail');
const Statistics = require('./statistics');
const Question = require('./question');
const Model = require('./model');

export default [
  {
    breadcrumbName: '推廣活動頁配置',
    path: '/activity-config/list',
    model: Model,
    component: ListPage,
    permit: 'operation_manage.promotional_activity.activity_set',
    routes: [
      {
        breadcrumbName: '推廣活動',
        path: '/activity-config/add/:type',
        component: Detail,
        models: [Model],
        permit: 'operation_manage.promotional_activity.activity_set',
      },
      {
        breadcrumbName: '活動詳情',
        path: '/activity-config/detail/:id',
        component: Detail,
        models: [Model],
        permit: 'operation_manage.promotional_activity.activity_set',
      },
    ],
  },
  {
    breadcrumbName: '領取記錄',
    path: '/activity-config/record',
    model: Model,
    component: RecordListPage,
    permit: 'operation_manage.promotional_activity.record',
  },
  {
    breadcrumbName: '答題統計',
    path: '/activity-config/statistics',
    component: Statistics,
    models: [Model],
    permit: 'operation_manage.promotional_activity.answer_total',
  },
  {
    breadcrumbName: '題庫管理',
    path: '/activity-config/question',
    component: Question,
    models: [Model],
    permit: 'operation_manage.promotional_activity.questions',
  },
];
