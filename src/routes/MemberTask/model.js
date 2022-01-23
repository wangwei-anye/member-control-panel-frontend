import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { DEFAULT_PAGE_SIZE } from 'constants';
import { fetchCustomListRequest } from 'services/memberTask';
import eventEmmiter from 'utils/events';

const immutableState = Immutable.fromJS({
  customListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
});
export default {
  namespace: 'memberTask',
  state: immutableState,
  effects: {
    // 查询自定义发放列表
    *getCustomList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          customListInfo: { total: 0, list: [], loading: true },
        },
      });
      const {
        data: { data, status },
      } = yield fetchCustomListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            customListInfo: { ...data, loading: false, a: '111' },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            customListInfo: { total: 0, list: [], loading: false },
          },
        });
      }
    },
  },
  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        const { pageSize, ...rest } = query;
        // 自定义发放list
        if (pathname === '/member-task/list') {
          dispatch({
            type: 'getCustomList',
            payload: {
              ...query,
              entry_type: 1,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
      });
    },
    keyupEvent() {
      window.addEventListener('keyup', (e) => {
        const { keyCode } = e;
        // NOTE: 13 === enter key
        if (keyCode === 13) {
          eventEmmiter.emit('keyup');
        }
      });
    },
  },
};
