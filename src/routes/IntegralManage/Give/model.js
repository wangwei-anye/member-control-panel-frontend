import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  fetchHandListRequest,
  fetchCustomListRequest,
  fetchFixedDetailListRequest,
  fetchFixedListRequest,
} from 'services/integralManage/give/give';
import { DEFAULT_PAGE_SIZE } from 'constants';
import { entryFixedType2Json } from './Fixed/constants';

const immutableState = Immutable.fromJS({
  fixedListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
  fixedGroupInfoDetail: {}, // 详情
  fixedGroupChannelListInfo: {
    list: [],
    total: 0,
  }, // 分渠道設置 list
  handListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
  customListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
});

export default {
  namespace: 'integralManageGive',

  state: immutableState,

  effects: {
    // 查询手动发放列表
    *getHandList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          handListInfo: { loading: true },
        },
      });
      const {
        data: { data, status },
      } = yield fetchHandListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            handListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            handListInfo: { total: 0, list: [], loading: false },
          },
        });
      }
    },
    // 查询自定义发放列表
    *getCustomList({ payload }, { put }) {
      const normalizeCustomListInfo = (list) => {
        if (!list || list.length === 0) {
          return;
        }
        for (let i = 0; i < list.length; i += 1) {
          const item = list[i];
          // eslint-disable-next-line prefer-const
          let { offer_account_status, account_name } = item;
          if (offer_account_status === 2) {
            item.account_name = `${account_name} (已凍結)`;
          }
        }
        return list;
      };
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
        data.list = normalizeCustomListInfo(data.list);
        yield put({
          type: 'save',
          payload: {
            customListInfo: { ...data, loading: false },
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
    // 查询固定发放列表
    *getFixedList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          fixedListInfo: { total: 0, list: [], loading: true },
        },
      });
      const {
        data: { data, status },
      } = yield fetchFixedListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            fixedListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            fixedListInfo: { total: 0, list: [], loading: false },
          },
        });
      }
    },
    // 查询固定发放详情
    *getFixedGroupChannelList({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchFixedDetailListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            fixedGroupChannelListInfo: data,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            fixedGroupChannelListInfo: { total: 0, list: [] },
          },
        });
      }
    },
    *getFixedGroupDetail({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchFixedListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            fixedGroupInfoDetail: data.list[0],
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            fixedGroupInfoDetail: { total: 0, list: [] },
          },
        });
      }
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        // 手动发放list
        if (pathname === '/integral-manage/give-hand') {
          dispatch({
            type: 'getHandList',
            payload: {
              ...query,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        // 自定义发放list
        if (pathname === '/integral-manage/give-custom') {
          dispatch({
            type: 'getCustomList',
            payload: {
              ...query,
              entry_type: 1,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        // 固定发放list
        if (pathname === '/integral-manage/give-fixed') {
          dispatch({
            type: 'getFixedList',
            payload: {
              ...query,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        // 固定发放详情  接口和自定义list接口一致，只是参数不同
        if (pathname === '/integral-manage/give-fixed/detail') {
          if (query.type) {
            delete query.type;
          }
          const tempEntry_type =
            entryFixedType2Json[query.entry_fixed_type] === 'promotion' ? 1 : 2;
          if (query.entry_fixed_type) {
            delete query.entry_fixed_type;
          }
          dispatch({
            type: 'getFixedGroupChannelList',
            payload: {
              ...query,
              entry_type: tempEntry_type,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
          dispatch({
            type: 'getFixedGroupDetail',
            payload: {
              id: query.group_id,
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
