import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { getIndexData } from 'services/statistics/index';

const immutableState = Immutable.fromJS({
  indexDataInfo: {} // 用户列表,
});

export default {
  namespace: 'statistics',

  state: immutableState,

  effects: {
    *getIndexData({ payload }, { put }) {
      const {
        data: { data, status }
      } = yield getIndexData(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            indexDataInfo: data
          }
        });
      }
    }
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/') {
          dispatch({
            type: 'getIndexData',
            payload: {}
          });
        }
      });
    }
  },

  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    }
  }
};
