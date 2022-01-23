import React from 'react';
import { connect } from 'dva';
import qs from 'qs';
import moment from 'moment';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  DatePicker,
  Button,
  Select,
  Icon,
  message,
  Tooltip,
  Modal,
} from 'antd';
import Table from 'components/Table';
import ResetBtn from 'components/ResetBtn';
import { updateAccountStatus } from 'services/common/common';
import AuthWrapCom from 'components/AuthCom';
import { formatFormData, addWaterMarker, isUserHasRights } from 'utils/tools';
import { withRouter } from 'react-router';
import LoadingCom from 'components/LoadingCom';
import eventEmmiter from 'utils/events';
import FoldableCard from './components/FoldableCard';

import './members.less';

const confirm = Modal.confirm;

const JSON_CONFIG = {
  account_id: {
    title: '會員ID',
    key: '_account_id',
    width: 90,
    order: 1,
    render: (record) => {
      if (record.id) {
        const idStr = record.id.toString();
        if (idStr.length > 4) {
          return (
            <Tooltip title={record.id}>
              {idStr.substring(0, idStr.length - 2) + '**'}
            </Tooltip>
          );
        }
        return (
          <Tooltip title={record.id}>
            {idStr.substring(0, idStr.length - 1) + '*'}
          </Tooltip>
        );
      }
    },
  },
  username: {
    title: '會員名稱',
    key: 'username',
    width: 120,
    order: 2,
    render: (record) => {
      return record.username ? record.username : '--';
    },
  },
  nick_name: {
    title: '會員暱稱',
    key: '_nick_name',
    order: 3,
    render: (record) => {
      return record.nick_name ? record.nick_name.trim() : '--';
    },
  },
  reg_time: {
    title: '註冊時間',
    key: '_reg_time',
    order: 4,
    render: (record) => {
      return record.reg_time ? record.reg_time : '--';
    },
  },
  real_name: {
    title: '中文名',
    key: '_real_name',
    order: 5,
    render: (record) => {
      return record.real_name ? record.real_name.trim() : '--';
    },
  },
  en_name: {
    title: '英文名',
    key: '_en_name',
    order: 6,
    render: (record) => {
      return record.en_name ? record.en_name.trim() : '--';
    },
  },
  avatar_url: {
    title: '頭像地址',
    key: '_avatar_url',
    order: 7,
    render: (record) => {
      return record.avatar_url ? record.avatar_url.trim() : '--';
    },
  },
  telephone: {
    title: '電話號碼',
    key: '_telephone',
    order: 8,
    render: (record) => {
      if (record.telephone) {
        return (
          <Tooltip title={record.telephone}>
            {record.telephone
              .toString()
              .substring(0, record.telephone.length - 2) + '**'}
          </Tooltip>
        );
      }
    },
  },
  email: {
    title: '郵箱',
    key: '_email',
    width: 250,
    order: 9,
    render: (record) => {
      if (record.email) {
        const word = record.email.split('@');
        if (word.length > 1) {
          if (word[0].length > 4) {
            return (
              <Tooltip title={record.email}>
                {word[0].substring(0, word[0].length - 2) + '**@' + word[1]}
              </Tooltip>
            );
          }
          return (
            <Tooltip title={record.email}>
              {word[0].substring(0, word[0].length - 1) + '*@' + word[1]}
            </Tooltip>
          );
        }
        return <span>{record.email}</span>;
      }
    },
  },
  reg_channel: {
    title: '註冊方式',
    key: '_reg_channel',
    order: 10,
    render: (record) => {
      const gen = REG_CHANNEL_JSON[`${record.reg_channel}`] || '--';
      return gen;
    },
  },
  referrer_account_id: {
    title: '推薦人ID',
    key: '_referrer_account_id',
    order: 11,
    render: (record) => {
      if (record.referrer_account_id) {
        const idStr = record.referrer_account_id.toString();
        if (idStr.length > 4) {
          return (
            <Tooltip title={record.referrer_account_id}>
              {idStr.substring(0, idStr.length - 2) + '**'}
            </Tooltip>
          );
        }
        return (
          <Tooltip title={record.referrer_account_id}>
            {idStr.substring(0, idStr.length - 1) + '*'}
          </Tooltip>
        );
      }
    },
  },
  referrer_at: {
    title: '被推薦時間',
    key: '_referrer_at',
    order: 12,
    render: (record) => {
      return record.referrer_at ? record.referrer_at : '--';
    },
  },
  status: {
    title: '狀態',
    key: '_status',
    order: 13,
    render: (record) => {
      const { status } = record;
      return status === 1 ? '正常' : '封禁';
    },
  },
};

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const Option = Select.Option;
// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const REG_CHANNEL_JSON = {
  0: '未知',
  1: '電郵',
  2: 'Facebook',
  3: 'Google',
  4: '帳戶名',
  5: '手機',
  6: '微信',
  7: 'Twitter',
  8: 'Apple',
};

const defaultColumns = [
  {
    title: '會員ID',
    dataIndex: 'id',
  },
  {
    title: '會員名稱',
    dataIndex: 'username',
  },
  {
    title: '會員暱稱',
    render: (record) => {
      return record.nickname ? record.nickname.trim() : '--';
    },
  },
  {
    title: '註冊時間',
    render: (record) => {
      return record.created_at ? record.created_at : '--';
    },
  },
  {
    title: '電話號碼',
    render: (record) => {
      return record.telphone || '--';
    },
  },
  {
    title: '註冊方式',
    render: (record) => {
      const gen = REG_CHANNEL_JSON[`${record.reg_channel}`] || '--';
      return gen;
    },
  },
  {
    title: '推薦人ID',
    render: (record) => {
      return '--';
    },
  },
  {
    title: '被推薦時間',
    render: (record) => {
      return '--';
    },
  },
  {
    title: '狀態',
    render: (record) => {
      const { status } = record;
      return status === 1 ? '正常' : '封禁';
    },
  },
  {
    title: '操作',
    width: 140,
    key: 'operation',
    render: (text, record) => {
      // 1:正常、2:被合并、3:被禁用
      const { status } = record;
      let txt = '';
      let textColor = '';
      if (status === 1) {
        txt = '禁封';
        textColor = 'u-color-red';
      } else if (status === 3) {
        txt = '解封';
        textColor = 'u-color-green';
      }
      return (
        <React.Fragment>
          <span
            className="detail-btn"
            onClick={() => this.handleDetailClick(record)}
          >
            詳情
          </span>
          <AuthWrapCom authList={['member_manage', 'member_list', 'action']}>
            <span
              className={`detail-btn ${textColor}`}
              onClick={() => this.handleOperationClick(record)}
            >
              {txt}
            </span>
          </AuthWrapCom>
        </React.Fragment>
      );
    },
  },
];

const detailRightList = ['member_manage', 'member_detail'];
const operationBtnRightList = [
  'member_manage',
  'member_list',
  'member_info_detail',
];

const defaultSearchListOrder = [
  'member_id',
  'member_name',
  'member_phone',
  'member_email',
  'member_referee_id',
  'facebook_account',
  'google_account',
  'member_recommend_time',
  'member_register_time',
  'member_register_way',
  'member_status',
  'username',
  'nickname',
  'gender',
  'birth_year',
  'birth_month',
  'marital_status',
  'education_level',
  'child_under_18',
  'residence',
  'district',
  'driver_license',
  'income_level',
  'promotion',
];

class MemberList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      toggleFolded: false,
      register_time: [], // 註冊時間
      recommed_time: [], // 推薦時間
      monthMode: ['month', 'month'],
      monthValue: [],
      yearMode: ['year', 'year'],
      yearValue: [],
    };
    this.selectRef = React.createRef();
    this.statuSelectRef = React.createRef();
  }

  componentDidMount() {
    const { system, history, location } = this.props;
    const { query } = system;
    let register_time = [];
    let recommed_time = [];
    let monthValue = [];
    let yearValue = [];
    if (query.reg_begin_date) {
      register_time = [
        moment(query.reg_begin_date),
        moment(query.reg_end_date),
      ];
    }
    if (query.recommend_begin_date) {
      recommed_time = [
        moment(query.recommend_begin_date),
        moment(query.recommend_end_date),
      ];
    }
    if (query.member_born_begin_year) {
      yearValue = [
        moment(query.member_born_begin_year),
        moment(query.member_born_end_year),
      ];
    }
    if (query.member_born_begin_month) {
      monthValue = [
        moment(query.member_born_begin_month),
        moment(query.member_born_end_month),
      ];
    }

    this.setState({
      register_time,
      recommed_time,
      yearValue,
      monthValue,
    });
    if (!Object.keys(query).length) {
      this.props.dispatch({
        type: 'memberInfo/save',
        payload: {
          memberListInfo: {
            data: [],
            total: 0,
          },
        },
      });
    }
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
    this.handleKeyupEvent();
  }

  renderWaterMarker = () => {
    const name = this.props.auth.get('username');
    const newStr = moment().format('YYYY-MM-DD HH:mm:ss');
    const container = document.querySelector('.ant-table-body');
    const waterMarkerDom = document.querySelector('.watermarker-wrap');
    if (waterMarkerDom) {
      return;
    }
    if (!container) {
      return;
    }
    addWaterMarker(`${name} ${newStr}`, container);
  };

  handleKeyupEvent() {
    eventEmmiter.on('keyup', () => {
      const { form } = this.props;
      const values = form.getFieldsValue();
      const { register_time, recommed_time, reg_channel } = values;
      if (
        this.checkSearchItemValueValidate(values) ||
        register_time ||
        recommed_time ||
        reg_channel
      ) {
        return this.handleClickSearch();
      }
      // NOTE: 待定
      // message.error('搜索條件不能爲空');
    });
  }

  checkSearchItemValueValidate = (values) => {
    const { member_id: id, keyword, phone, email, recommender_id } = values;
    let isValid = false;
    if (id !== null && id) {
      const _id = id.trim();
      if (_id && /^\d*$/g.test(_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字ID');
        return false;
      }
    }
    const _keyword = keyword.trim();
    if (_keyword) {
      isValid = true;
    }

    const _phone = phone.trim();
    if (_phone) {
      isValid = true;
    }

    const _email = email.trim();
    if (_email) {
      isValid = true;
    }

    if (recommender_id) {
      const _recommender_id = recommender_id.trim();
      if (_recommender_id && /^\d*$/g.test(_recommender_id)) {
        isValid = true;
      } else {
        message.error('請輸入純數字的推薦人ID');
        return false;
      }
    }

    // NOTE: 当所有项都通过检查
    if (isValid) {
      return true;
    }
    return false;
  };

  toggle = () => {
    const { toggleFolded } = this.state;
    this.setState({
      toggleFolded: !toggleFolded,
    });
  };

  renderColums = () => {
    const { data } = this.props.memberInfo.memberListInfo;
    if (!data || !data.length) {
      return defaultColumns;
    }
    const json = JSON_CONFIG;
    const firstList = data[0];
    const columnsList = [];
    Object.keys(firstList).forEach((item) => {
      if (json[item]) {
        columnsList.push(json[item]);
      }
    });
    // 按照 order 从小到大排序，保证 table展示的顺序
    columnsList.sort((a, b) => a.order - b.order);
    // 是否有展示 详情按钮的权限
    if (isUserHasRights(operationBtnRightList)) {
      columnsList.push({
        title: '操作',
        width: 140,
        key: 'operation',
        render: (text, record) => {
          // 1:正常、2:被合并、3:被禁用
          const { status } = record;
          let txt = '';
          let textColor = '';
          if (status === 1) {
            txt = '禁封';
            textColor = 'u-color-red';
          } else if (status === 3) {
            txt = '解封';
            textColor = 'u-color-green';
          }
          return (
            <React.Fragment>
              <span
                className="detail-btn"
                onClick={() => this.handleDetailClick(record)}
              >
                詳情
              </span>
              <AuthWrapCom
                authList={['member_manage', 'member_list', 'action']}
              >
                <span
                  className={`action-btn ${textColor}`}
                  onClick={() => this.handleOperationClick(record)}
                >
                  {txt}
                </span>
              </AuthWrapCom>
            </React.Fragment>
          );
        },
      });
    }
    return columnsList;
  };

  columns = this.renderColums();

  handleOperationClick = (record) => {
    const { status, id } = record;
    let content = '';
    if (status === 1) {
      content =
        '正在操作封禁會員賬號, 封禁後該會員賬號無法再用於登錄香港01平台內應用服務, 包括香港 01app/網站、e肚仔等, 已登錄的賬號會被自動退出登錄, 你還要繼續嗎？';
    } else if (status === 3) {
      content =
        '正在對會員帳號解除封禁, 繼續解除封禁後該賬號可用於登錄香港01平台內各應用服務, 包括香港 01app/網站、e肚仔等';
    }
    confirm({
      title: '提示',
      content,
      onOk: () => {
        this.changeAccountStatus(id, status);
      },
    });
  };

  changeAccountStatus = async (id, status) => {
    let s;
    if (status === 1) {
      s = 3;
    } else if (status === 3) {
      s = 1;
    }
    const { data } = await updateAccountStatus({ id, status: s });
    if (data.status) {
      message.success('操作成功');
      const {
        history,
        location,
        system: { query },
      } = this.props;
      try {
        await this.props.dispatch({
          type: 'memberInfo/getMemberList',
          payload: {
            ...query,
            limit: query.pageSize || 10,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  // 点击详情按钮
  handleDetailClick = (record) => {
    if (!isUserHasRights(detailRightList)) {
      message.warning('很抱歉！您的帳號沒有查看用戶個人檔案權限', 3);
      return;
    }
    if (record && record.account_id) {
      this.props.history.push(`/member/detail-record?id=${record.account_id}`);
    }
  };

  // 点击搜索
  handleClickSearch = async () => {
    const { history, location, system } = this.props;
    const { register_time, recommed_time, yearValue, monthValue } = this.state;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        // 如果表单验证不通过
        return;
      }
      // NOTE: 检查是否包含搜索索引项
      if (!this.hasSearchIndexItem(values)) {
        return;
      }
      if (register_time.length) {
        values.reg_begin_date = register_time[0];
        values.reg_end_date = register_time[1];
      }
      if (recommed_time.length) {
        values.recommend_begin_date = recommed_time[0];
        values.recommend_end_date = recommed_time[1];
      }
      if (monthValue.length) {
        values.member_born_begin_month = moment(monthValue[0]).format('MM');
        values.member_born_end_month = moment(monthValue[1]).format('MM');
      }
      if (yearValue.length) {
        values.member_born_begin_year = moment(yearValue[0]).format('YYYY');
        values.member_born_end_year = moment(yearValue[1]).format('YYYY');
      }

      const pageSize = system.query.pageSize;
      if (pageSize) {
        values.pageSize = pageSize;
      }
      delete values.register_time;
      delete values.recommed_time;
      const query = formatFormData(values);
      // 新增 start，每次点击搜索都让page =1
      query.page = 1;
      // end
      const querystring = qs.stringify(query);
      history.push({ ...location, search: `?${querystring}` });
      try {
        await this.props.dispatch({
          type: 'memberInfo/getMemberList',
          payload: {
            ...query,
            limit: pageSize || 10,
          },
        });
      } catch (error) {
        console.error(error);
      }
    });
  };

  // NOTE: 检查搜索条件是否包含索引项
  hasSearchIndexItem(values) {
    const errorMsg = '搜索條件不能爲空';
    // 四个索引项不能包含空格
    let noIndexItemFlag = true;
    for (const key in values) {
      const value = values[key];
      if (value || value === '0' || value === 0) {
        noIndexItemFlag = false;
        break;
      }
    }
    // keyword 索引项首尾项不能包含空格
    const keyword = values.keyword ? values.keyword.trim() : null;
    if (keyword) {
      values.keyword = keyword;
      noIndexItemFlag = false;
    }
    const { monthValue, yearValue } = this.state;
    if (noIndexItemFlag && monthValue.length === 0 && yearValue.length === 0) {
      message.error(errorMsg);
      return false;
    }
    return true;
  }

  changeDate = (type, date, dateString) => {
    this.setState({ [type]: dateString });
  };

  changeYearOpen = (value) => {
    this.setState({
      birth_year_open: value,
    });
  };
  handleYearPanelChange = (value, mode) => {
    if (mode[1] === null) {
      this.setState({
        birth_year_open: false,
      });
    }
    this.setState({
      yearValue: value,
      yearMode: [
        mode[0] === null ? 'year' : mode[0],
        mode[1] === null ? 'year' : mode[1],
      ],
    });
  };
  handleYearChange = (value) => {
    this.setState({ yearValue: value });
  };

  changeMonthOpen = (value) => {
    this.setState({
      birth_month_open: value,
    });
  };
  handleMonthPanelChange = (value, mode) => {
    if (mode[1] === 'date') {
      this.setState({
        birth_month_open: false,
      });
    }
    this.setState({
      monthValue: value,
      monthMode: [
        mode[0] === 'date' ? 'month' : mode[0],
        mode[1] === 'date' ? 'month' : mode[1],
      ],
    });
  };
  handleMonthChange = (value) => {
    this.setState({ monthValue: value });
  };
  // 年龄render
  renderAgeSelect = () => {
    const ageArr = Array.from({ length: 101 }, (item, index) => index);
    ageArr.push(999);
    ageArr.unshift('全部');
    return ageArr.map((item, index) => {
      return (
        <Option value={item == '全部' ? '' : item} key={index}>
          {item === 999 ? '100歲以上' : item}
        </Option>
      );
    });
  };

  // 注册方式render
  renderRegChannelOptions() {
    const arr = Object.keys(REG_CHANNEL_JSON).map((item) => {
      return (
        <Option key={item} value={item.toString()}>
          {REG_CHANNEL_JSON[item]}
        </Option>
      );
    });
    arr.unshift(
      <Option key="999" value="999">
        全部
      </Option>
    );
    return arr;
  }

  renderStatusOptions() {
    const arr = [
      {
        key: 0,
        txt: '全部',
      },
      {
        key: 1,
        txt: '正常',
      },
      {
        key: 3,
        txt: '已封禁',
      },
    ];
    return arr.map((item, index) => {
      return (
        <Option key={index} value={item.key.toString()}>
          {item.txt}
        </Option>
      );
    });
  }

  // 分页更改
  pageChange = (pagination) => {
    const { history, location, system } = this.props;
    this.setState({
      currentPage: pagination.current,
    });
    const query = system.query;
    const querystring = qs.stringify({
      ...query,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    history.push({ ...location, search: `?${querystring}` });
    this.props.dispatch({
      type: 'memberInfo/getMemberList',
      payload: {
        ...query,
        page: pagination.current,
        limit: pagination.pageSize || 10,
      },
    });
  };

  // 重置
  onReset = () => {
    this.setState({
      register_time: [],
      recommed_time: [],
      yearValue: [],
      birth_year_open: false,
      monthValue: [],
      birth_month_open: false,
      currentPage: 1,
    });
    this.props.dispatch({
      type: 'memberInfo/save',
      payload: {
        memberListInfo: {
          data: [],
          total: 0,
        },
      },
    });
  };

  renderSearchOptions = (item) => {
    const { getFieldDecorator } = this.props.form;

    const { query } = this.props.system;
    const removeSpaceChar = (value) => {
      if (value) {
        return value.replace(/\s/g, '');
      }
      return '';
    };
    const { monthValue, monthMode, yearValue, yearMode } = this.state;

    const alwaysShowArr = [
      'member_id',
      'member_name',
      'member_phone',
      'member_email',
      'member_referee_id',
      'facebook_account',
      'google_account',
      'member_recommend_time',
      'member_register_time',
      'member_register_way',
      'member_status',
    ];
    if (!this.state.toggleFolded && !alwaysShowArr.includes(item)) {
      return;
    }

    const json = {
      member_id: () => {
        return (
          <Col span={8}>
            <FormItem label="會員ID" {...formItemLayout}>
              {getFieldDecorator('member_id', {
                initialValue: query.member_id || '',
                normalize: removeSpaceChar,
                rules: [
                  {
                    pattern: /^\d*$/g,
                    message: '請輸入純數字ID',
                  },
                ],
              })(<Input placeholder="請輸入會員ID" />)}
            </FormItem>
          </Col>
        );
      },
      member_name: () => {
        return (
          <Col span={8}>
            <FormItem label="會員姓名" {...formItemLayout}>
              {getFieldDecorator('keyword', {
                initialValue: query.keyword || '',
              })(<Input placeholder="中文/英文/暱稱/會員名稱" />)}
            </FormItem>
          </Col>
        );
      },
      username: () => {
        return (
          <Col span={8}>
            <FormItem label="會員名稱" {...formItemLayout}>
              {getFieldDecorator('username', {
                initialValue: query.username || '',
              })(<Input placeholder="輸入*可替代非空白的任何字" />)}
            </FormItem>
          </Col>
        );
      },
      nickname: () => {
        return (
          <Col span={8}>
            <FormItem label="會員暱稱" {...formItemLayout}>
              {getFieldDecorator('nickname', {
                initialValue: query.nickname || '',
              })(<Input placeholder="輸入*可替代非空白的任何字" />)}
            </FormItem>
          </Col>
        );
      },
      member_phone: () => {
        return (
          <Col span={8}>
            <FormItem label="電話號碼" {...formItemLayout}>
              {getFieldDecorator('phone', {
                initialValue: query.phone || '',
                normalize: removeSpaceChar,
              })(<Input placeholder="輸入*可替代非空白的任何字" />)}
            </FormItem>
          </Col>
        );
      },
      member_email: () => {
        return (
          <Col span={8}>
            <FormItem label="郵箱" {...formItemLayout}>
              {getFieldDecorator('email', {
                initialValue: query.email || '',
                normalize: removeSpaceChar,
                // rules: [
                //   {
                //     type: 'email',
                //     message: '請輸入正確的郵箱格式',
                //   },
                // ],
              })(<Input placeholder="輸入*可替代非空白的任何字" />)}
            </FormItem>
          </Col>
        );
      },
      member_referee_id: () => {
        return (
          <Col span={8}>
            <FormItem label="推薦人ID" {...formItemLayout}>
              {getFieldDecorator('recommender_id', {
                initialValue: query.recommender_id || '',
                normalize: removeSpaceChar,
                rules: [
                  {
                    pattern: /^(\d*)$|^(\*)$/g,
                    message: '請輸入純數字ID或*',
                  },
                ],
              })(<Input placeholder="輸入*可替代非空白的任何字" />)}
            </FormItem>
          </Col>
        );
      },
      gender: () => {
        return (
          <Col span={8}>
            <FormItem label="性別" {...formItemLayout}>
              {getFieldDecorator('gender', {
                initialValue: query.gender || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="1">男</Option>
                  <Option value="2">女</Option>
                  <Option value="3">不願透露</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },

      marital_status: () => {
        return (
          <Col span={8}>
            <FormItem label="婚姻狀況" {...formItemLayout}>
              {getFieldDecorator('marital_status', {
                initialValue: query.marital_status || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="1">單身</Option>
                  <Option value="2">已婚</Option>
                  <Option value="3">其他</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      education_level: () => {
        return (
          <Col span={8}>
            <FormItem label="教育程度" {...formItemLayout}>
              {getFieldDecorator('education_level', {
                initialValue: query.education_level || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="1">中學或以下</Option>
                  <Option value="2">文憑/證書課程/副學位</Option>
                  <Option value="3">學士學位課程或以上</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      child_under_18: () => {
        return (
          <Col span={8}>
            <FormItem label="有子女" {...formItemLayout}>
              {getFieldDecorator('child_under_18', {
                initialValue: query.child_under_18 || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="1">有</Option>
                  <Option value="0">無</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      residence: () => {
        return (
          <Col span={8}>
            <FormItem label="居住地區" {...formItemLayout}>
              {getFieldDecorator('residence', {
                initialValue: query.residence || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="1">香港</Option>
                  <Option value="2">澳門</Option>
                  <Option value="3">中國大陸</Option>
                  <Option value="4">海外</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      district: () => {
        return (
          <Col span={8}>
            <FormItem label="香港地區" {...formItemLayout}>
              {getFieldDecorator('district', {
                initialValue: query.district || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="central_and_western">中西區</Option>
                  <Option value="eastern">東區</Option>
                  <Option value="southern">南區</Option>
                  <Option value="wan_chai">灣仔區</Option>
                  <Option value="kowloon_city">九龍城區</Option>
                  <Option value="kwun_tong">觀塘區</Option>
                  <Option value="sham_shui_po">深水埗區</Option>
                  <Option value="wong_tai_sin">黃大仙區</Option>
                  <Option value="yau_tsim_mong">油尖旺區</Option>
                  <Option value="kwai_tsing">葵青區</Option>
                  <Option value="northern">北區</Option>
                  <Option value="sai_kung">西貢區</Option>
                  <Option value="sha_tin">沙田區</Option>
                  <Option value="tai_po">大埔區</Option>
                  <Option value="tsuen_wan">荃灣區</Option>
                  <Option value="tuen_mun">屯門區</Option>
                  <Option value="yuen_long">元朗區</Option>
                  <Option value="islands">離島</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      driver_license: () => {
        return (
          <Col span={8}>
            <FormItem label="駕駛執照" {...formItemLayout}>
              {getFieldDecorator('driver_license', {
                initialValue: query.driver_license || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="1">有</Option>
                  <Option value="0">無</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      income_level: () => {
        return (
          <Col span={8}>
            <FormItem label="入息水平" {...formItemLayout}>
              {getFieldDecorator('income_level', {
                initialValue: query.income_level || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="*">*非空白* </Option>
                  <Option value="1">$10,000或以下</Option>
                  <Option value="2">$10,001 - $30,000</Option>
                  <Option value="3">$30,001 - $50,000</Option>
                  <Option value="4">$50,001或以上</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      promotion: () => {
        return (
          <Col span={8}>
            <FormItem label="優惠資訊" {...formItemLayout}>
              {getFieldDecorator('promotion', {
                initialValue: query.promotion || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="1">接收</Option>
                  <Option value="0">不接收</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      member_register_time: () => {
        return (
          <Col span={8}>
            <FormItem label="註冊時間" {...formItemLayout}>
              {getFieldDecorator('register_time', {
                initialValue: query.reg_begin_date
                  ? [moment(query.reg_begin_date), moment(query.reg_end_date)]
                  : null,
              })(
                <RangePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  showTime
                  disabledDate={(current) => {
                    return (
                      current &&
                      new Date(current.format('YYYY-MM-DD')) * 1 >
                        new Date(moment().format('YYYY-MM-DD')) * 1
                    );
                  }}
                  onChange={this.changeDate.bind(this, 'register_time')}
                />
              )}
            </FormItem>
          </Col>
        );
      },

      member_recommend_time: () => {
        return (
          <Col span={8}>
            <FormItem label="推薦時間" {...formItemLayout}>
              {getFieldDecorator('recommed_time', {
                initialValue: query.recommend_begin_date
                  ? [
                      moment(query.recommend_begin_date),
                      moment(query.recommend_end_date),
                    ]
                  : null,
              })(
                <RangePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  showTime
                  disabledDate={(current) => {
                    return (
                      current &&
                      new Date(current.format('YYYY-MM-DD')) * 1 >
                        new Date(moment().format('YYYY-MM-DD')) * 1
                    );
                  }}
                  onChange={this.changeDate.bind(this, 'recommed_time')}
                />
              )}
            </FormItem>
          </Col>
        );
      },
      birth_year: () => {
        return (
          <Col span={8}>
            <FormItem label="出生年" {...formItemLayout}>
              <RangePicker
                format="YYYY"
                open={this.state.birth_year_open}
                value={yearValue}
                mode={yearMode}
                onOpenChange={this.changeYearOpen.bind(this)}
                onPanelChange={this.handleYearPanelChange}
                onChange={this.handleYearChange}
                style={{ width: '100%' }}
              />
            </FormItem>
          </Col>
        );
      },
      birth_month: () => {
        return (
          <Col span={8}>
            <FormItem label="出生月" {...formItemLayout}>
              <RangePicker
                format="MM"
                open={this.state.birth_month_open}
                value={monthValue}
                mode={monthMode}
                onOpenChange={this.changeMonthOpen.bind(this)}
                onPanelChange={this.handleMonthPanelChange}
                onChange={this.handleMonthChange}
                style={{ width: '100%' }}
              />
            </FormItem>
          </Col>
        );
      },

      member_register_way: () => {
        return (
          <Col span={8}>
            <FormItem label="註冊方式" {...formItemLayout}>
              {getFieldDecorator('reg_channel', {
                initialValue: query.reg_channel || undefined,
              })(
                <Select
                  placeholder="請選擇註冊方式"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  {this.renderRegChannelOptions()}
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      member_status: () => {
        return (
          <Col span={8}>
            <FormItem label="賬號狀態" {...formItemLayout}>
              {getFieldDecorator('member_status', {
                initialValue: query.member_status || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  {this.renderStatusOptions()}
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      facebook_account: () => {
        return (
          <Col span={8}>
            <FormItem label="Facebook帳號" {...formItemLayout}>
              {getFieldDecorator('facebook_account', {
                initialValue: query.facebook_account || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
      google_account: () => {
        return (
          <Col span={8}>
            <FormItem label="Google帳號" {...formItemLayout}>
              {getFieldDecorator('google_account', {
                initialValue: query.google_account || undefined,
              })(
                <Select
                  placeholder="全部"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Option value="1">是</Option>
                  <Option value="0">否</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        );
      },
    };
    return json[item] ? json[item]() : null;
  };

  // 跳转到批量筛选
  jumpToBatchFilterPage = () => {
    this.props.history.push('/member/batch-filter');
  };

  render() {
    const { data, total, loading } = this.props.memberInfo.memberListInfo;
    const { searchRights } = this.props.memberInfo;
    const { currentPage } = this.state;
    const searchRightsByOrder = [];
    defaultSearchListOrder.forEach((item) => {
      if (searchRights.includes(item)) {
        searchRightsByOrder.push(item);
      }
    });
    if (total !== 0) {
      setTimeout(() => {
        this.renderWaterMarker();
      }, 10);
    }
    return (
      <div className="user-list-wrap">
        <FoldableCard title={<span>搜索條件</span>} onToggle={this.toggle}>
          <Form>
            <Row gutter={{ xs: 8, sm: 16, md: 24 }}>
              {searchRightsByOrder.map((item, index) => {
                return (
                  <React.Fragment key={index}>
                    {this.renderSearchOptions(item)}
                  </React.Fragment>
                );
              })}
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon="search"
                  onClick={this.handleClickSearch}
                  style={{ marginRight: 20 }}
                  disabled={!searchRights.length}
                >
                  搜索
                </Button>
                <ResetBtn
                  form={this.props.form}
                  onReset={this.onReset}
                  disabled={!searchRights.length}
                />
              </Col>
            </Row>
          </Form>
        </FoldableCard>
        <Card style={{ marginTop: 24 }} title="全部會員" bordered={false}>
          <div className="m-hook-table-wrap">
            {loading ? (
              <LoadingCom />
            ) : (
              <Table
                rowKey={(row, index) => index}
                columns={this.renderColums()}
                dataSource={data}
                pagination={{ total }}
                onChange={this.pageChange}
              />
            )}
          </div>
        </Card>
      </div>
    );
  }
}

export default withRouter(
  connect(({ memberInfo, system, auth }) => ({
    memberInfo: memberInfo.toJS(),
    system: system.toJS(),
    auth,
  }))(Form.create()(MemberList))
);
