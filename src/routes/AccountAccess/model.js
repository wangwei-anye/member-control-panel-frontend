import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  getAccount,
  createAccount,
  accountDetail,
  queryDepartment,
} from 'services/role/account';
import { getRolesAll, getRights } from 'services/role/role';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  accountListInfo: {
    list: [],
    total: 0,
    loading: false,
  }, // 用户列表,
  departmentListInfo: {
    list: [],
    total: 0,
    loading: false,
  }, // 用户列表,
  detail: {}, // 用户详情
  roles: [], // 角色列表
  rights: {}, // 权限列表
});

export default {
  namespace: 'account',

  state: immutableState,

  effects: {
    // 查询用户列表
    *getAccount({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          accountListInfo: {
            list: [],
            total: 0,
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getAccount(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            accountListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            accountListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    // 查询用户詳情
    *getAccountDetail({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          detail: {},
        },
      });
      const {
        data: { data, status },
      } = yield accountDetail(payload);
      if (status && data) {
        data.group_ids = data.group_ids ? data.group_ids.split(',') : [];
        data.telephone = data.telephone ? data.telephone : '';
        const phoneArr = data.telephone.split(' ');
        if (phoneArr.length > 1) {
          data.areaCode = phoneArr[0];
          data.phone = phoneArr[1];
        } else {
          data.areaCode = '';
          data.phone = data.telephone;
        }
        yield put({
          type: 'save',
          payload: {
            detail: { ...data },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            detail: {},
          },
        });
      }
    },
    // 查询部門列表
    *getDepartment({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          departmentListInfo: {
            list: [],
            total: 0,
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield queryDepartment(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            departmentListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            departmentListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    // 查询角色列表
    *getRoles({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield getRolesAll();
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            roles: data.list,
          },
        });
      }
    },
    // 查询角色权限列表
    *getRights({ payload }, { put }) {
      const { data } = yield getRights(payload);
      if (data) {
        yield put({
          type: 'save',
          payload: {
            rights: data.data,
          },
        });
      }
    },
    // 添加编辑
    *addAccount({ payload, history, message }, { put }) {
      const { data } = yield createAccount(payload);
      if (data.status) {
        history.push('/account');
      }
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        // 进入用户列表页
        if (
          pathname === '/account' ||
          pathname === '/account/add' ||
          pathname === '/account/edit'
        ) {
          dispatch({ type: 'getRoles' });
          dispatch({ type: 'getRights' });
          dispatch({
            type: 'getAccount',
            payload: {
              ...query,
              page: query.page || 1,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        // 进入部門列表页
        if (pathname === '/department') {
          dispatch({ type: 'getRoles' });
          dispatch({
            type: 'getDepartment',
            payload: {
              ...query,
              page: query.page || 1,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
      });
    },
  },

  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    },
  },
};
