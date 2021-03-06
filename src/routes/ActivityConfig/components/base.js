import React from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  message,
  InputNumber,
  Modal,
  Row,
  Button,
  Col,
  Icon,
} from 'antd';
import { fetchAccountByDepartment } from 'services/integralManage/approve/approve';
import moment from 'moment';
import debounce from 'lodash/debounce';
import BelongDepartment from 'components/Integral/BelongDepartmentCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import { ruleList, limitList, areaLimitList } from '../constants';
import BgColor from './bgcolor';
import PrizeNum from './prizenum';
import DailyNum from './dailynum';
import SpeImg from './speimg';
import IntegralValidTime from '../../../components/Integral/IntegralValidTime';
import { checkTextareaValue } from './question';

const { Option } = Select;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: {
    xs: 7,
    sm: 7,
    md: 7,
    lg: 6,
    xl: 5,
    xxl: 4,
  },
  wrapperCol: {
    xs: 12,
    sm: 11,
    md: 11,
    lg: 11,
    xl: 9,
    xxl: 7,
  },
};

const formItemWithOutLabel = {
  wrapperCol: {
    xs: {
      span: 12,
      offset: 7,
    },
    sm: {
      span: 11,
      offset: 7,
    },
    md: {
      span: 11,
      offset: 7,
    },
    lg: {
      span: 11,
      offset: 6,
    },
    xl: {
      span: 9,
      offset: 5,
    },
    xxl: {
      span: 7,
      offset: 4,
    },
  },
};
let isFirstDarpmentChange = true;

const valueChangeFunc = async (props, changedValues, allValues) => {
  const changeKeys = Object.keys(changedValues);
  if (props.onChange) {
    const changeObj = { ...changedValues };
    const {
      time,
      prizeImg,
      mainBackImg,
      startEndBackImg,
      questionImg,
      prizeNum,
      dailyNum,
    } = changeObj;
    if (prizeNum === 0) {
      changeObj.dailyNum = {
        daily_total: 0,
        daily_reset_time: '00:00',
        check: false,
      };
    }
    if (time) {
      // ??????
      if (time.length === 0) {
        changeObj.startTime = undefined;
        changeObj.endTime = undefined;
      } else {
        const [startTime, endTime] = time;
        changeObj.startTime = startTime.unix() * 1000;
        changeObj.endTime = endTime.unix() * 1000;
      }
      delete changeObj.time;
    }
    if (prizeImg) {
      // ????????????
      if (prizeImg.length === 0) {
        changeObj.prizeImg = undefined;
        changeObj.prizeImgUrl = undefined;
      } else {
        const [relative, absolute] = prizeImg;
        changeObj.prizeImg = relative;
        changeObj.prizeImgUrl = absolute;
      }
    }
    if (mainBackImg) {
      // ????????????????????????
      if (mainBackImg.length === 0) {
        changeObj.mainBackImg = undefined;
        changeObj.mainBackImgUrl = undefined;
      } else {
        const [relative, absolute] = mainBackImg;
        changeObj.mainBackImg = relative;
        changeObj.mainBackImgUrl = absolute;
      }
    }
    if (startEndBackImg) {
      // ???????????????/????????????????????????
      if (startEndBackImg.length === 0) {
        changeObj.startEndBackImg = undefined;
        changeObj.startEndBackImgUrl = undefined;
      } else {
        const [relative, absolute] = startEndBackImg;
        changeObj.startEndBackImg = relative;
        changeObj.startEndBackImgUrl = absolute;
      }
    }
    if (questionImg) {
      // ????????????
      if (questionImg.length === 0) {
        changeObj.questionImg = undefined;
        changeObj.questionImgUrl = undefined;
      } else {
        const [relative, absolute] = questionImg;
        changeObj.questionImg = relative;
        changeObj.questionImgUrl = absolute;
      }
    }
    // NOTE: ant-design ????????? offer_points_valid_date, ????????????
    const { offer_points_valid_date } = changeObj;
    if (offer_points_valid_date) {
      let { type, period } = offer_points_valid_date;
      type = offer_points_valid_date.selected || type;
      period = offer_points_valid_date.designation || period;
      changeObj.offer_points_valid_date = {
        type,
        period,
      };
    }
    await props.onChange(changeObj);
    props.form.validateFields(changeKeys);
  }
};

@Form.create({
  mapPropsToFields: (props) => {
    const start = props.startTime ? moment(props.startTime) : '';
    const end = props.endTime ? moment(props.endTime) : '';
    let time = [];
    if (start && end) {
      time = [start, end];
    }
    let prizeImg = [];
    if (props.prizeImg && props.prizeImgUrl) {
      prizeImg = [props.prizeImg, props.prizeImgUrl];
    }

    let mainBackImg = [];
    if (props.mainBackImg && props.mainBackImgUrl) {
      mainBackImg = [props.mainBackImg, props.mainBackImgUrl];
    }

    let startEndBackImg = [];
    if (props.startEndBackImg && props.startEndBackImgUrl) {
      startEndBackImg = [props.startEndBackImg, props.startEndBackImgUrl];
    }

    const base = {
      id: Form.createFormField({
        value: props.id,
      }),
      name: Form.createFormField({
        value: props.name || '',
      }),
      color: Form.createFormField({
        value: props.color,
      }),
      documentTitle: Form.createFormField({
        value: props.documentTitle,
      }),
      title: Form.createFormField({
        value: props.title,
      }),
      failTitle: Form.createFormField({
        value: props.failTitle,
      }),
      prizeType: Form.createFormField({
        value: props.prizeType || 1,
      }),
      skuId: Form.createFormField({
        value: props.skuId,
      }),
      prizeNum: Form.createFormField({
        value: props.prizeNum,
      }),
      dailyNum: Form.createFormField({
        value: props.dailyNum,
      }),
      prizeImg: Form.createFormField({
        value: prizeImg,
      }),
      mainBackImg: Form.createFormField({
        value: mainBackImg,
      }),
      startEndBackImg: Form.createFormField({
        value: startEndBackImg,
      }),
      prizeDesc: Form.createFormField({
        value: props.prizeDesc,
      }),
      rules: Form.createFormField({
        value: props.rules,
      }),
      receiveStandard: Form.createFormField({
        value: props.receiveStandard,
      }),
      receiveLimit: Form.createFormField({
        value: props.receiveLimit,
      }),
      area_limit: Form.createFormField({
        value: props.area_limit,
      }),
      points_show_message: Form.createFormField({
        value: props.points_show_message,
      }),
      time: Form.createFormField({
        value: time,
      }),
      offer_points_valid_date: Form.createFormField({
        value: props.offer_points_valid_date,
      }),
      delay_time: Form.createFormField({ value: props.delay_time }),
    };
    if (props.type === 'answer') {
      // ???????????????????????????
      let questionImg = [];
      if (props.questionImg && props.questionImgUrl) {
        questionImg = [props.questionImg, props.questionImgUrl];
      }
      base.questionImg = Form.createFormField({
        value: questionImg,
      });
    }
    return base;
  },
  onValuesChange: debounce(valueChangeFunc, 200),
})
export default class Base extends React.Component {
  static propTypes = {
    id: PropTypes.any,
    imgToken: PropTypes.string,
  };
  static defaultProps = {
    id: null,
    imgToken: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      isSubmiting: false,
      isShowModal: false,
      iframeSrc:
        process.env.environment !== 'production'
          ? 'https://hk01-member-frontend.hktester.com/egg'
          : 'https://hk01-member-frontend.hk01.com/egg',
      previewVisible: false,
      previewImage: '',
      offer_points_valid_date: props.offer_points_valid_date,
      inputPlaceholderConfigs: {
        msg:
          props.prizeType === 1
            ? '?????????????????????????????????sku ID'
            : '??????????????????????????????',
        preferentialType: props.prizeType || 1,
      },
      send_time_status: props.send_time_status,
      defaultPartmentInfo: {
        part2: props.initiate_department,
        part1: props.department_pid,
      },
      offer_account: props.offer_account,
      offer_account_union_id: props.offer_account_union_id,
      accountList: [], // ??????????????????????????????list
      rewardTimeList: props.rewardTimeList || [],
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    // ????????????????????? ???????????????  ?????????
    isFirstDarpmentChange = true;
  }

  checkForm = (btnType) => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields(async (err, values) => {
        // NOTE: ???????????????????????????????????????????????????
        const { failTitle, title } = values;

        if (err) {
          return reject();
        }

        if (!checkTextareaValue(failTitle, 10, 2)) {
          message.error('???????????????????????????????????????');
          return reject();
        }
        if (!checkTextareaValue(title, 10, 2)) {
          message.error('??????????????????????????????');
          return reject();
        }

        if (!this.checkBaseConfigIsValid(values)) {
          return reject();
        }
        return resolve(values);
      });
    });
  };

  checkBaseConfigIsValid(values) {
    const {
      send_time_status,
      defaultPartmentInfo,
      offer_account,
      rewardTimeList,
    } = this.state;
    const { prizeType } = this.props;
    const preferentialType = prizeType || 1;
    const {
      failTitle,
      title,
      documentTitle,
      time,
      offer_points_valid_date,
      name,
      rules,
      prizeDesc,
      skuId,
      delay_time,
    } = values;
    const reg = /[\n\r\s???]/g;
    const ft = failTitle.replace(reg, '');
    if (!ft) {
      message.error('???????????????????????????????????????');
      return false;
    }

    const t = title.replace(reg, '');
    if (!t) {
      message.error('??????????????????????????????');
      return false;
    }

    if (preferentialType === 2 && String(skuId).indexOf('.') > -1) {
      message.error('??????????????????????????????, ?????????????????????');
      return false;
    }
    if (preferentialType === 2 && !defaultPartmentInfo.part2) {
      message.error('?????????????????????');
      return false;
    }
    if (preferentialType === 2 && !offer_account) {
      message.error('???????????????????????????');
      return false;
    }

    if (prizeType === 2) {
      if (!offer_points_valid_date) {
        message.error('????????????????????????');
        return;
      }
      let { type, period } = offer_points_valid_date;
      type = offer_points_valid_date.selected || type;
      period = offer_points_valid_date.designation || period;
      if (!type) {
        message.error('??????????????????????????????');
        return;
      }
      if (!period) {
        message.error('????????????????????????????????????');
        return;
      }
      if (type === 'begin_with' && `${period}`.indexOf('.') > -1) {
        message.error('????????????????????????????????????????????????');
        return;
      }
      // NOTE: ?????? offer_points_valid_date ??????
      offer_points_valid_date.type = type;
      offer_points_valid_date.period = period;
      delete offer_points_valid_date.selected;
      delete offer_points_valid_date.designation;

      const end = moment(time[1].format('YYYY-MM-DD HH:mm:ss'));
      const _period = `${period} 23:59:59`;
      if (type === 'fixed_date') {
        const res = moment(_period).isBefore(end);
        // ????????????: ?????????????????????????????????????????????
        if (send_time_status === 0 && res) {
          message.error('?????????????????????????????????????????????');
          return;
        }
        const r = moment(_period).isBefore(end.add(delay_time || 0, 'd'));
        if (send_time_status === 1 && r) {
          message.error(`?????????????????????????????????????????????${delay_time}???`);
          return;
        }
      }
    }

    const prizeDescTxt = prizeDesc.replace(reg, '');
    if (!prizeDescTxt) {
      message.error('???????????????????????????');
      return false;
    }

    const rulesText = rules.replace(reg, '');
    if (!rulesText) {
      message.error('???????????????????????????');
      return false;
    }

    if (!documentTitle.trim()) {
      message.error('???????????????????????????');
      return false;
    }

    if (!name.trim()) {
      message.error('??????????????????????????????');
      return false;
    }

    if (typeof send_time_status === 'undefined') {
      message.error('???????????????????????????');
      return false;
    }
    if (send_time_status === 1) {
      if (!delay_time) {
        message.error('???????????????????????????');
        return false;
      }
      if (delay_time <= 0 || `${delay_time}`.indexOf('.') > -1) {
        message.error('????????????????????????????????????');
        return false;
      }
    }

    const startTime = moment(time[0].format('YYYY-MM-DD HH:mm:ss'));
    const endTime = moment(time[1].format('YYYY-MM-DD HH:mm:ss'));

    for (let i = 0; i < rewardTimeList.length; i += 1) {
      if (!rewardTimeList[i].begin || !rewardTimeList[i].end) {
        message.error('????????????????????????????????????');
        return false;
      }
      if (
        !startTime.isBefore(rewardTimeList[i].begin) ||
        endTime.isBefore(rewardTimeList[i].end)
      ) {
        message.error('????????????????????????????????????????????????????????????');
        return false;
      }
    }
    return true;
  }
  // ????????????
  handlePreview = (file) => {
    if (this.state.listType !== 'text') {
      this.setState({
        previewImage: file.url || file.thumbUrl,
        previewVisible: true,
      });
    }
  };
  // ??????????????????
  handleCancel = () => this.setState({ previewVisible: false });

  selectChangeHandle = (v) => {
    // this.props.form.setFieldsValue({ prizeType: v });
    if (v === 2) {
      this.setState({
        inputPlaceholderConfigs: {
          msg: '??????????????????????????????',
          preferentialType: v,
        },
      });
    } else {
      this.setState({
        inputPlaceholderConfigs: {
          msg: '?????????????????????????????????sku ID',
          preferentialType: v,
        },
      });
    }
  };

  customCheckDate = (rule, value, callback) => {
    if (value && value.length) {
      if (value[1].isBefore(Date.now())) {
        callback('????????????????????????????????????');
        return;
      }
    }
    callback();
  };

  handleChangeValidTime = (validTime) => {
    const { form } = this.props;
    let { offer_points_valid_date } = this.state;
    const { selected: type, designation: period } = validTime;
    offer_points_valid_date = {
      type,
      period,
    };
    form.setFieldsValue({ offer_points_valid_date });
    this.setState({ offer_points_valid_date });
  };

  inputNumberChangeAction = (value) => {
    this.setState({ send_time_status: 1 });
    this.props.form.setFieldsValue({ delay_time: value });
  };

  handleRadioChange = (value) => {
    this.setState({ send_time_status: value });
    // this.props.form.setFieldsValue({ send_time_status: value });
  };

  getSendTimeStatus = () => {
    return this.state.send_time_status;
  };

  checkDisableModifyRewardTime = () => {
    const { online_times, send_time_status } = this.props;
    // online_times ?????? 0 ????????????????????????
    if (online_times > 0 && send_time_status === 1) {
      return true;
    }
    return false;
  };

  /**
   * ??????????????????
   * @param {value} value
   */
  departmentChanageAction(value) {
    this.setState({
      defaultPartmentInfo: {
        part1: '',
        part2: value,
      },
    });
    this.props.onChangeParam({
      department_pid: '',
      initiate_department: value,
    });
    this.fetchAccountNameByDepartment(value);
  }

  // ???????????????????????????????????????
  async fetchAccountNameByDepartment(pid) {
    const res = await fetchAccountByDepartment({
      department: pid,
      is_filter: 1,
    });
    if (res.data.status && res.data.data) {
      const list = res.data.data.list || [];
      this.setState({
        accountList: list,
        offer_account: isFirstDarpmentChange ? this.state.offer_account : '',
        offer_account_union_id: isFirstDarpmentChange
          ? this.state.offer_account_union_id
          : '',
      });
      this.props.onChangeParam({
        offer_account: isFirstDarpmentChange ? this.state.offer_account : '',
        offer_account_union_id: isFirstDarpmentChange
          ? this.state.offer_account_union_id
          : '',
      });
      isFirstDarpmentChange = false;
    }
  }

  // ?????????????????? ??????
  accountChangeAction(value) {
    const obj = this.state.accountList.find((item, index, arr) => {
      return item.id == value;
    });
    this.props.onChangeParam({
      offer_account: value,
      offer_account_union_id: obj.union_id,
    });
    this.setState({
      offer_account: value,
      offer_account_union_id: obj.union_id,
    });
  }

  removeRewardTime = (k) => {
    const { rewardTimeList } = this.state;
    const newData = [...rewardTimeList];
    newData.splice(k, 1);
    this.setState({
      rewardTimeList: newData,
    });
    this.props.onChangeParam({
      rewardTimeList: newData,
    });
  };

  addRewardTime = (k) => {
    const { rewardTimeList } = this.state;
    this.setState({
      rewardTimeList: [
        ...rewardTimeList,
        { begin: null, end: null, type: 'new' },
      ],
    });
  };

  onRewardTimeChange = (date, dateString, index) => {
    const { rewardTimeList } = this.state;
    const newArr = rewardTimeList.slice();
    newArr[index].begin = dateString[0];
    newArr[index].end = dateString[1];
    this.setState({
      rewardTimeList: newArr,
    });
    this.props.onChangeParam({
      rewardTimeList: newArr,
    });
  };

  checkPrice = (rule, value, callback) => {
    const prizeNum = this.props.form.getFieldValue('prizeNum');
    const rex = /^\d+$/;
    const result = rex.test(value.daily_total);
    if (!result) {
      return callback('???????????????????????????????????????');
    }
    if (value.check && value.daily_total === 0) {
      return callback('???????????????????????????????????????');
    }
    if (value.daily_total > prizeNum) {
      return callback('????????????????????????????????????');
    }
    // if (
    //   value.daily_total > 0 &&
    //   (value.daily_reset_time === '' || value.daily_reset_time === undefined)
    // ) {
    //   return callback('???????????????????????????');
    // }
    callback();
  };

  render() {
    const {
      offer_account,
      accountList,
      previewVisible,
      previewImage,
      inputPlaceholderConfigs: { msg, preferentialType },
      offer_points_valid_date,
      send_time_status,
      rewardTimeList,
    } = this.state;
    const { form, id, type, editable, action, online_times } = this.props;
    const { getFieldDecorator } = form;

    const prizeNum = this.props.form.getFieldValue('prizeNum');

    // ???????????????????????? option
    const accountOptions = accountList.map((item) => {
      return (
        <Option key={item.id} value={item.id}>
          {item.account_name}
        </Option>
      );
    });
    const rewardTimeItemList = rewardTimeList.map((item, index) => {
      return (
        <div
          style={{
            width: '100%',
            position: 'relative',
          }}
          key={index}
        >
          <RangePicker
            value={item.begin ? [moment(item.begin), moment(item.end)] : null}
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%' }}
            disabled={
              !editable ||
              (!item.type && moment(item.begin).isBefore(Date.now()))
            }
            onChange={(...arg) => {
              this.onRewardTimeChange(...arg, index);
            }}
          />
          {editable &&
          (!moment(item.begin).isBefore(Date.now()) || item.type === 'new') ? (
            <div
              onClick={() => this.removeRewardTime(index)}
              style={{
                cursor: 'pointer',
                width: 100,
                position: 'absolute',
                right: -100,
                bottom: 0,
                paddingLeft: 10,
              }}
            >
              <Icon className="dynamic-delete-button" type="close" />
              <span style={{ mraginLeft: 8 }}>??????</span>
            </div>
          ) : null}
        </div>
      );
    });

    const rewardTimeAddBtn = () => {
      if (rewardTimeList.length >= 50) {
        return null;
      }
      if (editable) {
        return (
          <Button
            type="dashed"
            onClick={() => this.addRewardTime()}
            style={{ width: '100%' }}
          >
            <Icon type="plus" /> ???????????????
          </Button>
        );
      }
      return (
        <Button
          disabled
          type="dashed"
          onClick={() => this.addRewardTime()}
          style={{ width: '100%' }}
        >
          <Icon type="plus" /> ???????????????
        </Button>
      );
    };

    const rule =
      preferentialType === 1
        ? [{ required: true, message: msg }]
        : [{ required: true, message: msg, pattern: /^\d*$/g }];
    return (
      <React.Fragment>
        <Form labelAlign="left">
          {id ? (
            <FormItem {...formItemLayout} label="????????????">
              <p>{id}</p>
            </FormItem>
          ) : null}
          <FormItem
            {...formItemLayout}
            label="??????????????????"
            style={{ position: 'relative' }}
          >
            {getFieldDecorator('name', {
              rules: [
                {
                  pattern: /^[^-]*$/g,
                  message: '??????????????????"-"?????? ',
                },
                { required: true, message: '???????????????????????????' },
              ],
            })(
              <Input
                placeholder="???????????????????????????"
                maxLength={20}
                disabled={!editable}
              />
            )}
            <span
              className="text"
              style={{
                position: 'absolute',
                right: -510,
                width: 500,
              }}
            >
              {'??????????????????"-"??????'}
            </span>
          </FormItem>
          <FormItem {...formItemLayout} label="??????????????????">
            {getFieldDecorator('color', {
              rules: [{ required: true, message: '???????????????????????????' }],
            })(<BgColor disabled={!editable} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="???????????????">
            {getFieldDecorator('documentTitle', {
              rules: [{ required: true, message: '?????????????????????????????????' }],
            })(
              <Input
                maxLength={16}
                placeholder="?????????????????????????????????(?????????16?????????)"
                disabled={!editable}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="???????????????">
            {getFieldDecorator('title', {
              rules: [{ required: true, message: '????????????????????????????????????' }],
            })(
              <TextArea
                rows={3}
                cols={10}
                placeholder="????????????????????????????????????(??????10?????????,?????????20?????????)?????????enter??????????????????"
                disabled={!editable}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="????????????????????????">
            {getFieldDecorator('failTitle', {
              rules: [
                { required: true, message: '??????????????????????????????????????????' },
              ],
            })(
              <TextArea
                rows={3}
                cols={10}
                placeholder="??????????????????????????????????????????(??????10?????????,?????????20?????????)?????????enter??????????????????"
                disabled={!editable}
              />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="????????????"
            style={{ position: 'relative' }}
          >
            {getFieldDecorator('prizeType', {
              rules: [{ required: true, message: '???????????????' }],
            })(
              <Select
                onChange={this.selectChangeHandle}
                disabled={
                  action === 'look' || (action === 'edit' && online_times > 0)
                }
              >
                <Option value={1}>?????????</Option>
                <Option value={2}>??????</Option>
              </Select>
            )}
            <span
              className="text"
              style={{
                position: 'absolute',
                right: -510,
                width: 500,
              }}
            >
              ?????????????????????????????????????????????
            </span>
          </FormItem>
          <FormItem {...formItemWithOutLabel}>
            {getFieldDecorator('skuId', {
              rules: rule,
            })(
              preferentialType === 1 ? (
                <Input
                  placeholder="??????????????????SKU ID"
                  maxLength={50}
                  disabled={!editable || this.checkDisableModifyRewardTime()}
                />
              ) : (
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="?????????????????????????????????????????????"
                  min={1}
                  step={1}
                  disabled={!editable || this.checkDisableModifyRewardTime()}
                />
              )
            )}
          </FormItem>
          {preferentialType === 2 ? (
            <React.Fragment>
              <FormItem
                {...formItemLayout}
                label="????????????"
                style={{ position: 'relative' }}
                className="insert-red-star"
              >
                {/* <BelongDepartment
                  disabled={!editable}
                  defaultValue={this.state.defaultPartmentInfo}
                  style={{
                    width: 'calc(50% - 5px)',
                  }}
                  onChange={this.departmentChanageAction.bind(this)}
                /> */}
                <PartmentTreeSelect
                  disabled={!editable}
                  value={this.state.defaultPartmentInfo.part2}
                  onChange={this.departmentChanageAction.bind(this)}
                  partmentList={this.props.partmentList}
                />
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="??????????????????"
                style={{ position: 'relative' }}
                className="insert-red-star"
              >
                <Select
                  disabled={!editable}
                  style={{ width: '100%' }}
                  onChange={(value) => this.accountChangeAction(value)}
                  defaultValue={offer_account}
                  value={offer_account}
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  {accountOptions}
                </Select>
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="???????????????"
                style={{ position: 'relative' }}
              >
                {getFieldDecorator('offer_points_valid_date', {
                  rules: [{ required: true, message: '????????????????????????' }],
                  initialValue: offer_points_valid_date,
                  valuePropName: 'offer_points_valid_date',
                })(
                  <IntegralValidTime
                    onChange={this.handleChangeValidTime}
                    selected={offer_points_valid_date.type}
                    designation={offer_points_valid_date.period}
                    disabled={!editable}
                  />
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="??????????????????????????????">
                {getFieldDecorator('points_show_message', {
                  rules: [
                    { required: true, message: '?????????????????????????????????' },
                  ],
                })(
                  <Input
                    maxLength={16}
                    placeholder="?????????????????????????????????"
                    disabled={!editable}
                  />
                )}
              </FormItem>
            </React.Fragment>
          ) : (
            ''
          )}
          <FormItem {...formItemLayout} label="????????????">
            {getFieldDecorator('prizeNum', {
              rules: [
                {
                  required: true,
                  message: '?????????????????????????????????',
                  pattern: /^\d*$/g,
                },
              ],
            })(<PrizeNum disabled={!editable} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="??????????????????"
            className="insert-red-star"
          >
            {getFieldDecorator('dailyNum', {
              rules: [{ validator: this.checkPrice }],
            })(<DailyNum disabled={!editable || prizeNum === 0} />)}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="????????????????????????"
            style={{ marginBottom: 10 }}
          >
            {getFieldDecorator('mainBackImg', {
              rules: [],
            })(
              <SpeImg
                minWidth={375}
                maxWidth={375}
                minHeight={1334}
                maxHeight={1334}
                token={this.props.imgToken}
                disabled={!editable}
                id="prizeImg3"
              />
            )}
          </FormItem>
          <FormItem style={{ marginBottom: 24 }} {...formItemWithOutLabel}>
            <span style={{ color: 'rgb(24, 144, 255)' }}>
              ??????????????????375*1334px???jpg???png???jpeg????????????
            </span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="???????????????/????????????????????????"
            style={{ marginBottom: 10 }}
          >
            {getFieldDecorator('startEndBackImg', {
              rules: [],
            })(
              <SpeImg
                minWidth={375}
                maxWidth={375}
                minHeight={599}
                maxHeight={599}
                token={this.props.imgToken}
                disabled={!editable}
                id="prizeImg2"
              />
            )}
          </FormItem>
          <FormItem style={{ marginBottom: 24 }} {...formItemWithOutLabel}>
            <span style={{ color: 'rgb(24, 144, 255)' }}>
              ??????????????????375*599px???jpg???png???jpeg????????????
            </span>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="????????????"
            style={{ marginBottom: 10 }}
          >
            {getFieldDecorator('prizeImg', {
              rules: [
                { type: 'array', required: true, message: '?????????????????????' },
              ],
            })(
              <SpeImg
                token={this.props.imgToken}
                disabled={!editable}
                id="prizeImg1"
              />
            )}
          </FormItem>
          <FormItem style={{ marginBottom: 24 }} {...formItemWithOutLabel}>
            <span style={{ color: 'rgb(24, 144, 255)' }}>
              ??????????????????1029*342px???jpg???png???jpeg????????????
            </span>
          </FormItem>

          {type === 'answer' ? (
            <React.Fragment>
              <FormItem
                {...formItemLayout}
                label="??????????????????"
                style={{ marginBottom: 10 }}
              >
                {getFieldDecorator('questionImg', {
                  rules: [
                    {
                      type: 'array',
                      required: true,
                      message: '???????????????????????????',
                    },
                  ],
                })(
                  <SpeImg
                    token={this.props.imgToken}
                    disabled={!editable}
                    minHeight={684}
                    maxHeight={684}
                    id="answerImg1"
                  />
                )}
              </FormItem>
              <FormItem style={{ marginBottom: 24 }} {...formItemWithOutLabel}>
                <span style={{ color: 'rgb(24, 144, 255)' }}>
                  ??????????????????1029*684px???jpg???png???jpeg????????????
                </span>
              </FormItem>
            </React.Fragment>
          ) : null}
          <FormItem {...formItemLayout} label="????????????">
            {getFieldDecorator('prizeDesc', {
              rules: [
                { required: true, message: '?????????????????????' },
                { max: 45, message: '?????????????????????45???' },
              ],
            })(
              <TextArea
                rows={5}
                placeholder="??????????????????????????????enter??????????????????"
                disabled={!editable}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="????????????">
            {getFieldDecorator('rules', {
              rules: [
                { required: true, message: '?????????????????????' },
                { max: 1000, message: '???????????????????????????1000' },
              ],
            })(
              <TextArea
                rows={8}
                placeholder="??????????????????????????????enter??????????????????"
                disabled={!editable}
              />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="????????????">
            {getFieldDecorator('receiveStandard', {
              rules: [{ required: true, message: '?????????????????????' }],
            })(
              <RadioGroup disabled={!editable}>
                {ruleList.map((item, index) => {
                  return (
                    <Radio key={index} value={item.key}>
                      {item.label}
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="?????????????????????????????????">
            {getFieldDecorator('receiveLimit', {
              rules: [{ required: true, message: '???????????????????????????' }],
            })(
              <RadioGroup disabled={!editable}>
                {limitList.map((item, index) => {
                  return (
                    <Radio key={index} value={item.key}>
                      {item.label}
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="????????????????????????">
            {getFieldDecorator('area_limit', {
              rules: [{ required: true, message: '???????????????????????????' }],
            })(
              <RadioGroup disabled={!editable}>
                {areaLimitList.map((item, index) => {
                  return (
                    <Radio key={index} value={item.key}>
                      {item.label}
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="??????????????????"
            className="insert-red-star"
          >
            <div>
              <RadioGroup
                onChange={(e) => {
                  this.handleRadioChange(e.target.value);
                }}
                disabled={!editable || this.checkDisableModifyRewardTime()}
                value={send_time_status}
              >
                <Radio value={0}>????????????</Radio>
                <Radio value={1}>
                  <span className="text" style={{ paddingRight: '10px' }}>
                    ????????????
                  </span>
                  {getFieldDecorator('delay_time')(
                    <InputToolTipCom
                      disabled={
                        !editable || this.checkDisableModifyRewardTime()
                      }
                      min={0}
                      step={1}
                      onChange={(value) => this.inputNumberChangeAction(value)}
                    />
                  )}
                  <span
                    style={{ paddingLeft: '10px', fontSize: '12px' }}
                    className="hint"
                  >
                    ?????????????????????????????????n+1???00:00:01??????????????????????????????????????????????????????????????????????????????????????????
                  </span>
                </Radio>
              </RadioGroup>
            </div>
          </FormItem>
          <FormItem {...formItemLayout} label="??????????????????">
            {getFieldDecorator('time', {
              rules: [
                {
                  type: 'array',
                  required: true,
                  message: '???????????????????????????',
                },
                { validator: this.customCheckDate },
              ],
            })(
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
                disabled={!editable}
              />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="????????????????????????"
            style={{ position: 'relative' }}
            className="insert-red-star"
          >
            {rewardTimeItemList}
            {rewardTimeAddBtn()}
          </FormItem>
        </Form>
        <Modal
          visible={previewVisible}
          width={680}
          footer={null}
          onCancel={this.handleCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </React.Fragment>
    );
  }
}
