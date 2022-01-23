import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  fetchBudgetList,
  fetchLogListRequest,
  fetchDetailRequest,
  download,
  checkResult,
} from 'services/finance/hand/hand';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  listInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  isCheckSuccess: true,
  detailInfo: {},
  logList: [],
});
export default {
  namespace: 'financeHand',
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
    *getDetail({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchDetailRequest(payload);
      let isCheckSuccess = true;
      if (data.status === 1 && data.type == 2 && !data.send_result.success) {
        isCheckSuccess = false;
      }
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            isCheckSuccess,
            detailInfo: data,
          },
        });
      }
    },
    *getDetailAsync({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield checkResult(payload);
      let isCheckSuccess = true;
      if (data.status === 1 && data.type == 2 && !data.send_result.success) {
        isCheckSuccess = false;
      }
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            isCheckSuccess,
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
    *download({ payload }) {
      const data = yield download(payload);
      return data;
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/finance/hand') {
          dispatch({
            type: 'getList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
        }
        if (pathname === '/finance/hand/detail') {
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
              type: 2,
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
