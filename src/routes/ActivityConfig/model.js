import { fromJS } from 'immutable';
import moment from 'moment';
import { parseSearch } from 'utils/tools';
import { DEFAULT_PAGE_SIZE } from 'constants';
import {
  fetchList,
  fetchDetail,
  saveDetail,
  getStemList,
  getStemOptions,
  getActivityQuestion,
  saveQuestion,
  changeActivityStatus,
  deletePromotion,
  getRecordList,
  getAnswerTotal,
  stopGrant,
  getOriginQuestionList,
} from 'services/promotion';

const initState = {
  listInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  originQuestionInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  recordInfo: {
    list: [],
    total: 0,
    loading: false,
  },
  questions: {
    list: [],
    stem: [], // 题干
    deleteids: [],
  },
  detail: {
    type: 'tidy', // 模板类型(answer 答题模板,tidy 精简模板)
    id: null,
    name: '', // 活动标题
    color: '#0032E8', // 背景颜色
    documentTitle: '', // 导航栏标题
    title: '', // 主页面标题
    failTitle: '', // 领取失败标题
    prizeType: 1, // 专享优惠类型
    skuId: '', // SKUID
    prizeNum: 0, // 奖品总数,0=不限制
    dailyNum: {
      daily_total: 0, // 每日限制,0=不限制
      daily_reset_time: '00:00',
      check: false,
    },
    prizeImg: '', // 奖品主图
    prizeImgUrl: '', // 奖品主图展示地址
    // 1.9.6
    mainBackImg: '', // 活動主頁面背景圖
    mainBackImgUrl: '', // 活動主頁面背景圖展示地址
    startEndBackImg: '', // 活動未開始/已結束頁面背景圖
    startEndBackImgUrl: '', // 活動未開始/已結束頁面背景圖展示地址
    rewardTimeList: [], // 獎勵規則生效時段

    prizeDesc: '', // 奖品描述
    rules: '', // 活动规则描述
    questionImg: '', // 答题首页主图
    questionImgUrl: '', // 答题首页主图展示地址
    receiveStandard: 1, // 领取规则,1:新会员专享（注册时间在30天以内的会员）。2:推广活动时间内注册的会员专享。3:无限制(已绑定手机号的均可领取)
    receiveLimit: 1, // 领取次数,1:限领1次。 2:不限制
    area_limit: 0, // 地區限制,0：不限制  1   僅限香港地區
    department_pid: '',
    initiate_department: '',
    offer_account: '',
    offer_account_union_id: '',
    points_show_message: '', // 积分明细展示名称描述
    startTime: '', // 活动开始时间
    endTime: '', // 活动结束事件
    status: 0, // 是否发布(1是,0/不传为否)
    offer_points_valid_date: {},
  },
  answerTotalListInfo: {
    answerTotalList: [],
    loading: false,
  },
};

const immutableState = fromJS(initState);
export default {
  namespace: 'activityConfig',
  state: immutableState,
  effects: {
    *changeMode({ mode }, { put }) {
      yield put({
        type: 'saveDetail',
        payload: {
          type: mode,
        },
      });
    },

    *changeForm({ payload }, { put }) {
      yield put({
        type: 'saveDetail',
        payload,
      });
    },

    *fetchList({ payload }, { put }) {
      yield put({
        type: 'saveList',
        payload: {
          loading: true,
        },
      });
      const { data } = yield fetchList(payload);
      const listInfo = data.status
        ? { ...data.data, loading: false }
        : { list: [], total: 0, loading: false };
      yield put({
        type: 'saveList',
        payload: {
          ...listInfo,
        },
      });
    },
    *fetchAnswerTotal({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          answerTotalListInfo: {
            loading: true,
            answerTotalList: [],
          },
        },
      });
      if (payload.activity_id) {
        const { data } = yield getAnswerTotal(payload);
        if (data.status && data.code === 0) {
          yield put({
            type: 'save',
            payload: {
              answerTotalListInfo: {
                loading: false,
                answerTotalList: data.data,
              },
            },
          });
        } else {
          yield put({
            type: 'save',
            payload: {
              answerTotalListInfo: {
                loading: false,
                answerTotalList: [],
              },
            },
          });
        }
      } else {
        yield put({
          type: 'save',
          payload: {
            answerTotalListInfo: {
              loading: false,
              answerTotalList: [],
            },
          },
        });
      }
    },

    *fetchRecordList({ payload }, { put }) {
      yield put({
        type: 'saveRecordList',
        payload: {
          loading: true,
        },
      });
      const { data } = yield getRecordList(payload);
      const recordInfo = data.status
        ? { ...data.data, loading: false }
        : { list: [], total: 0, loading: false };
      yield put({
        type: 'saveRecordList',
        payload: {
          ...recordInfo,
        },
      });
    },
    *fetchOriginQuestionInfo({ payload }, { put }) {
      yield put({
        type: 'saveOriginQuestionList',
        payload: {
          loading: true,
        },
      });
      const { data } = yield getOriginQuestionList(payload);
      if (data.status && data.data.data) {
        for (let i = 0; i < data.data.data.list.length; i += 1) {
          if (data.data.data.list[i].answer_limit === '0') {
            data.data.data.list[i].answer_limit = 'un-limit';
          }
        }
      }
      const dataInfo = data.status
        ? { ...data.data.data, loading: false }
        : { list: [], total: 0, loading: false };
      yield put({
        type: 'saveOriginQuestionList',
        payload: {
          ...dataInfo,
        },
      });
    },
    *fetchDetail({ payload }, { put, select }) {
      const { data } = yield fetchDetail(payload.id);
      const systemInfo = yield select((state) => state.system.toJS());
      if (data.status) {
        const info = data.data;
        const startTime = info.online_at
          ? moment(info.online_at).unix() * 1000
          : moment().unix() * 1000;
        const endTime = info.offline_at
          ? moment(info.offline_at).unix() * 1000
          : moment().unix() * 1000;

        if (payload.type === 'copy') {
          // 复制的活动 规则生效日期  相当于新建的 可以随便改
          info.effective_time_section &&
            info.effective_time_section.map((item) => {
              item.type = 'new';
              return item;
            });
        }
        yield put({
          type: 'saveDetail',
          payload: {
            type: info.activity_type === 1 ? 'tidy' : 'answer', // 模板类型(answer 答题模板,tidy 精简模板)
            id: info.id || null,
            name:
              systemInfo.query.action === 'copy'
                ? info.title + '_副本'
                : info.title, // 活动标题
            color: info.background_color || '#ffffff', // 背景颜色
            documentTitle: info.nav_title || '', // 导航栏标题
            title: info.main_title || '', // 主页面标题
            failTitle: info.redeem_fail_title || '', // 领取失败标题
            prizeType: info.preferential_type || 1, // 专享优惠类型
            skuId: info.preferential_sku || '', // SKUID
            prizeNum: info.preferential_total || 0, // 奖品总数,0=不限制
            dailyNum: {
              daily_total: info.daily_total || 0, // 每日限制,0=不限制
              daily_reset_time: info.daily_reset_time || '00:00',
              check: info.daily_total > 0 ? true : false,
            },
            prizeImg: info.reward_image || '', // 奖品主图
            prizeImgUrl: info.reward_image_url || '', // 奖品主图展示地址
            // 1.9.6
            mainBackImg: info.background_reward_image || '',
            mainBackImgUrl: info.background_reward_image_url || '',
            startEndBackImg: info.activity_status_image || '',
            startEndBackImgUrl: info.activity_status_image_url || '',
            rewardTimeList: info.effective_time_section || [],

            prizeDesc: info.reward_description || '', // 奖品描述
            rules: info.rule_description || '', // 活动规则描述
            questionImg: info.question_image || '', // 答题首页主图
            questionImgUrl: info.question_image_url || '', // 答题首页主图展示地址
            // 领取规则,1:新会员专享（注册时间在30天以内的会员）。2:推广活动时间内注册的会员专享。3:无限制(已绑定手机号的均可领取)
            receiveStandard: info.offer_rule || 1,
            receiveLimit: info.offer_times || 1, // 领取次数,1:限领1次。 2:不限制
            area_limit: info.area_limit || 0, // 地區限制,0：不限制  1   僅限香港地區
            points_show_message: info.points_show_message || '', // 积分明细展示名称描述
            initiate_department: info.initiate_department || '',
            department_pid: info.department_pid || '',
            offer_account: info.offer_account || '',
            offer_account_union_id: info.offer_account_union_id || '',
            startTime, // 活动开始时间
            endTime, // 活动结束事件
            status: info.status || 0, // 是否发布(1是,0/不传为否)
            online_times: info.online_times, // 发布的次数
            offer_points_valid_date: info.offer_points_valid_date || {
              type: 'fixed_date',
              period: '2020-09-30',
            },
            // 延迟发放
            send_time_status: info.send_time_status,
            delay_time: info.delay_time,
          },
        });
      }
    },
    *submitTemplate({ payload }, { put }) {
      const { data } = yield saveDetail(payload);
      if (data.status) {
        return data.data.id;
      }
    },
    // 複製活動後成功，把新建的活動 的數據  填充到頁面
    *saveCopyDetail({ payload }, { put }) {
      const startTime = payload.online_at
        ? moment(payload.online_at).unix() * 1000
        : moment().unix() * 1000;
      const endTime = payload.offline_at
        ? moment(payload.offline_at).unix() * 1000
        : moment().unix() * 1000;
      yield put({
        type: 'saveDetail',
        payload: {
          type: payload.type, // 模板类型(answer 答题模板,tidy 精简模板)
          id: payload.id || null,
          name: payload.title || '', // 活动标题
          color: payload.background_color || '#ffffff', // 背景颜色
          documentTitle: payload.nav_title || '', // 导航栏标题
          title: payload.main_title || '', // 主页面标题
          failTitle: payload.redeem_fail_title || '', // 领取失败标题
          prizeType: payload.preferential_type || 1, // 专享优惠类型
          skuId: payload.preferential_sku || '', // SKUID
          prizeNum: payload.preferential_total || 0, // 奖品总数,0=不限制
          dailyNum: {
            daily_total: payload.daily_total || 0, // 每日限制,0=不限制
            daily_reset_time: payload.daily_reset_time || '00:00',
            check: payload.daily_total > 0 ? true : false,
          },
          prizeImg: payload.reward_image || '', // 奖品主图
          prizeImgUrl: payload.reward_image_url || '', // 奖品主图展示地址

          // 1.9.6
          mainBackImg: payload.background_reward_image || '',
          mainBackImgUrl: payload.background_reward_image_url || '',
          startEndBackImg: payload.activity_status_image || '',
          startEndBackImgUrl: payload.activity_status_image_url || '',
          rewardTimeList: payload.effective_time_section || [],

          prizeDesc: payload.reward_description || '', // 奖品描述
          rules: payload.rule_description || '', // 活动规则描述
          questionImg: payload.question_image || '', // 答题首页主图
          questionImgUrl: payload.question_image_url || '', // 答题首页主图展示地址
          // 领取规则,1:新会员专享（注册时间在30天以内的会员）。2:推广活动时间内注册的会员专享。3:无限制(已绑定手机号的均可领取)
          receiveStandard: payload.offer_rule || 1,
          receiveLimit: payload.offer_times || 1, // 领取次数,1:限领1次。 2:不限制
          area_limit: payload.area_limit || 0, // 地區限制,0：不限制  1   僅限香港地區
          points_show_message: payload.points_show_message || '', // 积分明细展示名称描述
          initiate_department: payload.initiate_department || '',
          department_pid: payload.department_pid || '',
          offer_account: payload.offer_account || '',
          offer_account_union_id: payload.offer_account_union_id || '',
          startTime, // 活动开始时间
          endTime, // 活动结束事件
          status: payload.status || 0, // 是否发布(1是,0/不传为否)
          online_times: payload.online_times, // 发布的次数
          offer_points_valid_date: payload.offer_points_valid_date || {
            type: 'fixed_date',
            period: '2020-09-30',
          },
          // 延迟发放
          send_time_status: payload.send_time_status,
          delay_time: payload.delay_time,
        },
      });
    },

    *getStemList(_, { put }) {
      const { data } = yield getStemList();
      yield put({
        type: 'saveQ',
        payload: {
          stem: data.status ? data.data.list : [],
        },
      });
    },

    *getOptionList({ id }, _) {
      const { data } = yield getStemOptions(id);
      return data.status ? data.data.option : [];
    },

    *addQuestion({ payload }, { put }) {
      yield put({
        type: 'addQ',
        payload,
      });
    },

    *fetchActivityQuestion({ id }, { put }) {
      const { data } = yield getActivityQuestion(id);
      let allList = [];
      if (data.data.master && data.data.slave) {
        allList = data.data.master.concat(data.data.slave);
      }
      if (data.status) {
        yield put({
          type: 'saveQ',
          payload: {
            list: allList || [],
          },
        });
      }
    },

    *submitQuestion({ payload }, { put }) {
      const { data } = yield saveQuestion(payload);
      if (data && data.status) {
        return true;
      }
      return false;
    },
    *changeStatus({ id, status }, { put }) {
      const data = yield changeActivityStatus(id, status);
      return data;
    },
    *stopGrant({ payload }, { put }) {
      const data = yield stopGrant(payload);
      return data;
    },
    *deletePromotion({ id }, { put }) {
      const data = yield deletePromotion(id);
      return data;
    },
  },

  reducers: {
    saveQ(state, action) {
      return state.mergeIn(['questions'], action.payload);
    },
    saveList(state, action) {
      return state.mergeIn(['listInfo'], action.payload);
    },
    saveRecordList(state, action) {
      return state.mergeIn(['recordInfo'], action.payload);
    },
    saveOriginQuestionList(state, action) {
      return state.mergeIn(['originQuestionInfo'], action.payload);
    },
    saveDetail(state, action) {
      return state.mergeIn(['detail'], action.payload);
    },
    save(state, action) {
      return state.merge(action.payload);
    },

    addQ(state, action) {
      return state.updateIn(['questions', 'list'], (list) => {
        return list.push(action.payload);
      });
    },

    deleteQuestion(state, action) {
      let deleteids = [];
      let list = [];
      if (!(action.id + '').startsWith('uuid')) {
        deleteids = state.getIn(['questions', 'deleteids']).push(action.id);
      }
      list = state.getIn(['questions', 'list']).toJS();
      const result = fromJS(list.filter((item) => item.id !== action.id));
      return state.mergeIn(['questions'], { list: result, deleteids });
    },

    moveQuestionList(state, action) {
      console.log(action);
      return state.mergeIn(['questions'], { list: action.list });
    },

    changeQuestion(state, action) {
      const list = state.getIn(['questions', 'list']).toJS();
      const changed = action.changed;
      const target = list.find((item) => item.id === action.id);
      for (const key in changed) {
        target[key] = changed[key];
      }
      return state.mergeIn(['questions'], { list });
    },

    resetDetail(state, action) {
      const detail = immutableState.get('detail');
      const questions = immutableState.get('questions');
      return state.merge({ detail, questions });
    },
  },

  subscriptions: {
    setup({ history, dispatch }) {
      return history.listen(({ pathname, search }) => {
        const query = parseSearch(search);
        const { pageSize, ...rest } = query;
        if (pathname === '/activity-config/list') {
          dispatch({
            type: 'fetchList',
            payload: {
              ...rest,
              limit: pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        if (pathname === '/activity-config/statistics') {
          dispatch({
            type: 'fetchAnswerTotal',
            payload: {
              ...rest,
            },
          });
        }
        if (pathname === '/activity-config/record') {
          dispatch({
            type: 'fetchRecordList',
            payload: {
              ...rest,
              limit: pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
        if (pathname === '/activity-config/question') {
          dispatch({
            type: 'fetchOriginQuestionInfo',
            payload: {
              page: rest.page || 1,
              ...rest,
              limit: pageSize || DEFAULT_PAGE_SIZE,
            },
          });
        }
      });
    },
  },
};
