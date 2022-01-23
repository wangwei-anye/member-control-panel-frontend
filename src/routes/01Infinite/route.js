const ActivityPage = require('./activity');
const ShopPage = require('./shop');
const RecommendPage = require('./recommend');
const RecommendDetailPage = require('./recommendDetail');
const DivisionPage = require('./area');
const DivisionDetailPage = require('./areaDetail');
const RewardPage = require('./reward');
const RewardDetailPage = require('./rewardDetail');
const selectedActivities = require('./selectedActivities');
const DiscountConfig = require('./discountConfig');
const Model = require('./model');

export default [
  {
    breadcrumbName: '推薦列表管理',
    path: '/01-infinite/recommend',
    model: Model,
    component: RecommendPage,
    permit: 'operation_manage.points_area.shopping_mall_activity',
    routes: [
      {
        breadcrumbName: '推薦內容詳情',
        path: '/01-infinite/recommend/detail',
        component: RecommendDetailPage,
        models: [Model],
        permit: 'operation_manage.points_area.shopping_mall_activity.detail',
      },
    ],
  },
  {
    breadcrumbName: '赚分專區管理',
    path: '/01-infinite/area',
    model: Model,
    component: DivisionPage,
    permit: 'operation_manage.points_area.earn_points.list',
    routes: [
      {
        breadcrumbName: '賺分任務詳情',
        path: '/01-infinite/area/detail',
        component: DivisionDetailPage,
        models: [Model],
        permit: 'operation_manage.points_area.earn_points.detail',
      },
    ],
  },
  // NOTE: 权限内容
  {
    breadcrumbName: '獎賞專區管理',
    path: '/01-infinite/reward',
    model: Model,
    component: RewardPage,
    permit: 'operation_manage.points_area.earn_points.list',
    routes: [
      {
        breadcrumbName: '獎賞內容詳情',
        path: '/01-infinite/reward/detail',
        component: RewardDetailPage,
        models: [Model],
        permit: 'operation_manage.points_area.earn_points.detail',
      },
    ],
  },
  {
    breadcrumbName: '精選活動',
    path: '/01-infinite/selected-activities',
    component: selectedActivities,
    permit: 'operation_manage.points_area.selected_activity.index',
  },
  {
    breadcrumbName: '無限商城',
    path: '/01-infinite/shop',
    model: Model,
    component: ShopPage,
    permit: 'operation_manage.points_area.infinite_mall.index',
  },
  {
    breadcrumbName: '活動管理',
    path: '/01-infinite/activity',
    model: Model,
    component: ActivityPage,
    permit: 'operation_manage.points_area.zero_one_activity.index',
  },
  // 屏蔽彩蛋1.0
  // {
  //   breadcrumbName: '新會員專享優惠配置',
  //   path: '/01-infinite/discount-config',
  //   model: Model,
  //   component: DiscountConfig,
  //   permit: 'points_area.promotional_activity'
  // }
];
