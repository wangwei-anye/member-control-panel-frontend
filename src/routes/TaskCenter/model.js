import { fromJS } from 'immutable';
import { parseSearch } from 'utils/tools';
import { DEFAULT_PAGE_SIZE } from 'constants';
import {
  fetchList,
  fetchTaskList,
  changeStatus,
  download,
  previewExcelList,
} from 'services/taskCenter';

const initState = {
  indexList: {
    list: [],
    total: 0,
    loading: false,
  },
  taskList: {
    list: [],
    total: 0,
    loading: false,
  },
};
const immutableState = fromJS(initState);
export default {
  namespace: 'taskCenter',
  state: immutableState,
  effects: {
    *fetchList({ payload }, { put }) {
      yield put({
        type: 'saveList',
        payload: {
          indexList: {
            loading: true,
          },
        },
      });
      const res = yield fetchList(payload);
      const data = res.data;
      const list = data.status ? data.data.data : [];
      const total = data.status ? data.data.total : [];
      yield put({
        type: 'saveList',
        payload: {
          indexList: { list, total, loading: false },
        },
      });
      return res;
    },
    *fetchTaskList({ payload }, { put }) {
      yield put({
        type: 'saveList',
        payload: {
          taskList: {
            loading: true,
          },
        },
      });
      const res = yield fetchTaskList(payload);
      const data = res.data;
      const list = data.status ? data.data.data : [];
      const total = data.status ? data.data.total : [];
      yield put({
        type: 'saveList',
        payload: {
          taskList: { list, total, loading: false },
        },
      });
      return res;
    },
    *changeStatus({ payload }, { put }) {
      const data = yield changeStatus(payload);
      return data;
    },
    *download({ payload }) {
      const data = yield download(payload);
      return data;
    },
    *previewList({ payload }) {
      const res = yield previewExcelList(payload);
      return res;
    },
  },
  reducers: {
    saveList: (state, { payload }) => {
      return state.merge({ ...payload });
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        const { pageSize, ...rest } = query;
        if (pathname === '/task-center/list') {
          dispatch({
            type: 'fetchList',
            payload: {
              ...rest,
              limit: pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        if (pathname === '/task-center/taskList') {
          dispatch({
            type: 'fetchTaskList',
            payload: {
              ...rest,
              limit: pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
      });
    },
  },
};
