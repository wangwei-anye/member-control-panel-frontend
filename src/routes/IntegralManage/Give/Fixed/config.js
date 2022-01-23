import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import moment from 'moment';
import { Card, Input, Select, Button, Icon, Checkbox, message } from 'antd';
import Upload from 'components/Upload';
import { INPUT_NUMBER_MAX } from 'constants';
import { fetchAccountByDepartment } from 'services/integralManage/approve/approve';
import {
  addFixedChannelEntryRequest,
  fetchCustomDetailRequest,
} from 'services/integralManage/give/give';
import { getImgRequest } from 'services/common/common';
import BelongDepartment from 'components/Integral/BelongDepartmentCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import DateAndTimeSelect from 'components/DateAndTimeSelect';
import CancelBtnCom from 'components/CancelBtn';
import LoadingCom from 'components/LoadingCom';
import IntegralValidTime from 'components/Integral/IntegralValidTime';
import { capTopTypeJsonList } from 'config/ob.config';
import PreviewComponent from 'components/PreviewComponent';
import UploadTipAndDownTmpCom from 'components/UploadTipAndDownTmp';
import '../give.less';

const Option = Select.Option;
const { TextArea } = Input;
let isFirstDarpmentChange = false;
class ConfigurationPage extends React.Component {
  constructor(props) {
    super(props);
    const id = props.system.query.id || '';
    const group_id = props.system.query.group_id || '';
    const editType = props.system.query.type || '';
    const out_sn =
      props.system.query.out_sn ||
      sessionStorage.getItem('MCP_01_OUT_OUT_SN') ||
      '';
    const app_id =
      props.system.query.app_id ||
      sessionStorage.getItem('MCP_01_OUT_APP_ID') ||
      '';
    this.state = {
      id,
      app_id,
      group_id,
      out_sn,
      isDisabledEidt: editType === 'look',
      entryInfo: {
        title: '',
        channel_id: '',
        initiate_department: this.props.auth.department, // 发放部门id
        start_time: moment().add(1, 'day').format('YYYY-MM-DD HH:mm'),
        end_time: moment().add(8, 'day').format('YYYY-MM-DD HH:mm'),
        offer_account: 0, // 发放账户id
        offer_account_union_id: '', // 发放账户union_id
        entry_desc: '', // 发放项描述
        change_type: 1, // 变更类型,1增加,-1减少
        stop_rule_points: 1, // 停发规则:余额不足此分数时停止发放
        approval_annex: '', // 附件地址
        offer_points_valid_date: {
          // 积分有效期
          type: '',
          period: '',
        },
        offer_rules: {
          pay: 1, // 每支付多少
          points: 10, // 可获得多少
          top: {
            dimenssion: 'day', // 封顶类型  不封顶为 no_top
            most: 10, // 不封顶每种类型最多获得多少
          },
        },
      },
      accountList: [], // 账户list
      previewVisible: false,
      fileList: [],
      previewUrl: '',
      previewFileType: 1,
      isSubmiting: false,
      isDateLoading: true,
      defaultPartmentInfo: {},
      listType: 'picture-card',
    };
  }

  async componentWillMount() {
    if (!this.state.id) {
      this.setState({
        isDateLoading: false,
        defaultPartmentInfo: {
          part2: this.props.auth.department,
        },
      });
      return;
    }
    isFirstDarpmentChange = true;
    const { data } = await fetchCustomDetailRequest({ id: this.state.id });
    let fileUrl = '';
    let fileName = '';
    if (data.status) {
      const dataInfo = data.data;
      const entryInfo = Object.assign({}, this.state.entryInfo, dataInfo);
      const defaultPartmentInfo = {
        part2: dataInfo.initiate_department,
        part1: dataInfo.department_pid,
      };
      // NOTE: 保存原先选择的账户 ID;
      this.offer_account = dataInfo.offer_account;
      fileUrl = dataInfo.file_url;
      fileName = dataInfo.file_name;

      const ext = this.getFileExt(fileUrl);
      const fileList = [
        {
          uid: '1',
          name: fileName,
          status: 'done',
          url: fileUrl,
          thumbUrl: ext === 'pdf' ? '' : fileUrl,
        },
      ];

      this.setState(
        {
          entryInfo,
          defaultPartmentInfo,
          fileList,
          previewUrl: fileUrl,
          listType: ext === 'pdf' ? 'picture' : 'picture-card',
          previewFileType: ext === 'pdf' ? 2 : 1,
        },
        () => {
          this.modifyUploadComponentStyle();
        }
      );
    }
    this.setState(
      {
        isDateLoading: false,
      },
      async () => {
        if (!fileUrl) {
          return;
        }
        const ext = this.getFileExt(fileUrl);
        if (ext !== 'pdf') {
          await this.handleImagePreview(fileUrl, fileName);
        } else {
          this.handlePDFPreview(fileUrl);
        }
      }
    );
  }

  // NOTE: 这里是为了动态修改 ant-design 中的样式, 做法比较暴力
  modifyUploadComponentStyle = () => {
    const { previewFileType } = this.state;
    if (previewFileType === 2) {
      setTimeout(() => {
        const selector =
          '.upload-list-inline .ant-upload-list-item-thumbnail img';
        const imgIconEl = document.querySelector(selector);
        if (imgIconEl) {
          imgIconEl.setAttribute('src', '/static/img/picture.png');
          imgIconEl.setAttribute('style', 'padding: 10px');
          imgIconEl.removeAttribute('alt');
        } else {
          this.modifyUploadComponentStyle();
        }
      }, 50);
    }
  };

  getFileExt = (fileUrl) => {
    const dotIndex = fileUrl.lastIndexOf('.');
    return fileUrl.slice(dotIndex + 1).toLowerCase();
  };

  handlePDFPreview = (fileUrl) => {
    // todo
  };

  handleChangeValidTime = (validTime) => {
    const { selected, designation } = validTime;
    const { entryInfo } = this.state;
    entryInfo.offer_points_valid_date = {
      type: selected,
      period: designation,
    };
    this.setState({ entryInfo });
  };

  handleImagePreview = async (fileUrl, fileName) => {
    let templateUrl = fileUrl;
    try {
      templateUrl = await getImgRequest(templateUrl);
      templateUrl = URL.createObjectURL(templateUrl);
      this.templateUrl = templateUrl;
    } catch (err) {
      console.log(err);
    }
    const fileList = [
      {
        uid: '1',
        name: fileName,
        status: 'done',
        url: templateUrl,
      },
    ];
    this.setState({
      fileList,
    });
  };

  componentWillUnmount() {
    message.destroy();
    if (this.templateUrl) {
      URL.revokeObjectURL(this.templateUrl);
      this.templateUrl = null;
    }
  }
  dateAndTimeChangeAction(value) {
    const stateEntryInfo = { ...this.state.entryInfo };
    const entryInfo = { ...stateEntryInfo, ...value };
    this.setState({
      entryInfo,
    });
  }
  partmentChangeAction(value) {
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      initiate_department: value,
    });
    this.setState({
      entryInfo,
      defaultPartmentInfo: {
        part1: '',
        part2: value,
      },
    });
    this.fetchAccountListByPartment(value);
  }
  // 根据部门来获取账户list
  async fetchAccountListByPartment(pid) {
    const { data } = await fetchAccountByDepartment({
      department: pid,
      is_filter: 1,
    });
    if (data.status && data.data) {
      const list = data.data.list || [];
      const {
        offer_account_status,
        offer_account,
        offer_account_name,
      } = this.state.entryInfo;
      const entryInfo = Object.assign({}, this.state.entryInfo, {
        offer_account: isFirstDarpmentChange
          ? this.state.entryInfo.offer_account
          : '',
      });
      if (offer_account_status === 2) {
        list.push({
          id: offer_account,
          account_name: `${offer_account_name} (已冻结)`,
        });
      }
      this.setState({
        accountList: list,
        entryInfo,
      });
      isFirstDarpmentChange = false;
    }
  }
  selectChangeAction = (type, value) => {
    let offer_account_union_id = '';
    const valueObj = {
      [type]: value,
    };
    if (type === 'offer_account') {
      const { accountList } = this.state;
      offer_account_union_id = accountList.filter(
        (item) => +item.id === +value
      )[0].union_id;
      valueObj.offer_account_union_id = offer_account_union_id;
    }
    const entryInfo = Object.assign({}, this.state.entryInfo, valueObj);
    this.setState({
      entryInfo,
    });
  };
  // 所有 inputNumber 输入框更改事件
  inputNumberChangeAction(value, type) {
    const stateEntryInfo = { ...this.state.entryInfo };
    let targetAttr = {};
    if (type === 'most') {
      targetAttr = {
        offer_rules: {
          ...stateEntryInfo.offer_rules,
          ...{
            top: {
              ...stateEntryInfo.offer_rules.top,
              most: value,
            },
          },
        },
      };
    } else if (type === 'pay' || type === 'points') {
      targetAttr = {
        offer_rules: {
          ...stateEntryInfo.offer_rules,
          [type]: value,
        },
      };
    } else {
      targetAttr = {
        [type]: value,
      };
    }
    const entryInfo = { ...stateEntryInfo, ...targetAttr };
    this.setState({
      entryInfo,
    });
  }

  typeChangeAction = (value) => {
    const stateEntryInfo = { ...this.state.entryInfo };
    const targetAttr = {
      offer_rules: {
        ...stateEntryInfo.offer_rules,
        ...{
          top: {
            ...stateEntryInfo.offer_rules.top,
            dimenssion: value,
          },
        },
      },
    };
    const entryInfo = { ...stateEntryInfo, ...targetAttr };
    this.setState({
      entryInfo,
    });
  };

  checkBoxChangeAction = (e) => {
    const { checked } = e.target;
    const stateEntryInfo = { ...this.state.entryInfo };
    const targetAttr = {
      offer_rules: {
        ...stateEntryInfo.offer_rules,
        ...{
          top: {
            ...stateEntryInfo.offer_rules.top,
            dimenssion: checked ? 'no_top' : 'day',
          },
        },
      },
    };
    const entryInfo = { ...stateEntryInfo, ...targetAttr };
    this.setState({
      entryInfo,
    });
  };

  // 文件上传成功事件
  fileUploadSuccessAction = (values) => {
    const { path, type, fileList, file_type, file_name } = values;
    let approval_annex = '';
    let listType = 'picture-card';
    let attrFilesList = [];
    if (type === 'done' && path) {
      approval_annex = path;
      attrFilesList = [...fileList];
      listType = file_type === 1 ? 'picture-card' : 'picture';
    }
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      approval_annex,
      file_name,
    });
    this.setState({
      entryInfo,
      fileList: attrFilesList,
      listType,
      previewFileType: file_type,
    });
  };

  handlePreview = (file) => {
    const { type } = file;
    let previewUrl = file.url || file.thumbUrl;
    let { previewFileType } = this.state;
    if (type === 'application/pdf' && file.response && file.response.status) {
      const {
        response: {
          data: { absolute_path: url },
        },
      } = file;
      previewUrl = url;
      previewFileType = 2;
    }
    this.setState({
      previewUrl,
      previewVisible: true,
      previewFileType,
    });
  };

  handleCancel = () => this.setState({ previewVisible: false });

  formatData() {
    const { entryInfo, id } = this.state;
    const {
      start_time,
      end_time,
      approval_annex,
      stop_rule_points,
      offer_rules: { points, top, pay },
      offer_points_valid_date,
    } = entryInfo;
    console.log(entryInfo);
    if (!entryInfo.channel_id) {
      message.error('請選擇一個上報渠道!');
      return;
    }

    if (!entryInfo.entry_desc.trim()) {
      message.error('請輸入發放描述!');
      return;
    }

    if (!entryInfo.title.trim()) {
      message.error('請輸入積分明細顯示名稱描述!');
      return;
    }

    if (!entryInfo.offer_account) {
      message.error('請選擇一個積分發放帳戶!');
      return;
    }

    const { dimenssion, most } = top;

    if (!dimenssion) {
      message.error('封頂限制選項不能爲空');
      return;
    }

    if (dimenssion !== 'no_top') {
      if (!most || most <= 0) {
        message.error('獲得積分規則不符合要求');
        return;
      }
      if (`${most}`.indexOf('.') > -1) {
        message.error('獲得積分規則不能包含小數點');
        return;
      }
    }

    if (!pay || pay <= 0) {
      message.error('支付金額數值不符合要求');
      return;
    }

    if (`${pay}`.indexOf('.') > -1) {
      message.error('支付金額數值不能包含小數點');
      return;
    }

    if (!points || points <= 0) {
      message.error('積分數額不符合要求');
      return;
    }

    if (`${points}`.indexOf('.') > -1) {
      message.error('積分數額不能包含小數點');
      return;
    }

    if (!stop_rule_points || stop_rule_points <= 0) {
      message.error('停發規則積分數額不符合要求');
      return;
    }

    if (`${stop_rule_points}`.indexOf('.') > -1) {
      message.error('停發規則積分數額不能包含小數點');
      return;
    }

    if (!offer_points_valid_date) {
      message.error('請設置積分有效期');
      return;
    }
    const { type, period } = offer_points_valid_date;
    if (!type) {
      message.error('請選擇積分有效期類型');
      return;
    }
    if (!period) {
      message.error('請設置積分有效期具體時間');
      return;
    }
    if (type === 'begin_with' && `${period}`.indexOf('.') > -1) {
      message.error('積分有效期具體時間不能包含小數點');
      return;
    }
    if (!id && new Date(start_time) * 1 <= new Date() * 1) {
      message.error('生效時間選擇有誤，開始時間不能小於等於當前時間!');
      return;
    }

    if (new Date(start_time) * 1 >= new Date(end_time) * 1) {
      message.error('生效時間選擇有誤，開始時間不能大於等於結束時間!');
      return;
    }

    if (!approval_annex) {
      message.error('請上傳審批附件!');
      return;
    }

    entryInfo.entry_desc = entryInfo.entry_desc.trim();
    entryInfo.title = entryInfo.title.trim();
    return { ...entryInfo };
  }

  async submitAction() {
    const postData = this.formatData();
    if (postData) {
      const { group_id, id, out_sn, app_id } = this.state;
      if (!group_id) {
        message.error('group_id參數有誤！');
        return;
      }
      const { offer_account_status, offer_account } = postData;
      if (offer_account_status === 2 && offer_account === this.offer_account) {
        return message.error('該積分發放帳戶已凍結, 請更換積分發放賬戶');
      }
      if (id) {
        postData.id = id;
      }
      if (out_sn) {
        postData.out_sn = out_sn;
      }
      if (app_id) {
        postData.app_id = app_id;
      }
      this.setState({
        isSubmiting: true,
      });
      const { data } = await addFixedChannelEntryRequest(
        Object.assign({}, postData, {
          group_id,
          type: id ? 'update' : 'add',
          action: 'submit_examine',
        })
      );
      if (data.status) {
        message.success('成功!', 2, () => {
          this.setState({
            isSubmiting: false,
          });
          this.props.history.go(-1);
        });
      } else {
        this.setState({
          isSubmiting: false,
        });
      }
    }
  }

  render() {
    const {
      entryInfo,
      fileList,
      listType,
      accountList,
      previewVisible,
      previewUrl,
      previewFileType,
      defaultPartmentInfo,
      isSubmiting,
      isDateLoading,
      isDisabledEidt,
    } = this.state;
    const { offer_points_valid_date } = entryInfo;
    const { type, period } = offer_points_valid_date || {};
    const { reportChannelList } = this.props.system;
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    if (isDateLoading) {
      return (
        <div className="p-approve-set-wrap">
          <Card title="編輯發放配置" bordered={false}>
            <div className="approve-set-content">
              <LoadingCom />
            </div>
          </Card>
        </div>
      );
    }
    return (
      <div className="p-approve-set-wrap">
        <Card title="編輯發放配置" bordered={false}>
          <div className="approve-set-content">
            <div className="list-item">
              <p className="item-title">上報渠道</p>
              <div className="item-value-wrap">
                <Select
                  disabled={isDisabledEidt}
                  style={{ width: '360px' }}
                  value={entryInfo.channel_id}
                  onChange={this.selectChangeAction.bind(this, 'channel_id')}
                >
                  {reportChannelList.map((item) => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.channel_name}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">發放描述</p>
              <div className="item-value-wrap">
                <TextArea
                  disabled={isDisabledEidt}
                  rows={5}
                  style={{ width: '360px', resize: 'none' }}
                  value={entryInfo.entry_desc}
                  placeholder="發放描述(100字以內)"
                  maxLength={100}
                  onChange={(e) =>
                    this.inputNumberChangeAction(e.target.value, 'entry_desc')
                  }
                />
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">積分明細顯示名稱描述</p>
              <div className="item-value-wrap">
                <Input
                  disabled={isDisabledEidt}
                  style={{ width: '360px' }}
                  value={entryInfo.title}
                  placeholder="10個字以內"
                  maxLength={10}
                  onChange={(e) =>
                    this.inputNumberChangeAction(e.target.value, 'title')
                  }
                />
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">事件發起部門</p>
              <div className="item-value-wrap">
                {/* <BelongDepartment
                  disabled={isDisabledEidt}
                  defaultValue={defaultPartmentInfo}
                  style={{ width: '360px' }}
                  onChange={this.partmentChangeAction.bind(this)}
                /> */}
                <PartmentTreeSelect
                  value={defaultPartmentInfo.part2}
                  onChange={this.partmentChangeAction.bind(this)}
                  partmentList={this.props.system.partmentList}
                  style={{ width: '360px' }}
                  disabled={isDisabledEidt}
                />
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">積分發放帳戶</p>
              <div className="item-value-wrap">
                <span
                  style={{
                    display: 'inline-block',
                    width: '360px',
                    marginRight: '10px',
                  }}
                >
                  <Select
                    disabled={isDisabledEidt}
                    style={{ width: '100%' }}
                    value={entryInfo.offer_account}
                    onChange={this.selectChangeAction.bind(
                      this,
                      'offer_account'
                    )}
                  >
                    {accountList.map((item) => {
                      return (
                        <Option key={item.id} value={item.id}>
                          {item.account_name}
                        </Option>
                      );
                    })}
                  </Select>
                </span>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">每支付</p>
              <div className="item-value-wrap">
                <InputToolTipCom
                  disabled={isDisabledEidt}
                  value={entryInfo.offer_rules.pay}
                  max={INPUT_NUMBER_MAX}
                  min={1}
                  step={1}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/(,*)/g, '')}
                  style={{ width: '120px' }}
                  onChange={(value) =>
                    this.inputNumberChangeAction(value, 'pay')
                  }
                />
                <Select
                  disabled={isDisabledEidt}
                  style={{ width: '164px', marginLeft: '10px' }}
                  value="hk"
                >
                  <Option value="hk">港幣（元）</Option>
                </Select>
                <span
                  style={{
                    display: 'inline-block',
                    color: 'rgba(0,0,0,0.85)',
                    marginLeft: '10px',
                    marginRight: '10px',
                  }}
                >
                  可獲得
                </span>
                <InputToolTipCom
                  disabled={isDisabledEidt}
                  value={entryInfo.offer_rules.points}
                  max={INPUT_NUMBER_MAX}
                  min={1}
                  step={1}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/(,*)/g, '')}
                  style={{ width: '150px' }}
                  onChange={(value) =>
                    this.inputNumberChangeAction(value, 'points')
                  }
                />
                <span
                  style={{
                    display: 'inline-block',
                    color: 'rgba(0,0,0,0.85)',
                    marginLeft: '10px',
                  }}
                >
                  積分
                </span>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">封頂</p>
              <div className="item-value-wrap">
                <div>
                  <Select
                    disabled={
                      entryInfo.offer_rules.top.dimenssion === 'no_top' ||
                      isDisabledEidt
                    }
                    style={{ width: '124px' }}
                    value={entryInfo.offer_rules.top.dimenssion}
                    onChange={this.typeChangeAction}
                  >
                    {capTopTypeJsonList.map((top) => {
                      return (
                        <Option key={top.value} value={top.value}>
                          {top.name}
                        </Option>
                      );
                    })}
                  </Select>
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'rgba(0,0,0,0.85)',
                      marginLeft: '10px',
                      marginRight: '10px',
                    }}
                  >
                    最多獲得
                  </span>
                  <InputToolTipCom
                    disabled={
                      entryInfo.offer_rules.top.dimenssion === 'no_top' ||
                      isDisabledEidt
                    }
                    value={entryInfo.offer_rules.top.most}
                    max={INPUT_NUMBER_MAX}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/(,*)/g, '')}
                    min={1}
                    step={1}
                    style={{ width: '150px' }}
                    onChange={(value) =>
                      this.inputNumberChangeAction(value, 'most')
                    }
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'rgba(0,0,0,0.85)',
                      marginLeft: '10px',
                    }}
                  >
                    次積分發放
                  </span>
                </div>
                <div>
                  <Checkbox
                    disabled={isDisabledEidt}
                    checked={entryInfo.offer_rules.top.dimenssion === 'no_top'}
                    onChange={this.checkBoxChangeAction}
                  >
                    不封頂
                  </Checkbox>
                </div>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">停發規則</p>
              <div className="item-value-wrap">
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'rgba(0,0,0,0.85)',
                      marginRight: '10px',
                    }}
                  >
                    當發放帳戶積分餘額不足
                  </span>
                  <InputToolTipCom
                    disabled={isDisabledEidt}
                    value={entryInfo.stop_rule_points}
                    max={INPUT_NUMBER_MAX}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/(,*)/g, '')}
                    min={1}
                    step={1}
                    style={{ width: '150px' }}
                    onChange={(value) =>
                      this.inputNumberChangeAction(value, 'stop_rule_points')
                    }
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'rgba(0,0,0,0.85)',
                      marginLeft: '10px',
                    }}
                  >
                    積分時，停止本發放事件
                  </span>
                </div>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">發出積分有效期</p>
              <div className="item-value-wrap">
                <IntegralValidTime
                  onChange={this.handleChangeValidTime}
                  selected={type}
                  designation={period}
                  disabled={isDisabledEidt}
                />
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">生效時間</p>
              <div className="item-value-wrap">
                <div className="select-time-wrap">
                  <DateAndTimeSelect
                    disabled={isDisabledEidt}
                    dateInfo={{
                      start_time: entryInfo.start_time,
                      end_time: entryInfo.end_time,
                    }}
                    onChange={this.dateAndTimeChangeAction.bind(this)}
                  />
                </div>
                <p className="tips">
                  * 超出使用有效時間，則系統帳戶會回收未使用的積分，完成成本核算
                </p>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">審批附件</p>
              <div className="item-value-wrap">
                <div
                  className="select-time-wrap"
                  style={{ overflow: 'hidden' }}
                >
                  <Upload
                    listType={listType}
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onSuccess={this.fileUploadSuccessAction}
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: !isDisabledEidt,
                    }}
                    className={
                      listType == 'picture' ? 'upload-list-inline' : ''
                    }
                  >
                    {fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                  <PreviewComponent
                    previewFileType={previewFileType}
                    previewUrl={previewUrl}
                    previewVisible={previewVisible}
                    handleCancel={this.handleCancel}
                  />
                </div>
                <div>
                  <UploadTipAndDownTmpCom />
                </div>
              </div>
            </div>
          </div>
          <div className="footer-wrap">
            <CancelBtnCom />
            {isDisabledEidt ? null : (
              <Button
                type="primary"
                onClick={() => this.submitAction('submit')}
                disabled={isSubmiting}
                loading={isSubmiting}
              >
                提交審核
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }
}
export default withRouter(
  connect(({ integralManageGive, system, auth }) => ({
    integralManageGive: integralManageGive.toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(ConfigurationPage)
);
