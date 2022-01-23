import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  fetchChangeListRequest,
  fetchUserListRequest,
  fetchConsumListRequest,
  fetchPointDetailSearchConfigRequest,
} from 'services/finance/integral-detail/detail';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  changeListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  userListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  consumListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  searchConfig: {},
});
export default {
  namespace: 'financeDetail',
  state: immutableState,
  effects: {
    *getChangeList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          changeListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchChangeListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            changeListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            changeListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getUserList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          userListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchUserListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            userListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            userListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getConsumList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          consumListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchConsumListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            consumListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            consumListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    *getSearchConfig({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchPointDetailSearchConfigRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            searchConfig: data,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            searchConfig: {},
          },
        });
      }
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/finance/integral-detail/change') {
          dispatch({
            type: 'getChangeList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
          dispatch({
            type: 'getSearchConfig',
            payload: { type: 1 },
          });
        }
        if (pathname === '/finance/integral-detail/user') {
          dispatch({
            type: 'getUserList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
          dispatch({
            type: 'getSearchConfig',
            payload: { type: 2 },
          });
        }
        if (pathname === '/finance/integral-detail/consum') {
          dispatch({
            type: 'getConsumList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
          dispatch({
            type: 'getSearchConfig',
            payload: { type: 3 },
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
