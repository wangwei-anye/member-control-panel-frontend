import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  fetchBudgetList,
  fetchLogListRequest,
  fetchBudgetDetailRequest,
} from 'services/finance/budget/budget';
import { DEFAULT_PAGE_SIZE } from 'constants';
import eventEmmiter from 'utils/events';

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
  namespace: 'financeBudget',
  state: immutableState,
  effects: {
    *getBudgetList({ payload }, { put }) {
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
      } = yield fetchBudgetList(payload);
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

    *getBudgetDetail({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchBudgetDetailRequest(payload);
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
        if (pathname === '/finance/budget') {
          dispatch({
            type: 'getBudgetList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
        }
        if (pathname === '/finance/budget/detail') {
          dispatch({
            type: 'getBudgetDetail',
            payload: {
              id: query.id,
            },
          });
          dispatch({
            type: 'getLogList',
            payload: {
              id: query.id,
              type: 1,
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
