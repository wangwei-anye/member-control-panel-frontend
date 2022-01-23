import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { fetchDivisionListRequest } from 'services/integralDivision/division';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  activityListInfo: {
    total: 0,
    list: []
  }
});

export default {
  namespace: 'integralDivision',

  state: immutableState,

  effects: {
    *getActivityList({ payload }, { put }) {
      const {
        data: { data, status }
      } = yield fetchDivisionListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            activityListInfo: data
          }
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            activityListInfo: {
              list: [],
              total: 0
            }
          }
        });
      }
    }
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/integral-division/activity') {
          dispatch({
            type: 'getActivityList',
            payload: {
              ...query,
              limit: query.pageSize || DEFAULT_PAGE_SIZE
            }
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
