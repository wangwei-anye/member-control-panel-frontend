import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { DEFAULT_PAGE_SIZE } from 'constants';
import {
  getListRequest,
  bitchPublishOrCancelRequest,
} from 'services/infinite/infinite';

const immutableState = Immutable.fromJS({
  recommedInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  areaInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  rewardInfo: {
    list: [],
    total: 0,
    loading: false,
  },
});
export default {
  namespace: 'infinite',
  state: immutableState,
  effects: {
    *fetchRecommedList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          recommedInfo: { loading: true },
        },
      });
      const { data } = yield getListRequest(payload);
      yield put({
        type: 'save',
        payload: {
          recommedInfo: data.status
            ? { ...data.data, loading: false }
            : { list: [], total: 0, loading: false },
        },
      });
    },

    *getAreaList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          areaInfo: { loading: true },
        },
      });
      const { data } = yield getListRequest(payload);
      yield put({
        type: 'save',
        payload: {
          areaInfo: data.status
            ? { ...data.data, loading: false }
            : { list: [], total: 0, loading: false },
        },
      });
    },

    *getRewardList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          rewardInfo: { loading: true },
        },
      });
      const { data } = yield getListRequest(payload);
      yield put({
        type: 'save',
        payload: {
          rewardInfo: data.status
            ? { ...data.data, loading: false }
            : { list: [], total: 0, loading: false },
        },
      });
    },
    *bitchPublishOrCancelRequest({ payload }, { put }) {
      const data = yield bitchPublishOrCancelRequest(payload);
      return data;
    },
  },
  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/01-infinite/recommend') {
          dispatch({
            type: 'fetchRecommedList',
            payload: {
              ...query,
              port_key: 'shopping_mall_activity',
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        if (pathname === '/01-infinite/area') {
          dispatch({
            type: 'getAreaList',
            payload: {
              ...query,
              port_key: 'member_points_earn',
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        if (pathname === '/01-infinite/reward') {
          dispatch({
            type: 'getRewardList',
            payload: {
              ...query,
              port_key: 'shopping_reward_activity',
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
