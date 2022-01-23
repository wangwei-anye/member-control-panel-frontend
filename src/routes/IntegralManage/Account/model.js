import Immutable from 'immutable';
import { parseSearch, isUserHasRights } from 'utils/tools';
import {
  fetchBusinessAccountList,
  getAccountBalanceList,
  fetchAccoutDetail,
  fetchAccoutPointsDetail,
  fetchAccoutCcConcats,
  fetchAccountNoticeEmails,
  fetchBalanceExpired,
  getMemberBalanceList,
} from 'services/integralManage/account/account';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  memberListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
  memberListInfoLoading: true,
  opearationListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
  merchantListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
  accountInfo: {},
  linkArr: [],
  pointsListInfo: {
    total: 0,
    list: [],
    loading: false,
  },
  expiredData: {
    total_account: -1,
    total_expired_points: 0,
  },
});

export default {
  namespace: 'integralManageAccount',

  state: immutableState,

  effects: {
    // 查询运营账户列表
    *getBusinessAccountList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          opearationListInfo: {
            list: [],
            total: 0,
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchBusinessAccountList(payload);
      if (status && data) {
        data.list.map((item) => {
          if (item.sub_accounts && item.sub_accounts.length > 0) {
            item.children = item.sub_accounts;
            // 父節點  child_apply 權限  拷貝到子節點
            item.children.map((childItem) => {
              if (item.permission.includes('child_apply')) {
                childItem.permission.push('child_apply');
              }
              childItem.parent_id = item.id;
              childItem.parent_account_name = item.account_name;
              childItem.parent_union_id = item.union_id;
              childItem.permission.splice(
                childItem.permission.findIndex(
                  (subItem) => subItem === 'apply'
                ),
                1
              );
            });
          }
          // 刪除父節點  child_apply 權限
          item.permission.splice(
            item.permission.findIndex((subItem) => subItem === 'child_apply'),
            1
          );
          delete item.sub_accounts;
          return item;
        });
        yield put({
          type: 'save',
          payload: {
            opearationListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            opearationListInfo: {
              list: [],
              total: 0,
              loading: true,
            },
          },
        });
      }
    },
    *getMemberAccountList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          memberListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getMemberBalanceList(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            memberListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            memberListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    *getMerchantAccountList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          merchantListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getAccountBalanceList(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            merchantListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            merchantListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    *getAccoutDetail({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchAccoutDetail(payload.id);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            accountInfo: data,
            linkArr: data.cc || [],
          },
        });
      }
    },
    *getAccoutCcContacts({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchAccoutCcConcats(payload.id);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            linkArr: data,
          },
        });
      }
    },
    // 查询运营账户列表
    *getAccoutPointsDetail({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          pointsListInfo: {
            list: [],
            total: 0,
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchAccoutPointsDetail(payload.union_id);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            pointsListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            pointsListInfo: {
              list: [],
              total: 0,
              loading: true,
            },
          },
        });
      }
    },
    *getAccountNoticeEmails({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchAccountNoticeEmails();
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            linkArr: data,
          },
        });
      }
    },
    *fetchBalanceExpired({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchBalanceExpired(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            expiredData: data,
          },
        });
      }
    },
    *clearBalanceExpired({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          expiredData: {
            total_account: -1,
            total_expired_points: 0,
          },
        },
      });
    },
    *clearAccoutDetail({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          accountInfo: {},
        },
      });
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        if (pathname === '/integral-manage/account/operation') {
          const isHasLoadRight = isUserHasRights([
            'points_management',
            'points_account',
            'index',
          ]);
          const isHasEditCcRight = isUserHasRights([
            'points_management',
            'points_account',
            'update_balance_cc_emails',
          ]);
          if (isHasLoadRight) {
            dispatch({
              type: 'getBusinessAccountList',
              payload: {
                ...query,
                limit: query.pageSize || DEFAULT_PAGE_SIZE,
              },
            });
          }
          if (isHasEditCcRight) {
            dispatch({
              type: 'getAccountNoticeEmails',
              payload: {},
            });
          }
        }
        if (pathname === '/integral-manage/account/member') {
          const isHasLoadRight = isUserHasRights([
            'points_management',
            'points_account',
            'balance_account',
          ]);
          if (isHasLoadRight) {
            dispatch({
              type: 'getMemberAccountList',
              payload: {
                ...query,
                type: 1,
                limit: query.pageSize || DEFAULT_PAGE_SIZE,
              },
            });
          }
        }
        if (pathname === '/integral-manage/account/merchant') {
          const isHasLoadRight = isUserHasRights([
            'points_management',
            'points_account',
            'balance',
          ]);
          if (isHasLoadRight) {
            dispatch({
              type: 'getMerchantAccountList',
              payload: {
                ...query,
                type: 2,
                limit: query.pageSize || DEFAULT_PAGE_SIZE,
              },
            });
          }
        }
        if (pathname === '/integral-manage/account/operationDetail') {
          if (query.id) {
            dispatch({
              type: 'getAccoutDetail',
              payload: {
                id: query.id,
              },
            });
          } else {
            dispatch({
              type: 'getAccoutCcContacts',
              payload: {},
            });
          }
          if (query.union_id) {
            dispatch({
              type: 'getAccoutPointsDetail',
              payload: {
                union_id: query.union_id,
              },
            });
          }
        }
        if (pathname === '/integral-manage/account/integralExpired') {
          if (query.start_time) {
            dispatch({
              type: 'fetchBalanceExpired',
              payload: {
                ...query,
              },
            });
          }
        }
      });
    },
  },

  reducers: {
    save(state, action) {
      return state.merge(action.payload);
    },
    blockAccount(state, action) {
      const index = action.payload.index;
      const status = action.payload.status;
      return state.setIn(['opearationInfo', 'list', index, 'status'], status);
    },
  },
};
