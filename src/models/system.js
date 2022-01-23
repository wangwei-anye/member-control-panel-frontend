import Immutable from 'immutable';
import pathToRegexp from 'path-to-regexp';
import { parseSearch } from 'utils/tools';
import eventEmmiter from 'utils/events';

const immutableState = Immutable.fromJS({
  pathname: '/', // 当前页面pathname
  query: {}, // 当前页面url查询参数
  routes: [], // 当前页面路由信息
  params: {}, // 当前路由params
  pageLoading: false, // 页面是否正在加载
  partmentList: [], // 部门list
  reportChannelList: [], // 上报渠道list
  reportChannelJson: {}, // 上报渠道list转化成json格式
  menuCollapsed: true, // 侧边栏是否折叠
});

export default {
  namespace: 'system',

  state: immutableState,

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        dispatch({
          type: 'save',
          payload: {
            pathname,
            query,
          },
        });
      });
    },
    keyupEvent() {
      window.addEventListener('keyup', (e) => {
        const { keyCode } = e;
        // 如果是 页面跳转  就不要触发搜索
        if (
          e.path[1].getAttribute('class') ===
          'ant-pagination-options-quick-jumper'
        ) {
          return;
        }
        // NOTE: 13 === enter key
        if (keyCode === 13) {
          eventEmmiter.emit('keyup');
        }
      });
    },
  },

  reducers: {
    // 更新路由信息
    updateRoutes(state, action) {
      const pathname = state.get('pathname');
      const current = action.payload[action.payload.length - 1];
      const keys = [];
      const match = pathToRegexp(current.path, keys).exec(pathname);
      const params = {};
      keys.forEach((key, i) => {
        params[key.name] = match[i + 1];
      });
      // 处理path中的params
      const routes = action.payload.map((it) => {
        let { path } = it;
        Object.keys(params).forEach((key) => {
          path = path.replace(`:${key}`, params[key]);
        });
        return { ...it, path };
      });
      return state.merge({ routes, params });
    },

    // 更新页面加载状态
    updatePageLoading(state, action) {
      return state.merge({ pageLoading: action.payload });
    },

    save(state, action) {
      return state.merge(action.payload);
    },
  },
};
