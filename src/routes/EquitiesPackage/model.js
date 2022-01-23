import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { DEFAULT_PAGE_SIZE } from 'constants';
import {
  getHistoryList,
  getList,
  getDetail,
  download,
} from 'services/equitiesPackage';

// import { message } from 'antd';

const immutableState = Immutable.fromJS({
  listInfo: { list: [], total: 0, loading: false },
  historyListInfo: { list: [], total: 0, loading: false },
});

export default {
  namespace: 'equitiesPackage',

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
      } = yield getList({ ...payload });
      if (status && data) {
        yield put({
          type: 'save',
          payload: { listInfo: { ...data, loading: false } },
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
    *getHistoryList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          historyListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getHistoryList({ ...payload });
      if (status && data) {
        yield put({
          type: 'save',
          payload: { historyListInfo: { ...data, loading: false } },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            historyListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    *download({ payload }) {
      const data = yield download(payload);
      return data;
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/equities_package/list') {
          dispatch({
            type: 'getList',
            payload: {
              ...query,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              page: query.page || 1,
            },
          });
        }
        if (pathname.substr(0, 24) === '/equities_package/detail') {
          const id = pathname.substr(25);
          if (id) {
            dispatch({
              type: 'getHistoryList',
              payload: {
                offer_package_id: id,
                limit: query.pageSize || DEFAULT_PAGE_SIZE,
                page: query.page || 1,
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
