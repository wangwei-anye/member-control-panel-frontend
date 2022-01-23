import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { getIndexData } from 'services/statistics/index';
import moment from 'moment';

const dataList = [];
/* eslint-disable */
for (let i = 0; i < 10; i++) {
  const random = Math.ceil(Math.random() * (100000 - 1000)) + 1000;
  dataList.push(random);
}
const immutableState = Immutable.fromJS({
  indexDataInfo: {}
});

export default {
  namespace: 'integralDistribute',

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
      });
    }
  },

  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    }
  }
};
