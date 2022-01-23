import Immutable from 'immutable';
import { parseSearch, isUserHasRights } from 'utils/tools';
import {
  fetchUserList,
  fetchUserRecord,
  fetchUserAction,
  fetchUserIntegral,
  fetchUserCoupon,
  fetchUserLog,
  fetchUserSearchRightRequest,
  getPointsValidList,
  getFreezeRecord,
} from 'services/user/users';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  memberListInfo: {
    data: [],
    total: 0,
    loading: false,
  }, // 用户列表,
  loading: false,
  userRecordInfo: {},
  userRecordLoading: false,
  userActionInfo: {},
  userIntegralInfo: { loading: false },
  userCouponInfo: {},
  userLogInfo: {},
  searchRights: [], // 搜索筛选框权限list
  pointsValidData: {
    list: [],
    total: 0,
    total_amount: 0,
    loading: false,
  },
  freezeRecordData: {
    list: [],
    total: 0,
    total_amount: 0,
    loading: false,
  },
});

export default {
  namespace: 'memberInfo',

  state: immutableState,

  effects: {
    // 查询用户列表
    *getMemberList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          memberListInfo: {
            data: [],
            total: 0,
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchUserList(payload);
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
              data: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getMemberRecord({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          userRecordLoading: true,
          userRecordInfo: {},
        },
      });

      const {
        data: { data, status },
      } = yield fetchUserRecord(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            userRecordInfo: data,
            userRecordLoading: false,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            userRecordInfo: {},
            userRecordLoading: false,
          },
        });
      }
    },

    *getMemberAction({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchUserAction(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            userActionInfo: data,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            userActionInfo: {},
          },
        });
      }
    },

    *getMemberIntegral({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          userIntegralInfo: { loading: true },
        },
      });
      const {
        data: { data, status },
      } = yield fetchUserIntegral(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            userIntegralInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            userIntegralInfo: { loading: false },
          },
        });
      }
    },

    *getMemberCoupon({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchUserCoupon(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            userCouponInfo: data,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            userCouponInfo: {},
          },
        });
      }
    },

    *getMemberLog({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchUserLog(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            userLogInfo: data,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            userLogInfo: {},
          },
        });
      }
    },

    *getUserSearchRights({ payload }, { put, select }) {
      const memberInfo = yield select((state) => state.memberInfo.toJS());
      if (memberInfo.searchRights.length) {
        return;
      }
      const {
        data: { data, status },
      } = yield fetchUserSearchRightRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            searchRights: data,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            searchRights: [],
          },
        });
      }
    },

    *getPointsValidList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          pointsValidData: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getPointsValidList(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            pointsValidData: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            pointsValidData: {
              loading: false,
            },
          },
        });
      }
    },

    *getFreezeRecordList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          freezeRecordData: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield getFreezeRecord(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            freezeRecordData: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            freezeRecordData: {
              loading: false,
            },
          },
        });
      }
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }, action) => {
        const query = parseSearch(search);
        if (pathname === '/member') {
          dispatch({
            type: 'getUserSearchRights',
            payload: {},
          });
        }
        if (pathname === '/member/detail-record') {
          const readBaseInfoRight = [
            'member_manage',
            'member_detail',
            'archives',
            'read_base_info',
          ]; // 查看用戶個人檔案/基礎信息
          const readContactInfoRight = [
            'member_manage',
            'member_detail',
            'archives',
            'read_contact_info',
          ]; // 查看用戶個人檔案/聯繫信息
          const readPrivateInfoRight = [
            'member_manage',
            'member_detail',
            'archives',
            'read_other_info',
          ]; // 查看用戶個人檔案/隱私信息
          if (
            isUserHasRights(readBaseInfoRight) ||
            isUserHasRights(readContactInfoRight) ||
            isUserHasRights(readPrivateInfoRight)
          ) {
            dispatch({
              type: 'getMemberRecord',
              payload: {
                ...query,
              },
            });
          }
        }
        if (pathname === '/member/detail-integral') {
          const { type } = query;
          const dispatchMemberIntegral = () => {
            // 積分明細列表查看
            const pointValidRights = [
              'member_manage',
              'member_detail',
              'integral_flow',
              'integral_flow_list',
            ];
            if (!isUserHasRights(pointValidRights)) {
              return;
            }
            const {
              dealDetailTablePage: page,
              dealDetailTablePageSize: pageSize,
            } = query;
            dispatch({
              type: 'getMemberIntegral',
              payload: {
                ...query,
                page: page || 1,
                limit: pageSize || DEFAULT_PAGE_SIZE,
                // id: 1255
              },
            });
          };

          const dispatchPointsValidList = () => {
            // 積分有效期查看權限
            const pointValidRights = [
              'member_manage',
              'member_detail',
              'integral_flow',
              'points_valid',
            ];
            if (!isUserHasRights(pointValidRights)) {
              return;
            }
            const {
              pointValidTablePage: page,
              pointValidTablePageSize: pageSize,
            } = query;
            dispatch({
              type: 'getPointsValidList',
              payload: {
                ...query,
                page: page || 1,
                limit: pageSize || DEFAULT_PAGE_SIZE,
                // id: 100001
              },
            });
          };
          const dispatchFreezeRecordList = () => {
            // 積分冻结列表查看
            const pointValidRights = [
              'member_manage',
              'member_detail',
              'integral_flow',
              'freeze_record_list',
            ];
            if (!isUserHasRights(pointValidRights)) {
              return;
            }
            const {
              freezeRecordTablePage: page,
              freezeRecordTablePageSize: pageSize,
            } = query;
            dispatch({
              type: 'getFreezeRecordList',
              payload: {
                ...query,
                page: page || 1,
                limit: pageSize || DEFAULT_PAGE_SIZE,
                // id: 100001
              },
            });
          };

          const resetQuery = () => {
            delete query.dealDetailTablePage;
            delete query.dealDetailTablePageSize;
            delete query.pointValidTablePage;
            delete query.pointValidTablePageSize;
            delete query.type;
          };
          // reload page
          if (action !== 'PUSH' || !type) {
            dispatchMemberIntegral();
            dispatchPointsValidList();
            dispatchFreezeRecordList();
            return;
          }
          if (type === 'valid') {
            dispatchPointsValidList();
          } else if (type === 'freezeRecord') {
            dispatchFreezeRecordList();
          } else if (type === 'deal') {
            dispatchMemberIntegral();
          }
        }
        if (pathname === '/member/detail-coupon') {
          dispatch({
            type: 'getMemberCoupon',
            payload: {
              ...query,
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        if (pathname === '/member/detail-log') {
          // 查看優惠券列表
          const couponListRights = [
            'member_manage',
            'member_detail',
            'update_log',
          ]; // 查看優惠券列表
          if (!isUserHasRights(couponListRights)) {
            return;
          }
          dispatch({
            type: 'getMemberLog',
            payload: {
              ...query,
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
