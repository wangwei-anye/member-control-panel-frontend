const QrCodeConfigurationPage = import('./QrCodeConfigurationPage');
const QrCodeListPage = import('./QrCodeListPage');
const QrCodeDataRecordPage = import('./QrCodeDataRecordPage');
const Model = import('./model'); // 导入model
export default [
  {
    breadcrumbName: 'QR Code管理',
    path: '/qr_code/list',
    model: Model,
    component: QrCodeListPage,
    permit: 'operation_manage.qr_code.get_offer_entry_list',
    routes: [
      {
        breadcrumbName: '編輯發放配置',
        path: '/qr_code/config',
        models: [Model],
        component: QrCodeConfigurationPage,
        permit: 'operation_manage.qr_code.add_entry'
      },
      {
        breadcrumbName: '領取記錄',
        path: '/qr_code/record',
        models: [Model],
        component: QrCodeDataRecordPage,
        permit: 'operation_manage.qr_code.account_list',
      }
    ]
  },
];
