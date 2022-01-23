const IntegralManageGiveFixedList = import('./Fixed/index');
const IntegralManageGiveFixedDetail = import('./Fixed/detail');
const IntegralManageGiveFixedDetailConf = import('./Fixed/config');
const IntegralManageGiveFixedDetailEquitiesPackCnf = import(
  './Fixed/equitiesPackageConfig'
);
const IntegralManageGiveFixedDetailPromotionCnf = import(
  './Fixed/promotionConfig'
);
const IntegralManageGiveFixedDetailQRcodeCnf = import('./Fixed/qrCodeConfig');
const IntegralManageGiveCustomList = import('./Custom/index');
const IntegralManageGiveCustomConfigStep1 = import('./Custom/configStep1');
const IntegralManageGiveCustomConfigStep2 = import('./Custom/configStep2');
const IntegralManageGiveCustomConfigStep3 = import('./Custom/submit');
const IntegralManageGiveHandList = import('./Hand/index');
const IntegralManageGiveHandDetail = import('./Hand/detail');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: '積分發放',
    path: '/integral-manage/give-custom',
    model: Model,
    component: IntegralManageGiveCustomList,
    permit: 'points_management.points_offer',
    routes: [
      {
        breadcrumbName: '自定義發放項配置',
        path: '/integral-manage/give-custom/config/base',
        models: [Model],
        component: IntegralManageGiveCustomConfigStep1,
        permit: 'points_management.points_offer.custom',
      },
      {
        breadcrumbName: '自定義發放項配置',
        path: '/integral-manage/give-custom/config/rule',
        models: [Model],
        component: IntegralManageGiveCustomConfigStep2,
        permit: 'points_management.points_offer.custom',
      },
      {
        breadcrumbName: '自定義發放項配置',
        path: '/integral-manage/give-custom/config/submit',
        models: [Model],
        component: IntegralManageGiveCustomConfigStep3,
        permit: 'points_management.points_offer.custom',
      },
    ],
  },
  {
    breadcrumbName: '積分發放',
    path: '/integral-manage/give-fixed',
    model: Model,
    component: IntegralManageGiveFixedList,
    permit: 'points_management.points_offer',
    routes: [
      {
        breadcrumbName: '固定發放項配置',
        path: '/integral-manage/give-fixed/detail',
        models: [Model],
        component: IntegralManageGiveFixedDetail,
        permit: 'points_management.points_offer.fixed',
      },
      {
        breadcrumbName: '編輯發放配置',
        path: '/integral-manage/give-fixed/detail/config',
        models: [Model],
        component: IntegralManageGiveFixedDetailConf,
        permit: 'points_management.points_offer.fixed',
      },
      {
        breadcrumbName: '01權益包詳情',
        path: '/integral-manage/give-fixed/detail/equities_package_config',
        models: [Model],
        component: IntegralManageGiveFixedDetailEquitiesPackCnf,
        permit: 'points_management.points_offer.fixed',
      },
      {
        breadcrumbName: 'QR Code詳情',
        path: '/integral-manage/give-fixed/detail/qr_code_config',
        models: [Model],
        component: IntegralManageGiveFixedDetailQRcodeCnf,
        permit: 'points_management.points_offer.fixed',
      },
      {
        breadcrumbName: '彩蛋發放項詳情',
        path: '/integral-manage/give-fixed/detail/promotion',
        models: [Model],
        component: IntegralManageGiveFixedDetailPromotionCnf,
        permit: 'points_management.points_offer.fixed',
      },
    ],
  },
  {
    breadcrumbName: '積分發放',
    path: '/integral-manage/give-hand/detail',
    model: Model,
    component: IntegralManageGiveHandDetail,
    permit: 'points_management.points_offer.manual',
    // routes: [
    //   {
    //     breadcrumbName: '手動發放項配置',
    //     path: '/integral-manage/give-hand/detail',
    //     models: [Model],
    //     component: IntegralManageGiveHandDetail,
    //     permit: 'points_management.points_offer.manual_index'
    //   }
    // ]
  },
];
