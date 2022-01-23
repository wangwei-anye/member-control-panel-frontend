const ListPage = require('./list');
const TaskListPage = require('./taskList');
const Model = require('./model');

export default [
  {
    breadcrumbName: '批量導出',
    path: '/task-center/list',
    model: Model,
    component: ListPage,
    permit: 'task_center.task_operation.index',
  },
  {
    breadcrumbName: '任務列表',
    path: '/task-center/taskList',
    model: Model,
    component: TaskListPage,
    permit: 'task_center.task_flow_list.index',
  },
];
