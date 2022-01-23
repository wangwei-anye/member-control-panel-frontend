import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import { DEFAULT_PAGE_SIZE } from 'constants';
import { fetchList, getQrcodeAccountList } from 'services/qrcode';
import { message } from 'antd';

const immutableState = Immutable.fromJS({
  listInfo: { list: [], total: 0, loading: false },
  groupId: null,
  accountRecord: {
    total_record: 0,
    total_amount: 0,
    transaction_count: 0,
    list: [],
  },
  fetchQrcodeAccountListFlag: false,
});

export default {
  namespace: 'qrcode',

  state: immutableState,

  effects: {
    *getOfferEntryList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          listInfo: {
            loading: true,
          },
        },
      });
      // NOTE: 这里的 entry_type 写死为 2
      const {
        data: { data, status },
      } = yield fetchList({ ...payload, entry_type: 2 });
      if (status && data) {
        yield put({
          type: 'save',
          payload: { listInfo: { ...data, loading: false } },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            listInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *fetchQrcodeAccountList({ payload }, { put }) {
      const genPayload = (flag) => {
        return {
          type: 'save',
          payload: {
            fetchQrcodeAccountListFlag: flag,
          },
        };
      };

      const resetPayload = () => {
        return {
          type: 'save',
          payload: {
            accountRecord: {
              total_record: 0,
              total_amount: 0,
              transaction_count: 0,
              list: [],
            },
          },
        };
      };
      yield put(genPayload(true));
      try {
        const {
          data: { data, status },
        } = yield getQrcodeAccountList(payload);
        if (status && data) {
          yield put({ type: 'save', payload: { accountRecord: data } });
        } else {
          yield put(resetPayload());
        }
      } catch (error) {
        message.error('服務異常');
      } finally {
        yield put(genPayload(false));
      }
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        // 手动发放list
        if (pathname === '/qr_code/record') {
          dispatch({
            type: 'fetchQrcodeAccountList',
            payload: {
              ...query,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              page: query.page || 1,
            },
          });
        } else if (pathname === '/qr_code/list') {
          dispatch({
            type: 'getOfferEntryList',
            payload: {
              ...query,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              page: query.page || 1,
              group_id: 2,
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
