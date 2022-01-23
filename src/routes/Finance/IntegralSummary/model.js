import Immutable from 'immutable';
import { parseSearch } from 'utils/tools';
import {
  fetchBalanceListRequest,
  fetchReleaseListRequest,
  fetchProjectListRequest,
  fetchSystemListRequest,
  fetchConsumListRequest,
  fetchBUListRequest,
  fetchBUPartmentListRequest,
  fetchSubAccountBalanceRequest,
} from 'services/finance/integral-summary/summary';
import { fetchPointDetailSearchConfigRequest } from 'services/finance/integral-detail/detail';
import { DEFAULT_PAGE_SIZE } from 'constants';

const immutableState = Immutable.fromJS({
  balaceListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  systemListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  consumListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  searchConfig: {},
  BUListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  BUAccountListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  ReleaseListInfo: {
    data: [],
    total: 0,
    loading: false,
  },
  ProjectList: [],
  subAccountListInfo: {
    list: [],
    total: 0,
    loading: false,
  },
});
export default {
  namespace: 'financeSummary',
  state: immutableState,
  effects: {
    *getBalanceList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          balaceListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchBalanceListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            balaceListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            balaceListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getSystemList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          systemListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchSystemListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            systemListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            systemListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getConsumList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          consumListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchConsumListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            consumListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            consumListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getSearchConfig({ payload }, { put }) {
      const {
        data: { data, status },
      } = yield fetchPointDetailSearchConfigRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            searchConfig: data,
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            searchConfig: {},
          },
        });
      }
    },

    *getBUList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          BUListInfo: {
            loading: true,
          },
        },
      });
      const { data } = yield fetchBUListRequest(payload);
      if (data.status) {
        yield put({
          type: 'save',
          payload: {
            BUListInfo: { ...data.data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            BUListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },

    *getBUPartmentList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          BUAccountListInfo: {
            loading: true,
          },
        },
      });
      const { data } = yield fetchBUPartmentListRequest(payload);
      if (data.status) {
        yield put({
          type: 'save',
          payload: {
            BUAccountListInfo: { ...data.data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            BUAccountListInfo: {
              data: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    *getReleaseList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          ReleaseListInfo: {
            loading: true,
          },
        },
      });
      const {
        data: { data, status },
      } = yield fetchReleaseListRequest(payload);
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            ReleaseListInfo: { ...data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            ReleaseListInfo: {
              list: [],
              total: 0,
              loading: false,
            },
          },
        });
      }
    },
    *clearReleaseList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          ReleaseListInfo: {
            list: [],
            total: 0,
            loading: false,
          },
        },
      });
    },
    *getProjectList({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          ProjectList: [],
        },
      });
      const {
        data: { data, status },
      } = yield fetchProjectListRequest();
      if (status && data) {
        yield put({
          type: 'save',
          payload: {
            ProjectList: data,
          },
        });
      }
    },
    *fetchSubAccountBalanceRequest({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          subAccountListInfo: {
            loading: true,
          },
        },
      });
      const { data } = yield fetchSubAccountBalanceRequest(payload);
      if (data.status) {
        yield put({
          type: 'save',
          payload: {
            subAccountListInfo: { ...data.data, loading: false },
          },
        });
      } else {
        yield put({
          type: 'save',
          payload: {
            subAccountListInfo: {
              list: [],
              total: 0,
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
        if (pathname === '/finance/integral-summary/balance') {
          dispatch({
            type: 'getBalanceList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
          dispatch({
            type: 'getSearchConfig',
            payload: { type: 1 },
          });
        }
        if (pathname === '/finance/integral-summary/system') {
          dispatch({
            type: 'getSystemList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
        }
        if (pathname === '/finance/integral-summary/consum') {
          dispatch({
            type: 'getConsumList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
        }
        if (pathname === '/finance/integral-summary/bu') {
          dispatch({
            type: 'getBUList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
        }
        if (pathname === '/finance/integral-summary/bu-account') {
          dispatch({
            type: 'getBUPartmentList',
            payload: {
              limit: query.pageSize || DEFAULT_PAGE_SIZE,
              ...query,
            },
          });
        }
        if (pathname === '/finance/IntegralSummary/releasePoints') {
          if (query.project_id) {
            dispatch({
              type: 'getReleaseList',
              payload: {
                limit: query.pageSize || DEFAULT_PAGE_SIZE,
                ...query,
              },
            });
          }
        }
        if (pathname === '/finance/integral-summary/subAccountBalance') {
          dispatch({
            type: 'fetchSubAccountBalanceRequest',
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
