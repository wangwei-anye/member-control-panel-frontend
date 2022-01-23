// app对应的key
export const APP_TO_JSON = {
  1: '香港01 APP',
  2: 'e肚仔 APP',
};
export const COUPON_STATUS = {
  0: '未使用',
  1: '已使用',
};
export const USRE_TYPE = {
  1: '註冊賬戶',
};
export const INTEGRAL_MANAGE_ACCOUNT_TABLIST = [
  {
    name: '會員積分賬戶',
    url: '/integral-manage/account/member',
    key: 'member',
    permit: ['points_management', 'points_account', 'balance_account'],
  },
  {
    name: '運營積分賬戶',
    url: '/integral-manage/account/operation',
    key: 'operation',
    permit: ['points_management', 'points_account', 'index'],
  },
  {
    name: '商家積分賬戶',
    url: '/integral-manage/account/merchant',
    key: 'merchant',
    permit: ['points_management', 'points_account', 'balance'],
  },
];

export const MEMBER_DETAIL_TABLIST = [
  {
    name: '個人檔案',
    url: '/member/detail-record',
    key: 'record',
  },
  {
    name: '會員分析',
    url: '/member/detail-analysis',
    key: 'analysis',
  },
  // {
  //   name: '會員行爲',
  //   url: '/member/detail-action',
  //   key: 'action',
  // },
  {
    name: '積分明細',
    url: '/member/detail-integral',
    key: 'integral',
  },
  // {
  //   name: '優惠券明細',
  //   url: '/member/detail-coupon',
  //   key: 'coupon',
  // },
  {
    name: '更改日誌',
    url: '/member/detail-log',
    key: 'log',
  },
];
export const INTEGRAL_GIVE_TABLIST = [
  {
    name: '自定義觸發項',
    url: '/integral-manage/give-custom',
    key: 'custom',
  },
  {
    name: '固定觸發項',
    url: '/integral-manage/give-fixed',
    key: 'fixed',
  },
  {
    name: '手動發放',
    url: '/integral-manage/give-hand/detail',
    key: 'hand',
  },
];
export const status2Json = {
  1: {
    name: '發放中',
    className: 'status-give',
  },
  2: {
    name: '審批中',
    className: 'status-approve',
  },
  3: {
    name: '已駁回',
    className: 'status-reject',
  },
  4: {
    name: '已停發',
    className: 'status-stop',
  },
  5: {
    name: '即將開始',
    className: 'status-soon',
  },
  6: {
    name: '已失效',
    className: 'status-lose',
  },
  7: {
    name: '未完成',
    className: 'status-undone',
  },
};
export const capTopTypeJsonList = [
  {
    value: 'day',
    name: '每天',
  },
  {
    value: 'weekly',
    name: '每週',
  },
  {
    value: 'monthly',
    name: '每月',
  },
  {
    value: 'quarterly',
    name: '每季度',
  },
  {
    value: 'yearly',
    name: '每年',
  },
  {
    value: 'forever',
    name: '整個會員生命週期',
  },
  {
    value: 'no_top',
    name: '不封頂',
  },
];

export const capTopTypeJsonListForQrcode = [
  {
    value: 'day',
    name: '每天',
  },
  {
    value: 'weekly',
    name: '每週',
  },
  {
    value: 'monthly',
    name: '每月',
  },
  {
    value: 'forever',
    name: '整個會員生命週期',
  },
];

export const dimenssion2Json = {
  day: '每天',
  weekly: '每週',
  week: '每週',
  quarterly: '每季度',
  monthly: '每月',
  month: '每月',
  yearly: '每年',
  year: '每年',
  forever: '整個會員生命週期',
};
