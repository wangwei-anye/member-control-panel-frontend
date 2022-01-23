import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  fetchListRequest,
  fetchLogListRequest,
  fetchDetailRequest,
} from 'services/finance/release/release';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  listInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  detailInfo: {},
  logList: [],
});
export default {
  namespace: 'financeRelease',
  state: immutableState,
  effects: {
    *getList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          listInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            listInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            listInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getDetail({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchDetailRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            detailInfo: data,
          },
        });
      }
    },

    *getLogList({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchLogListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            logList: data.list,
          },
        });
      }
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/finance/release') {
          if (query.initiate_department === 'all') {
            delete query.initiate_department;
          }
          dispatch({
            type: 'getList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
        }
        if (pathname === '/finance/release/detail') {
          dispatch({
            type: 'getDetail',
            payload: {
              id: query.id,
            },
          });
          dispatch({
            type: 'getLogList',
            payload: {
              id: query.id,
              type: 3,
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
