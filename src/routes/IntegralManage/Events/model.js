import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { fetchEventListRequest } from 'services/integralManage/event/event';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  eventListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
});

export default {
  namespace: 'integralManageEvent',

  state: immutableState,

  effects: {
    // 查询列表
    *getEventList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          eventListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchEventListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            eventListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            eventListInfo: {
              total: 0,
              list: [],
              loading: false,
            },
          },
        });
      }
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/integral-manage/events') {
          dispatch({
            type: 'getEventList',
            payload: {
              ...query,
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
