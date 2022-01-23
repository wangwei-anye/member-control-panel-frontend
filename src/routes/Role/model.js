import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  getRoles,
  getRights,
  createRole,
  updateRole,
  getAccount,
  getAccountByDepart,
} from 'services/role/role';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  roleListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
  accountListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  accountSelectListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  rights: {}, // 权限列表
  detail: {},
});

export default {
  namespace: 'role',

  state: immutableState,

  effects: {
    // 查询角色列表
    *getRoles({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          roleListInfo: {
            list: [],
            total: 0,
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getRoles(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            roleListInfo: {
              ...data,
              loading: false,
            },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            roleListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
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
    // 查询用户列表
    *getAccountSelect({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          accountSelectListInfo: {
            list: [],
            total: 0,
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getAccountByDepart(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            accountSelectListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            accountSelectListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    *getRoleDetail({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          detail: {},
        },
      });
      const {
        data: { data, status },
      } = yield getRoles(payload);
      if (status && data) {
        const rightList = data.list;
        let rightDetail = {};
        if (rightList) {
          if (rightList.length === 1) {
            rightDetail = rightList[0];
          } else {
            const filterList = rightList.filter(
              (item) => +item.id === +payload.id
            );
            rightDetail = filterList.length ? filterList[0] : {};
          }
        }
        yield put({
          type: 'save',
          payload: {
            detail: rightDetail,
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
    // 添加角色
    *addRole({ payload, history, message }, { put }) {
      const { data } = payload.id
        ? yield updateRole(payload)
        : yield createRole(payload);
      if (data && data.status) {
        message.success(data.message);
        setTimeout(() => {
          message.destroy();
          history.push('/role');
        }, 100);
      }
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        // 进入角色列表页
        if (
          pathname === '/role' ||
          pathname === '/role/add' ||
          pathname === '/role/edit'
        ) {
          dispatch({
            type: 'getRoles',
            payload: {
              ...query,
              page: query.page || 1,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
          dispatch({ type: 'getRights' });
        }
        if (pathname === '/role/edit') {
          dispatch({
            type: 'getRoleDetail',
            payload: {
              ...query,
              page: query.page || 1,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        if (pathname === '/role/accountList') {
          if (query.group_id) {
            dispatch({
              type: 'getAccount',
              payload: {
                ...query,
                page: query.page || 1,
                limit: query.pageSize || DEFAULT_PAGE_SIZE,
              },
            });
          }
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
