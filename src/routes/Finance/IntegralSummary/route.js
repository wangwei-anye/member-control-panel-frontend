const BalancePage = import('./balance');
const SubAccountBalance = import('./subAccountBalance');
const ConsumPage = import('./consum');
const SystemPage = import('./system');
const BUPage = import('./BU');
const BUAccountPage = import('./BUAccount');
const BUTrendChartPage = import('./BUTrendChart');
const ReleasePointsPage = import('./releasePoints');
const Model = import('./model'); // 导入model

export default [
  {
    breadcrumbName: '積分餘額變動管理',
    path: '/finance/integral-summary/balance',
    model: Model,
    component: BalancePage,
    permit: 'finance_management.point_collect.point_balance',
  },
  {
    breadcrumbName: '收分子帳戶餘額變動管理',
    path: '/finance/integral-summary/subAccountBalance',
    model: Model,
    component: SubAccountBalance,
    permit: 'finance_management.point_collect.point_balance',
  },
  {
    breadcrumbName: '積分發放匯總',
    path: '/finance/integral-summary/system',
    model: Model,
    component: SystemPage,
    permit: 'finance_management.point_collect.offer_list',
  },
  {
    breadcrumbName: '積分消費匯總',
    path: '/finance/integral-summary/consum',
    model: Model,
    component: ConsumPage,
    permit: 'finance_management.point_collect.point_consume_list',
  },
  {
    breadcrumbName: 'BU積分變動匯總',
    path: '/finance/integral-summary/bu',
    model: Model,
    component: BUPage,
    permit: 'finance_management.point_collect.department_list',
  },
  {
    breadcrumbName: 'BU賬戶積分變動匯總',
    path: '/finance/integral-summary/bu-account',
    model: Model,
    component: BUAccountPage,
    permit: 'finance_management.point_collect.bu_account_points_list',
  },
  {
    breadcrumbName: 'BU賬戶積分變動走勢',
    path: '/finance/integral-summary/bu-trend',
    model: Model,
    component: BUTrendChartPage,
    permit: 'finance_management.point_collect.bu_points_diagram',
  },
  {
    breadcrumbName: '應發積分匯總',
    path: '/finance/IntegralSummary/releasePoints',
    model: Model,
    component: ReleasePointsPage,
    permit: 'finance_management.estimate_offer.index',
  },
];
