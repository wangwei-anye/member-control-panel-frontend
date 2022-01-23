import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { fetchApproveList } from 'services/integralManage/approve/approve';
import { DEFAULT_PAGE_SIZE } from 'constants';
import eventEmmiter from 'utils/events';

const immutableState = Immutable.fromJS({
  apporveListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
});
export default {
  namespace: 'integralManageApprove',
  state: immutableState,
  effects: {
    *getApproveList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          apporveListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchApproveList(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            apporveListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            apporveListInfo: {
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
        if (pathname === '/integral-manage/approve') {
          dispatch({
            type: 'getApproveList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
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
