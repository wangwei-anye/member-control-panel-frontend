/* eslint-disable react/jsx-closing-tag-location */
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Form,
  Card,
  Input,
  DatePicker,
  Button,
  Select,
  message,
  Modal,
  Checkbox,
  InputNumber
} from 'antd';
import moment from 'moment';
import {
  getDetail,
  createPackage,
  updatePackage
} from 'services/equitiesPackage';
import AuthWrapCom from 'components/AuthCom';
import { isUserHasRights } from 'utils/tools';
import Coupon from './components/coupon.js';
import Points from './components/points.js';
import HistoryList from './historyList.js';

import './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const { RangePicker } = DatePicker;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 7 }
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 18,
      offset: 4
    },
    sm: {
      span: 18,
      offset: 4
    }
  }
};
const Option = Select.Option;
class DetailPage extends React.Component {
  constructor(props) {
    super(props);
    this.editType = props.system.query.action || '';
    this.btnClickType = 'save';
    this.state = {
      isDisabledEdit: this.editType === 'look',
      isStatusStart: false,
      isDisabledEditAfterPublic: this.editType === 'create' ? false : true,
      lastTotalAmount: 0,
      offerLimit: true,
      offer_limit_help: '',
      offer_limit_validateStatus: '',
      detail: {},
      giftList: [
        {
          type: '0',
          data: {}
        }
      ],
      isShowCoupon: false,
      isShowPoints: false,
      isSubmiting: false,
      isLoading: false,
      tab: '1',
      modalIndex: 0,
      modalData: {},
      homePageMaxLen: 34,
      navigationTitleLen: 16,
      packageNameLen: 20,
      successfullyRedeemedMessageLen: 18,
      copywritingBeforeActivityLen: 24,
      copywritingAfterActivityLen: 24
    };
    this.isInput = false; // 是否打開輸入法
    this.homePageTitle = '';
    this.navigationTitle = '';
    this.packageName = '';
    this.successfully_redeemed_message = '';
    this.copywriting_before_activity = '';
    this.copywriting_after_activity = '';
    this.IntervalId = null;
  }

  async componentWillMount() {
    const { params } = this.props.system;
    if (params.id) {
      const {
        data: { data, status }
      } = await getDetail({ offer_package_id: params.id });
      if (status && data) {
        this.setState({
          detail: data,
          isDisabledEditAfterPublic:
            this.editType !== 'look' && data.status === 0 ? false : true,
          lastTotalAmount: data.total_amount,
          isStatusStart: data.status === 0 ? false : true
        });
        this.homePageTitle = data.home_page_title;
        this.navigationTitle = data.navigation_title;
        this.packageName = data.package_name;
        this.successfully_redeemed_message = data.successfully_redeemed_message;
        this.copywriting_before_activity = data.copywriting_before_activity;
        this.copywriting_after_activity = data.copywriting_after_activity;

        const giftList = [];
        if (data.coupon_list) {
          for (let i = 0; i < data.coupon_list.length; i += 1) {
            data.coupon_list[i].coupon_icon_image_url = [
              data.coupon_list[i].coupon_icon_image_url,
              data.coupon_list[i].coupon_icon_image_url_show
            ];
            giftList.push({
              type: '1',
              data: data.coupon_list[i]
            });
          }
        }
        if (data.offer_entry) {
          data.offer_entry.fileName = data.offer_entry.file_name;
          giftList.push({
            type: '2',
            data: data.offer_entry
          });
        }
        this.setState({
          giftList
        });
      }
    }
  }

  componentDidMount() {
    window.addEventListener(
      'compositionstart',
      e => {
        this.isInput = true;
      },
      false
    );

    window.addEventListener(
      'compositionend',
      e => {
        this.isInput = false;
      },
      false
    );
  }

  onCancel = () => {
    this.props.history.go(-1);
  };

  btnClick = type => {
    this.btnClickType = type;
    this.handleSubmit();
  };

  handleSubmit = () => {
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        if (
          !values.limit_check &&
          (!values.offer_limit ||
            values.offer_limit === '' ||
            values.offer_limit === null)
        ) {
          this.setState({
            offer_limit_help: '請輸入份數',
            offer_limit_validateStatus: 'error'
          });
          return;
        }
        if (this.state.isDisabledEditAfterPublic) {
          if (this.state.lastTotalAmount > values.total_amount) {
            message.error('權益包總份數只能增加');
            return;
          }
        }
        if (values.time) {
          values.start_time = moment(values.time[0])
            .set({ second: 0 })
            .format('YYYY-MM-DD HH:mm:ss');
          values.end_time = moment(values.time[1])
            .set({ second: 59 })
            .format('YYYY-MM-DD HH:mm:ss');
          delete values.time;
        }
        if (new Date(values.start_time) * 1 >= new Date(values.end_time) * 1) {
          message.error('開始時間不能大於結束時間');
          return;
        }
        let newStatus = 0;
        if (this.state.detail.status) {
          newStatus = this.state.detail.status;
        }
        values.status = this.btnClickType === 'save' ? newStatus : 1;
        const coupon_list = [];
        const offer_entry = {};
        let hasCoupon = false;
        let hasOffer = false;
        for (let i = 0; i < this.state.giftList.length; i += 1) {
          if (this.state.giftList[i].type === '0') {
            message.error('請選擇獎品內容！');
            return;
          }
          if (
            !this.state.giftList[i].data.coupon_icon_image_url &&
            !this.state.giftList[i].data.approval_annex
          ) {
            message.error('請填寫獎品內容！');
            return;
          }
          if (this.state.giftList[i].type === '1') {
            const couponData = {};
            couponData.coupon_name = this.state.giftList[i].data.coupon_name;
            couponData.coupon_sku_id = this.state.giftList[
              i
            ].data.coupon_sku_id;
            couponData.rule_description = this.state.giftList[
              i
            ].data.rule_description;
            couponData.date_of_use_description = this.state.giftList[
              i
            ].data.date_of_use_description;
            couponData.coupon_icon_image_url = this.state.giftList[
              i
            ].data.coupon_icon_image_url[0];
            coupon_list.push(couponData);
            hasCoupon = true;
          } else if (this.state.giftList[i].type === '2') {
            offer_entry.initiate_department = this.state.giftList[
              i
            ].data.initiate_department;
            offer_entry.remain_title = this.state.giftList[i].data.remain_title;
            offer_entry.department_pid = this.state.giftList[
              i
            ].data.department_pid;
            offer_entry.remain_title = this.state.giftList[i].data.remain_title;
            offer_entry.offer_account = this.state.giftList[
              i
            ].data.offer_account;
            offer_entry.points = this.state.giftList[i].data.points;
            offer_entry.offer_account_union_id = this.state.giftList[
              i
            ].data.offer_account_union_id;
            offer_entry.offer_points_valid_date = this.state.giftList[
              i
            ].data.offer_points_valid_date;
            offer_entry.file_name = this.state.giftList[i].data.fileName;
            offer_entry.approval_annex = this.state.giftList[
              i
            ].data.approval_annex;
            hasOffer = true;
          }
        }
        if (values.limit_check) {
          values.offer_limit = 0;
          delete values.limit_check;
        }
        if (values.offer_limit > values.total_amount) {
          message.error('兌換數量不能大於總份數');
          return;
        }
        if (hasCoupon) {
          values.coupon_list = coupon_list;
        }
        if (hasOffer) {
          values.offer_entry = offer_entry;
        }

        if (!hasCoupon && !hasOffer) {
          message.error('獎品內容不能爲空！');
          return;
        }
        this.setState({
          isSubmiting: true
        });
        const { params } = this.props.system;
        if (params.id) {
          values.offer_package_id = parseInt(params.id, 0);
          const { data } = await updatePackage(values);
          if (data && data.status) {
            this.props.history.push('/equities_package/list');
          }
        } else {
          const { data } = await createPackage(values);
          if (data && data.status) {
            this.props.history.push('/equities_package/list');
          }
        }
        this.setState({
          isSubmiting: false
        });
      }
    });
  };
  giftChange = (index, e) => {
    const giftList = [
      ...this.state.giftList.slice(0, index),
      { type: e, data: {} },
      ...this.state.giftList.slice(index + 1)
    ];
    this.setState({
      giftList
    });
  };

  giftDelete = index => {
    const { giftList } = this.state;
    if (giftList.length <= 1) {
      message.error('獎品設置必須保留一個');
      return;
    }
    giftList.splice(index, 1);
    this.setState({
      giftList
    });
  };
  addGift = () => {
    const { giftList } = this.state;
    if (giftList.length >= 10) {
      message.error('獎品配置最多配置10項');
      return;
    }
    this.setState({
      giftList: this.state.giftList.concat({ type: '0', data: {} })
    });
  };

  showModal = (type, index) => {
    this.setState({
      modalIndex: index,
      modalData: this.state.giftList[index].data
    });
    if (type === '1') {
      this.setState({
        isShowCoupon: true
      });
    } else {
      this.setState({
        isShowPoints: true
      });
    }
  };

  saveModal = data => {
    const giftList = [
      ...this.state.giftList.slice(0, this.state.modalIndex),
      { type: this.state.giftList[this.state.modalIndex].type, data },
      ...this.state.giftList.slice(this.state.modalIndex + 1)
    ];
    this.setState({
      giftList
    });
  };

  hideModal = type => {
    if (type === '1') {
      this.setState({
        isShowCoupon: false
      });
    } else {
      this.setState({
        isShowPoints: false
      });
    }
  };

  changeTab = key => {
    this.setState({ tab: key });
  };

  handleChange = e => {
    this.setState({
      offerLimit: !e.target.checke
    });
    this.props.form.setFieldsValue({ offer_limit: '' });
  };

  changeHomePageTitle = e => {
    this.homePageTitle = e.target.value;
    const trueLen = this.homePageTitle.length;
    const obj = this.getStringLengthForChinese(this.homePageTitle);
    const showLen = obj.len;
    const bytesCount = obj.bytesCount;
    if (showLen >= 17) {
      if (bytesCount % 2 === 0) {
        this.setState({
          homePageMaxLen: trueLen
        });
      }
    } else {
      this.setState({
        homePageMaxLen: 34
      });
    }
  };

  changeNavigationTitle = e => {
    this.navigationTitle = e.target.value;
    const trueLen = this.navigationTitle.length;
    const obj = this.getStringLengthForChinese(this.navigationTitle);
    const showLen = obj.len;
    const bytesCount = obj.bytesCount;
    if (showLen >= 8) {
      if (showLen % 2 === 0) {
        this.setState({
          navigationTitleLen: trueLen
        });
      }
    } else {
      this.setState({
        navigationTitleLen: 16
      });
    }
  };

  changePackageName = e => {
    this.packageName = e.target.value;
    const trueLen = this.packageName.length;
    const obj = this.getStringLengthForChinese(this.packageName);
    const showLen = obj.len;
    const bytesCount = obj.bytesCount;
    if (showLen >= 10) {
      if (bytesCount % 2 === 0) {
        this.setState({
          packageNameLen: trueLen
        });
      }
    } else {
      this.setState({
        packageNameLen: 20
      });
    }
  };

  changesuccessfullyRedeemedMessage = e => {
    this.successfully_redeemed_message = e.target.value;
    const trueLen = this.successfully_redeemed_message.length;
    const obj = this.getStringLengthForChinese(
      this.successfully_redeemed_message
    );
    const showLen = obj.len;
    const bytesCount = obj.bytesCount;

    if (showLen >= 9) {
      if (bytesCount % 2 === 0) {
        this.setState({
          successfullyRedeemedMessageLen: trueLen
        });
      }
    } else {
      this.setState({
        successfullyRedeemedMessageLen: 18
      });
    }
  };

  changeCopywritingBeforeActivity = e => {
    this.copywriting_before_activity = e.target.value;
    const trueLen = this.copywriting_before_activity.length;
    const obj = this.getStringLengthForChinese(
      this.copywriting_before_activity
    );
    const showLen = obj.len;
    const bytesCount = obj.bytesCount;

    if (showLen >= 12) {
      if (bytesCount % 2 === 0) {
        this.setState({
          copywritingBeforeActivityLen: trueLen
        });
      }
    } else {
      this.setState({
        copywritingBeforeActivityLen: 24
      });
    }
  };

  changecopywritingAfterActivity = e => {
    this.copywriting_after_activity = e.target.value;
    const trueLen = this.copywriting_after_activity.length;
    const obj = this.getStringLengthForChinese(this.copywriting_after_activity);
    const showLen = obj.len;
    const bytesCount = obj.bytesCount;

    if (showLen >= 12) {
      if (bytesCount % 2 === 0) {
        this.setState({
          copywritingAfterActivityLen: trueLen
        });
      }
    } else {
      this.setState({
        copywritingAfterActivityLen: 24
      });
    }
  };

  inputOnFocus = e => {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
    this.IntervalId = setInterval(() => {
      let value = this.homePageTitle;
      if (this.isInput) {
        return;
      }
      const arrRow = value.split('\n');
      if (arrRow.length > 2) {
        arrRow.length = 2;
        value = arrRow.join('\n');
      }
      if (!value.includes('\n')) {
        const valueLen = this.getStringLengthForChinese(value).len;
        if (valueLen > 8) {
          value =
            this.subStringLengthForChinese(value, 0, 8) +
            '\n' +
            this.subStringLengthForChinese(value, 8, 8);
        }
      } else {
        const arrRow2 = value.split('\n');
        // console.log(arrRow2);
        arrRow2[0] = this.subStringLengthForChinese(
          arrRow2[0],
          0,
          Math.min(8, this.getStringLengthForChinese(arrRow2[0]).len)
        );
        arrRow2[1] = this.subStringLengthForChinese(
          arrRow2[1],
          0,
          Math.min(8, this.getStringLengthForChinese(arrRow2[1]).len)
        );
        // console.log(arrRow2);
        value = arrRow2.join('\n');
      }

      this.props.form.setFieldsValue({ home_page_title: value });
    }, 500);
  };

  inputOnFocusNavigationTitle = e => {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
    this.IntervalId = setInterval(() => {
      let value = this.navigationTitle;
      if (this.isInput) {
        return;
      }
      value = this.subStringLengthForChinese(value, 0, 8);
      this.props.form.setFieldsValue({ navigation_title: value });
    }, 500);
  };

  inputOnFocusPackageName = e => {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
    this.IntervalId = setInterval(() => {
      let value = this.packageName;
      if (this.isInput) {
        return;
      }
      value = this.subStringLengthForChinese(value, 0, 10);
      this.props.form.setFieldsValue({ package_name: value });
    }, 500);
  };

  inputOnFocussuccessfullyRedeemedMessage = e => {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
    this.IntervalId = setInterval(() => {
      let value = this.successfully_redeemed_message;
      if (this.isInput) {
        return;
      }
      value = this.subStringLengthForChinese(value, 0, 9);
      this.props.form.setFieldsValue({ successfully_redeemed_message: value });
    }, 500);
  };

  inputOnFocuscopywritingBeforeActivity = e => {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
    this.IntervalId = setInterval(() => {
      let value = this.copywriting_before_activity;
      if (this.isInput) {
        return;
      }
      value = this.subStringLengthForChinese(value, 0, 12);
      this.props.form.setFieldsValue({ copywriting_before_activity: value });
    }, 500);
  };

  inputOnFocuscopywritingAfterActivity = e => {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
    this.IntervalId = setInterval(() => {
      let value = this.copywriting_after_activity;
      if (this.isInput) {
        return;
      }
      value = this.subStringLengthForChinese(value, 0, 12);
      this.props.form.setFieldsValue({ copywriting_after_activity: value });
    }, 500);
  };

  inputOnBlur = e => {
    if (this.IntervalId) {
      clearInterval(this.IntervalId);
    }
  };

  // 截取字符串   字母數字2個算一個長度
  subStringLengthForChinese = (val, start, end) => {
    end = start + end;
    let bytesCount = 0;
    let trueStart = -1;
    let trueEnd = -1;
    let count = 0;
    for (let i = 0, n = val.length; i < n; i += 1) {
      if (bytesCount >= start * 2 && trueStart === -1) {
        trueStart = count;
      }
      const c = val.charCodeAt(i);
      if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
        count += 1;
        bytesCount += 1;
      } else {
        count += 1;
        bytesCount += 2;
      }
      if (bytesCount == end * 2 && trueEnd === -1) {
        trueEnd = count;
        break;
      }
      if (bytesCount > end * 2 && trueEnd === -1) {
        trueEnd = count - 1;
        break;
      }
    }
    // console.log(val);
    // console.log('start' + start);
    // console.log('end' + end);
    // console.log('trueStart' + trueStart);
    // console.log('trueEnd' + trueEnd);
    if (trueStart === -1) {
      trueStart = 0;
    }
    if (trueEnd === -1) {
      trueEnd = val.length;
    }
    trueEnd -= trueStart;
    return val.substr(trueStart, trueEnd);
  };

  // 獲取字符串長度   字母數字2個算一個長度
  getStringLengthForChinese = val => {
    let bytesCount = 0;
    for (let i = 0, n = val.length; i < n; i += 1) {
      const c = val.charCodeAt(i);
      if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
        bytesCount += 1;
      } else {
        bytesCount += 2;
      }
    }
    return {
      len: (bytesCount / 2).toFixed(0),
      bytesCount
    };
  };

  render() {
    const pointsGift = this.state.giftList.filter(item => {
      return item.type === '2';
    });
    const { id } = this.props.system.params;
    const { getFieldDecorator } = this.props.form;
    const {
      detail,
      isStatusStart,
      isDisabledEdit,
      isDisabledEditAfterPublic,
      isSubmiting,
      isLoading,
      tab,
      offerLimit,
      offer_limit_help,
      offer_limit_validateStatus,
      homePageMaxLen,
      navigationTitleLen,
      packageNameLen,
      successfullyRedeemedMessageLen,
      copywritingBeforeActivityLen,
      copywritingAfterActivityLen
    } = this.state;
    const giftListRender = this.state.giftList.map((item, index) => {
      return (
        <FormItem
          labelCol={index === 0 ? { span: 4 } : null}
          wrapperCol={index === 0 ? { span: 18 } : { span: 18, offset: 4 }}
          label={index === 0 ? '獎品設置' : ''}
          key={index}
          className="insert-red-star"
        >
          <Select
            style={{ width: 220 }}
            value={item.type}
            disabled={isDisabledEditAfterPublic}
            onChange={this.giftChange.bind(this, index)}
          >
            <Option value="0">請選擇獎品類型</Option>
            <Option value="1">優惠券</Option>
            {item.type === '2' || pointsGift.length === 0 ? (
              <Option value="2">積分</Option>
            ) : null}
          </Select>
          {item.type === '0' ? null : (
            <Button
              style={{ width: 170, marginLeft: 20 }}
              className="btn"
              type="primary"
              onClick={this.showModal.bind(this, item.type, index)}
            >
              {item.type === '1' ? '配置優惠券' : '配置發分規則'}
            </Button>
          )}
          {this.state.giftList.length > 0 && !isDisabledEditAfterPublic ? (
            <span
              onClick={this.giftDelete.bind(this, index)}
              className="u-color-red"
              style={{
                cursor: 'pointer',
                marginLeft: '10px',
                width: 50
              }}
            >
              删除
            </span>
          ) : null}
        </FormItem>
      );
    });

    const hasHistoryListRight = isUserHasRights([
      'operation_manage',
      'points_offer_package',
      'offer_list'
    ]);

    return (
      <div className="p-detail-wrap">
        <Card
          tabList={
            id && hasHistoryListRight
              ? [
                  { key: '1', tab: '權益包' },
                  { key: '2', tab: '兌換記錄' }
                ]
              : [{ key: '1', tab: '權益包' }]
          }
          activeTabKey={tab}
          onTabChange={this.changeTab}
          bordered={false}
          loading={isLoading}
        >
          {tab === '2' && id ? (
            <AuthWrapCom
              authList={[
                'operation_manage',
                'points_offer_package',
                'offer_list'
              ]}
            >
              <HistoryList />
            </AuthWrapCom>
          ) : (
            <div>
              <Form>
                {id ? (
                  <FormItem {...formItemLayout} label="權益包編號">
                    <p>{id}</p>
                  </FormItem>
                ) : null}
                <FormItem {...formItemLayout} label="權益包活動名稱">
                  {getFieldDecorator('package_name', {
                    initialValue: detail.package_name,
                    rules: [{ required: true, message: '請輸入' }]
                  })(
                    <Input
                      disabled={isDisabledEdit}
                      placeholder="請輸入"
                      maxLength={packageNameLen}
                      onFocus={this.inputOnFocusPackageName}
                      onBlur={this.inputOnBlur}
                      onChange={this.changePackageName}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="權益包描述">
                  {getFieldDecorator('package_description', {
                    initialValue: detail.package_description,
                    rules: [
                      {
                        required: true,
                        message: '請輸入權益包描述100字以內,輸入enter換行'
                      }
                    ],
                    getValueFromEvent: e => {
                      let { value } = e.target;
                      const rowArr = value.split('\n');
                      value = value.substr(
                        0,
                        Math.min(98 + rowArr.length, value.length)
                      );
                      return value;
                    }
                  })(
                    <TextArea
                      rows={4}
                      cols={10}
                      disabled={isDisabledEdit}
                      maxLength={200}
                      placeholder="請輸入權益包描述100字以內"
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="導航欄標題">
                  {getFieldDecorator('navigation_title', {
                    initialValue: detail.navigation_title,
                    rules: [{ required: true, message: '請輸入導航欄標題' }]
                  })(
                    <Input
                      disabled={isDisabledEdit}
                      placeholder="請輸入"
                      maxLength={navigationTitleLen}
                      onFocus={this.inputOnFocusNavigationTitle}
                      onBlur={this.inputOnBlur}
                      onChange={this.changeNavigationTitle}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="主頁面標題">
                  {getFieldDecorator('home_page_title', {
                    initialValue: detail.home_page_title,
                    rules: [{ required: true, message: '請輸入主頁面標題' }]
                  })(
                    <TextArea
                      rows={2}
                      cols={8}
                      autosize
                      disabled={isDisabledEdit}
                      placeholder="請輸入"
                      maxLength={homePageMaxLen}
                      onFocus={this.inputOnFocus}
                      onBlur={this.inputOnBlur}
                      onChange={this.changeHomePageTitle}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="活動說明">
                  {getFieldDecorator('package_activity_description', {
                    initialValue: detail.package_activity_description,
                    rules: [
                      {
                        required: true,
                        message: '請輸入活動說明,輸入enter換行'
                      }
                    ],
                    getValueFromEvent: e => {
                      let { value } = e.target;
                      const rowArr = value.split('\n');
                      value = value.substr(
                        0,
                        Math.min(1998 + rowArr.length, value.length)
                      );
                      return value;
                    }
                  })(
                    <TextArea
                      rows={4}
                      cols={10}
                      maxLength={2100}
                      disabled={isDisabledEdit}
                      placeholder="請輸入活動說明"
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="兌換成功頁面文案">
                  {getFieldDecorator('successfully_redeemed_message', {
                    initialValue: detail.successfully_redeemed_message,
                    rules: [
                      { required: true, message: '請輸入兌換成功頁面文案' }
                    ]
                  })(
                    <Input
                      disabled={isDisabledEdit}
                      placeholder="請輸入"
                      maxLength={successfullyRedeemedMessageLen}
                      onFocus={this.inputOnFocussuccessfullyRedeemedMessage}
                      onBlur={this.inputOnBlur}
                      onChange={this.changesuccessfullyRedeemedMessage}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="活動未開始頁面文案">
                  {getFieldDecorator('copywriting_before_activity', {
                    initialValue: detail.copywriting_before_activity,
                    rules: [
                      { required: true, message: '請輸入活動未開始頁面文案' }
                    ]
                  })(
                    <Input
                      disabled={isDisabledEdit}
                      placeholder="請輸入"
                      maxLength={copywritingBeforeActivityLen}
                      onFocus={this.inputOnFocuscopywritingBeforeActivity}
                      onBlur={this.inputOnBlur}
                      onChange={this.changeCopywritingBeforeActivity}
                    />
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="活動已結束頁面文案">
                  {getFieldDecorator('copywriting_after_activity', {
                    initialValue: detail.copywriting_after_activity,
                    rules: [
                      { required: true, message: '請輸入活動已結束頁面文案' }
                    ]
                  })(
                    <Input
                      disabled={isDisabledEdit}
                      placeholder="請輸入"
                      maxLength={copywritingAfterActivityLen}
                      onFocus={this.inputOnFocuscopywritingAfterActivity}
                      onBlur={this.inputOnBlur}
                      onChange={this.changecopywritingAfterActivity}
                    />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="兌換限制"
                  help={offer_limit_help}
                  validateStatus={offer_limit_validateStatus}
                  className="insert-red-star"
                >
                  <div style={{ float: 'left' }}>
                    每個會員ID最多{'  '}
                    {getFieldDecorator('offer_limit', {
                      initialValue:
                        detail.offer_limit === 0 ? '' : detail.offer_limit
                    })(
                      <InputNumber
                        disabled={isDisabledEditAfterPublic}
                        onChange={this.handleNumberChange}
                        max={999}
                        min={1}
                      />
                    )}
                    {'  '}份
                  </div>
                  <div style={{ float: 'right' }}>
                    {getFieldDecorator('limit_check', {
                      valuePropName: 'checked',
                      initialValue: detail.offer_limit === 0 ? true : false
                    })(
                      <Checkbox
                        disabled={isDisabledEditAfterPublic}
                        onChange={this.handleChange}
                      >
                        不限制
                      </Checkbox>
                    )}
                  </div>
                </FormItem>
                <FormItem {...formItemLayout} label="活動時間">
                  {getFieldDecorator('time', {
                    initialValue: detail.start_time
                      ? [moment(detail.start_time), moment(detail.end_time)]
                      : null,
                    rules: [{ required: true, message: '請輸入活動時間' }],
                    getValueFromEvent: e => {
                      if (e.length === 0) {
                        return e;
                      }
                      if (
                        new Date(e[0].format('YYYY-MM-DD HH:mm')) * 1 <
                        new Date(moment().format('YYYY-MM-DD HH:mm')) * 1
                      ) {
                        e[0] = moment();
                      }

                      if (
                        new Date(e[0].format('YYYY-MM-DD HH:mm')) * 1 >=
                        new Date(e[1].format('YYYY-MM-DD HH:mm')) * 1
                      ) {
                        e[1] = moment();
                      }
                      return e;
                    }
                  })(
                    <RangePicker
                      showTime={{ format: 'HH:mm' }}
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={current => {
                        return (
                          current &&
                          new Date(current.format('YYYY-MM-DD')) * 1 <
                            new Date(moment().format('YYYY-MM-DD')) * 1
                        );
                      }}
                      disabled={isDisabledEditAfterPublic}
                    />
                  )}
                </FormItem>
                {giftListRender}
                {!isDisabledEditAfterPublic ? (
                  <FormItem {...tailFormItemLayout} label="">
                    <Button
                      style={{ width: 220 }}
                      type="dashed"
                      onClick={this.addGift}
                    >
                      + 增加獎品內容
                    </Button>
                  </FormItem>
                ) : null}

                <FormItem {...formItemLayout} label="兌換碼類型">
                  {getFieldDecorator('redeem_code_type', {
                    initialValue: detail.redeem_code_type,
                    rules: [{ required: true, message: '請輸入權益包總份數' }]
                  })(
                    <Select
                      style={{ width: 220 }}
                      disabled={isDisabledEditAfterPublic}
                    >
                      <Option value="same_password">統一碼</Option>
                      <Option value="unique_password">唯一碼</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label="權益包總份數">
                  {getFieldDecorator('total_amount', {
                    initialValue: detail.total_amount,
                    rules: [{ required: true, message: '請輸入權益包總份數' }]
                  })(
                    <InputNumber
                      disabled={isDisabledEdit}
                      style={{ width: 150 }}
                      onChange={this.handleNumberChange}
                      max={100000}
                      min={1}
                    />
                  )}
                  {'  '}份
                </FormItem>
                <div className="footer">
                  <span>
                    <Button
                      className="btn"
                      onClick={this.onCancel}
                      disabled={isSubmiting}
                    >
                      {isDisabledEdit ? '返回' : '取消'}
                    </Button>
                  </span>
                  {isDisabledEdit ? null : (
                    <span>
                      <Button
                        className="btn"
                        type="danger"
                        loading={isSubmiting}
                        disabled={isSubmiting}
                        onClick={this.btnClick.bind(this, 'publish')}
                      >
                        保存並發佈
                      </Button>
                    </span>
                  )}
                  {isDisabledEdit || isStatusStart ? null : (
                    <span>
                      <Button
                        className="btn"
                        type="primary"
                        disabled={isSubmiting}
                        loading={isSubmiting}
                        onClick={this.btnClick.bind(this, 'save')}
                      >
                        {isSubmiting ? '保存中...' : '保存'}
                      </Button>
                    </span>
                  )}
                </div>
              </Form>
            </div>
          )}
        </Card>
        {this.state.isShowCoupon ? (
          <Coupon
            onCancel={this.hideModal.bind(this, '1')}
            save={this.saveModal}
            data={this.state.modalData}
            isDisabledEdit={isDisabledEditAfterPublic}
          />
        ) : null}
        {this.state.isShowPoints ? (
          <Points
            imgToken={this.props.auth.jwt}
            onCancel={this.hideModal.bind(this, '2')}
            save={this.saveModal}
            data={this.state.modalData}
            isDisabledEdit={isDisabledEditAfterPublic}
          />
        ) : null}
      </div>
    );
  }
}

export default withRouter(
  connect(({ system, equitiesPackage, auth }) => ({
    equitiesPackage: equitiesPackage.toJS(),
    system: system.toJS(),
    auth: auth.toJS()
  }))(Form.create()(DetailPage))
);
