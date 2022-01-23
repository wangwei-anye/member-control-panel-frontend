import { message } from 'antd';
import { convertJsonToKeys } from './permissionTree';

/**
 * 路由授权函数
 * @param route {Object} 路由信息
 * @param app   {Object} dva app
 */
export const routeGrantor = (route, app) => {
  const { auth } = app._store.getState();
  if (!auth.get('authorized')) {
    // 如果未登录，则引导登录
    const returnUrl = window.location.href;
    app._history.push('/login?returnUrl=' + encodeURIComponent(returnUrl));
    return false;
  }
  // 外连 全授权 签名认证
  if (
    auth.getIn(['outLinkAuth', 'signature']) &&
    !auth.getIn(['outLinkAuth', 'authorized'])
  ) {
    message.error(auth.getIn(['outLinkAuth', 'message']), 2, () => {
      sessionStorage.removeItem('MCP_01_RETURN_URL');
      app._history.push('/logout');
    });
    return false;
  }
  if (route.permit) {
    const permits = convertJsonToKeys(auth.get('permissions').toJS());
    if (!permits.some((it) => it === route.permit)) {
      if (!permits.some((it) => it === 'app_info.index')) {
        message.error('無權訪問，即將跳轉至看板', 2, () => {
          app._history.replace('/home');
        });
      } else {
        message.error('無權訪問，即將跳轉至應用概況', 2, () => {
          app._history.replace('/');
        });
      }

      return false;
    }
  }
  return true;
};
