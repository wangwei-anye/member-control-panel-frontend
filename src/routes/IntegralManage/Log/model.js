import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { fetchLogListRequset } from 'services/integralManage/log/log';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  listInfo: {
    list: [],
    total: 0,
    loading: false
  }
});
export default {
  namespace: 'integralManageLog',
  state: immutableState,
  effects: {
    *getLogList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          listInfo: {
            loading: true
          }
        }
      });
      const {
        data: { data, status }
      } = yield fetchLogListRequset(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            listInfo: { ...data, loading: false }
          }
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            listInfo: {
              total: 0,
              list: [],
              loading: false
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
        if (pathname === '/integral-manage/log') {
          dispatch({
            type: 'getLogList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query
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
