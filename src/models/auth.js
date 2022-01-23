import Immutable from 'immutable';
import { parseSearch, genSignature } from 'utils/tools';
import { getLoginInfo } from 'services/auth';
import {
  saveUserSession,
  getUserSession,
  saveLocalUser,
  getLocalUser,
} from 'utils/session';

const ONE_HOUR_S = 60 * 60; // 一个小时的秒数

const removeSessionStorage = () => {
  sessionStorage.removeItem('MCP_01_OUT_SIGNATURE');
  sessionStorage.removeItem('MCP_01_OUT_REQ_AT');
  sessionStorage.removeItem('MCP_01_OUT_APP_ID');
  sessionStorage.removeItem('MCP_01_OUT_OUT_SN');
};
const immutableState = Immutable.fromJS({
  authorized: false, // 是否已授权
  department: '',
  loginStatus: 'wait', // 登录状态：wait | fail | success
  permissions: {},
  loginFailMessage: '',
  // hk01认证签名 用于判断外连接过来授权校验
  outLinkAuth: {
    authorized: false,
    signature: '',
    message: '',
  },
});

export default {
  namespace: 'auth',

  state: immutableState,

  effects: {
    // 取得用户信息
    *login({ payload }, { put }) {
      const {
        data: { data, status, message: msg },
      } = yield getLoginInfo(payload);
      if (status) {
        yield put({
          type: 'saveUser',
          payload: {
            ...data,
            loginStatus: 'success',
            authorized: true,
            loginFailMessage: '',
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            loginStatus: 'fail',
            authorized: false,
            loginFailMessage: msg,
          },
        });
      }
    },
    // 尝试从session取得登录信息
    *getSession({ payload }, { put, select }) {
      const info = yield select((state) => state.auth.toJS());
      if (info.authorized) return;
      let session = getUserSession();
      if (!session) {
        session = getLocalUser();
      }
      if (session && session.authorized) {
        yield put({
          type: 'saveUser',
          payload: {
            ...session,
            loginStatus: 'success',
            authorized: true,
          },
        });
      }
    },
    *logout({ payload }, { put }) {
      yield put({
        type: 'saveUser',
        payload: {
          loginStatus: 'wait',
          authorized: false,
        },
      });
    },
    // hk01 外链授权认证签名
    *outLinkAuth({ payload }, { put, select }) {
      const search = parseSearch(window.location.search);
      if (
        (search.app_id || sessionStorage.getItem('MCP_01_OUT_APP_ID')) &&
        (search.out_sn || sessionStorage.getItem('MCP_01_OUT_OUT_SN')) &&
        (search.req_at || sessionStorage.getItem('MCP_01_OUT_REQ_AT')) &&
        (search.signature || sessionStorage.getItem('MCP_01_OUT_SIGNATURE'))
      ) {
        const info = yield select((state) => state.auth.toJS());
        const app_id =
          search.app_id || sessionStorage.getItem('MCP_01_OUT_APP_ID');
        const out_sn =
          search.out_sn || sessionStorage.getItem('MCP_01_OUT_OUT_SN');
        const req_at = parseInt(
          search.req_at || sessionStorage.getItem('MCP_01_OUT_REQ_AT'),
          10
        );
        const originSignature =
          search.signature || sessionStorage.getItem('MCP_01_OUT_SIGNATURE');
        const authSignature = genSignature(
          { app_id, out_sn, req_at },
          info.email
        );
        if (originSignature !== authSignature) {
          removeSessionStorage();
          yield put({
            type: 'saveUser',
            payload: {
              ...info,
              outLinkAuth: {
                signature: authSignature,
                authorized: false,
                message: '外部簽名認識失敗！',
              },
            },
          });
        } else if (Math.ceil(Date.now() / 1000) - req_at > ONE_HOUR_S) {
          removeSessionStorage();
          yield put({
            type: 'saveUser',
            payload: {
              ...info,
              outLinkAuth: {
                signature: authSignature,
                authorized: false,
                message: '外部簽名認證過期！',
              },
            },
          });
        } else {
          yield put({
            type: 'saveUser',
            payload: {
              ...info,
              outLinkAuth: { signature: authSignature, authorized: true },
            },
          });
        }
      }
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/auth') {
          dispatch({
            type: 'login',
            payload: {
              code: query.code,
            },
          });
        } else {
          dispatch({ type: 'getSession' });
          dispatch({ type: 'outLinkAuth' });
        }
      });
    },
  },

  reducers: {
    saveUser(state, action) {
      saveUserSession(action.payload);
      saveLocalUser(action.payload);
      return state.merge(action.payload);
    },
    save(state, action) {
      return state.merge(action.payload);
    },
  },
};
