const TrendPage = require('./trend');
const FigurePage = require('./figure');
const Model = require('./model');

export default [
  {
    breadcrumbName: '會員分析',
    model: Model,
    path: '/member_analysis',
    component: TrendPage,
    permit: 'member_analysis',
    routes: [
      {
        breadcrumbName: '會員趨勢',
        path: '/member_analysis/trend',
        model: [Model],
        component: TrendPage,
        permit: 'member_analysis.member_trend',
      },
      {
        breadcrumbName: '會員畫像',
        path: '/member_analysis/figure',
        model: [Model],
        component: FigurePage,
        permit: 'member_analysis.member_portrait.portrait',
      },
    ],
  },
];
