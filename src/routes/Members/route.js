const MemberList = import('./index');
const DetailAction = import('./detailAction');
const DetailCoupon = import('./detailCoupon');
const DetailLog = import('./detailLog');
const DetailIntegral = import('./detailIntegral');
const DetailRecord = import('./detailRecord');
const DetailAnalysis = import('./detailAnalysis');
const BatchFilterPage = import('./batchFilterPage');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: '會員管理',
    path: '/member',
    model: Model,
    component: MemberList,
    permit: 'member_manage.member_list',
    routes: [
      {
        breadcrumbName: '會員詳情',
        path: '/member/detail-record',
        component: DetailRecord,
        permit: 'member_manage.member_detail',
        models: [Model],
      },
      {
        breadcrumbName: '批量篩選',
        path: '/member/batch-filter',
        component: BatchFilterPage,
        permit: 'member_manage.member_select',
        models: [Model],
      },
      {
        breadcrumbName: '會員詳情',
        path: '/member/detail-action',
        permit: 'member_manage.member_detail',
        component: DetailAction,
        models: [Model],
      },
      {
        breadcrumbName: '會員詳情',
        path: '/member/detail-integral',
        permit: 'member_manage.member_detail',
        component: DetailIntegral,
        models: [Model],
      },
      {
        breadcrumbName: '會員詳情',
        path: '/member/detail-coupon',
        permit: 'member_manage.member_detail',
        component: DetailCoupon,
        models: [Model],
      },
      {
        breadcrumbName: '會員詳情',
        path: '/member/detail-log',
        permit: 'member_manage.member_detail',
        component: DetailLog,
        models: [Model],
      },
      {
        breadcrumbName: '會員分析',
        path: '/member/detail-analysis',
        permit: 'member_manage.member_detail',
        component: DetailAnalysis,
        models: [Model],
      },
    ],
  },
];
