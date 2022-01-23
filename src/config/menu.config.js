/* eslint-disable */
export default [
  {
    title: '應用概況',
    name: '應用概況',
    icon: 'appstore-o',
    permit: 'app_info.index',
    path: '/',
  },
  {
    title: '會員管理',
    icon: 'user',
    permit: 'member_manage',
    list: [
      {
        name: '信息管理',
        path: '/member',
        icon: 'unordered-list',
        permit: 'member_manage.member_list',
      },
      {
        name: '批量篩選',
        path: '/member/batch-filter',
        icon: 'filter',
        permit: 'member_manage.member_select.multi_select',
      },
    ],
  },
  {
    title: '會員分析',
    name: '會員分析',
    icon: 'radar-chart',
    permit: 'member_analysis',
    list: [
      {
        name: '會員趨勢',
        path: '/member_analysis/trend',
        icon: 'fund',
        permit: 'member_analysis.member_trend',
      },
      {
        name: '會員畫像',
        path: '/member_analysis/figure',
        icon: 'team',
        permit: 'member_analysis.member_portrait.portrait',
      },
    ],
  },
  {
    title: '帳號權限',
    icon: 'lock',
    permit: 'system_management',
    list: [
      {
        name: '角色管理',
        path: '/role',
        icon: 'user-add',
        permit: 'system_management.role.index',
      },
      {
        name: '帳號管理',
        path: '/account',
        icon: 'key',
        permit: 'system_management.account.user_list',
      },
      {
        name: '部門管理',
        path: '/department',
        icon: 'key',
        permit: 'system_management.department.list',
      },
    ],
  },
  {
    title: '會員積分分佈',
    icon: 'down-square-o',
    permit: 'member_balance.member_balance.index',
    name: '會員積分分佈',
    path: '/integral/distribute',
  },
  {
    title: '積分管理',
    icon: 'setting',
    permit: 'points_management',
    list: [
      {
        name: '積分賬戶',
        path: '/integral-manage/account/member',
        icon: 'team',
        permit: 'points_management.points_account',
      },
      {
        name: '積分發放',
        path: '/integral-manage/give-custom',
        icon: 'exception',
        permit: 'points_management.points_offer',
      },
      {
        name: '積分審批',
        path: '/integral-manage/approve',
        icon: 'compass',
        permit: 'points_management.points_approval.index',
      },
      {
        name: '積分事件',
        path: '/integral-manage/events',
        icon: 'credit-card',
        permit: 'points_management.points_events.index',
      },
      {
        name: '規則日誌',
        path: '/integral-manage/log',
        icon: 'book',
        permit: 'points_management.rule_events.index',
      },
    ],
  },
  {
    title: '預算管理',
    icon: 'pay-circle-o',
    permit: 'budget_management',
    name: '預算管理',
    list: [
      {
        name: '預算審批',
        path: '/finance/budget',
        icon: 'red-envelope',
        permit: 'budget_management.budget_approval.index',
      },
      {
        name: '手動發放審批',
        path: '/finance/hand',
        icon: 'message',
        permit: 'budget_management.manual_approval.index',
      },
      {
        name: '發放項審批',
        path: '/finance/release',
        icon: 'calculator',
        permit: 'budget_management.offer_approval.index',
      },
    ],
  },
  {
    title: '財務管理',
    icon: 'wallet',
    permit: 'finance_management',
    name: '財務管理',
    list: [
      {
        title: '積分變動匯總',
        icon: 'line-chart',
        permit: 'finance_management.point_collect',
        list: [
          {
            name: '積分餘額變動',
            path: '/finance/integral-summary/balance',
            icon: 'area-chart',
            permit: 'finance_management.point_collect.point_balance',
          },
          {
            name: '收分子帳戶餘額變動',
            path: '/finance/integral-summary/subAccountBalance',
            icon: 'stock',
            permit: 'finance_management.point_collect.sub_income_account',
          },
          {
            name: '積分發放匯總',
            path: '/finance/integral-summary/system',
            icon: 'pie-chart',
            permit: 'finance_management.point_collect.offer_list',
          },
          {
            name: '積分消費匯總',
            path: '/finance/integral-summary/consum',
            icon: 'dot-chart',
            permit: 'finance_management.point_collect.point_consume_list',
          },
          // {
          //   name: 'BU積分變動匯總',
          //   path: '/finance/integral-summary/bu',
          //   icon: 'database',
          //   permit: 'finance_management.point_collect.department_list',
          // },
          // {
          //   name: 'BU賬戶積分變動匯總',
          //   path: '/finance/integral-summary/bu-account',
          //   icon: 'table',
          //   permit: 'finance_management.point_collect.bu_account_points_list',
          // },
          // {
          //   name: 'BU賬戶積分變動走勢',
          //   path: '/finance/integral-summary/bu-trend',
          //   icon: 'line-chart',
          //   permit: 'finance_management.point_collect.bu_points_diagram',
          // },
        ],
      },
      {
        title: '積分變動明細',
        icon: 'bar-chart',
        permit: 'finance_management.points_change_detail',
        list: [
          {
            name: '積分變動明細',
            path: '/finance/integral-detail/change',
            icon: 'bars',
            permit:
              'finance_management.points_change_detail.points_detail_list',
          },
          {
            name: '用戶積分發放明細',
            path: '/finance/integral-detail/user',
            icon: 'code',
            permit:
              'finance_management.points_change_detail.points_offer_detail',
          },
          {
            name: '積分消費明細',
            path: '/finance/integral-detail/consum',
            icon: 'book',
            permit:
              'finance_management.points_change_detail.points_consume_detail',
          },
        ],
      },
      {
        name: '應發積分匯總',
        path: '/finance/IntegralSummary/releasePoints',
        icon: 'red-envelope',
        permit: 'finance_management.estimate_offer.index',
      },
    ],
  },
  {
    title: '運營管理',
    name: '運營管理',
    icon: 'global',
    permit: 'operation_manage',
    list: [
      {
        title: '彩蛋配置',
        name: '彩蛋配置',
        path: '/activity-config/list',
        icon: 'profile',
        permit: 'operation_manage.promotional_activity',
        list: [
          {
            name: '活動配置',
            path: '/activity-config/list',
            icon: 'profile',
            permit: 'operation_manage.promotional_activity.activity_set',
          },
          {
            name: '領取記錄',
            path: '/activity-config/record',
            icon: 'profile',
            permit: 'operation_manage.promotional_activity.record',
          },
          {
            name: '答題統計',
            path: '/activity-config/statistics',
            icon: 'profile',
            permit: 'operation_manage.promotional_activity.answer_total',
          },
          {
            name: '題庫管理',
            path: '/activity-config/question',
            icon: 'profile',
            permit: 'operation_manage.promotional_activity.questions',
          },
        ],
      },
      {
        name: 'QR Code管理',
        icon: 'profile',
        path: '/qr_code/list',
        permit: 'operation_manage.qr_code.get_offer_entry_list',
      },
      {
        title: '01會員專區/積分專區',
        name: '01會員專區/積分專區',
        icon: 'schedule',
        permit: 'operation_manage.points_area',
        list: [
          {
            title: '推薦管理',
            name: '推薦管理',
            path: '/01-infinite/recommend',
            icon: 'like',
            permit: 'operation_manage.points_area.shopping_mall_activity',
          },
          // 屏蔽彩蛋1.0
          // {
          //   name: '新會員專享優惠配置',
          //   path: '/01-infinite/discount-config',
          //   icon: 'gift',
          //   permit: 'points_area.promotional_activity'
          // }
          // TODO 由于产品临时需求更改，01无限 只显示 商城推荐，其他的隐藏
          {
            name: '獎賞專區管理',
            path: '/01-infinite/reward',
            icon: 'flag',
            permit: 'operation_manage.points_area.reward_points.list',
          },
          {
            name: '賺分專區管理',
            path: '/01-infinite/area',
            icon: 'flag',
            permit: 'operation_manage.points_area.earn_points.list',
          },
          // {
          //   name: '精選活動',
          //   icon: 'star',
          //   path: '/01-infinite/selected-activities',
          //   permit: 'points_area.selected_activity.index'
          // },
          // {
          //   name: '無限商城',
          //   path: '/01-infinite/shop',
          //   icon: 'shop',
          //   permit: 'points_area.infinite_mall.index'
          // },
          {
            name: '01活動管理',
            path: '/01-infinite/activity',
            icon: 'gift',
            permit: 'operation_manage.points_area.zero_one_activity.index',
          },
        ],
      },
      {
        name: '01權益包',
        icon: 'profile',
        path: '/equities_package/list',
        permit: 'operation_manage.points_offer_package.list',
      },
    ],
  },
  {
    title: '任務中心',
    name: '任務中心',
    icon: 'cloud',
    permit: 'task_center',
    list: [
      {
        name: '批量導出',
        path: '/task-center/list',
        icon: 'profile',
        permit: 'task_center.task_operation.index',
      },
      {
        name: '任務列表',
        path: '/task-center/taskList',
        icon: 'profile',
        permit: 'task_center.task_flow_list.index',
      },
    ],
  },
  {
    title: '任務管理',
    name: '任務管理',
    icon: 'profile',
    permit: 'member_tasks',
    list: [
      {
        name: '任務列表',
        path: '/member-task/list',
        icon: 'profile',
        permit: 'member_tasks.tasks_list',
      },
    ],
  },
];
