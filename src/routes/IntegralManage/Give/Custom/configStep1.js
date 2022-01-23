import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Steps,
  Select,
  Input,
  Button,
  Icon,
  Modal,
  Checkbox,
  message,
  Spin,
} from 'antd';
import { fetchAccountByDepartment } from 'services/integralManage/approve/approve';
import {
  addCustomBaseRequest,
  updateCustomBaseRequest,
  fetchCustomDetailRequest,
  fetchAccoutDetail,
} from 'services/integralManage/give/give';
import { getImgRequest } from 'services/common/common';
import Upload from 'components/Upload';
import CancelBtnCom from 'components/CancelBtn';
import DateAndTimeSelect from 'components/DateAndTimeSelect';
import moment from 'moment';
import { INPUT_NUMBER_MAX } from 'constants';
import BelongDepartment from 'components/Integral/BelongDepartmentCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import IntegralValidTime from 'components/Integral/IntegralValidTime';
import PreviewComponent from 'components/PreviewComponent';
import UploadTipAndDownTmpCom from 'components/UploadTipAndDownTmp';
import '../give.less';

const Option = Select.Option;
const { TextArea } = Input;
const Step = Steps.Step;
let isFirstDarpmentChange = false; // 用于判断是否是从请求的详情数据来 判断账户名称

class ConfigStep1Page extends React.Component {
  constructor(props) {
    super(props);
    const id = props.system.query.id || '';
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
      out_sn,
      app_id,
      isDisabledEdit: editType === 'look',
      offer_policy_entry_id: '', // 策略服务发放项id(),上线后不再显示,开发临时用:
      startHour: '00',
      endHour: '00',
      startMinute: '00',
      endMinute: '00',
      fileInfo: {
        previewVisible: false,
        fileList: [],
        previewUrl: '',
      },
      accountList: [], // 账户list
      entryInfo: {
        title: '',
        entry_name: '', // 发放项名称，
        entry_desc: '', // 发放项描述
        initiate_department: this.props.auth.department, // 发起部门ID
        offer_account: '', // 积分发放账户id
        offer_account_union_id: '', // 积分发放账户union_id
        change_type: 1, // 积分变动类型,1增加,-1减少
        stop_rule_points: 1, // 停发规则,余额
        start_time: moment().add(1, 'day').format('YYYY-MM-DD HH:mm'), // 生效开始时间
        end_time: moment().add(8, 'day').format('YYYY-MM-DD HH:mm'), // 生效结束时间
        offer_points_valid_date: {
          // 积分有效期
          type: '',
          period: '',
        },
        approval_annex: '', // 审批附件地址
        account_type: 0,
        account_data: {
          account_name: '',
          p_account_id: '',
          points: '',
          warning_value: '',
        },
      },
      isSubmiting: false,
      isDataLoading: true,
      listType: 'picture-card',
      fileList: [],
      previewVisible: false,
      previewFileType: 1,
      previewUrl: '',
      defaultPartmentInfo: {},
    };
    this.NODE_ENV = process.env.environment;
  }

  async componentDidMount() {
    const { id } = this.state;
    if (!id) {
      this.setState({
        isDataLoading: false,
        defaultPartmentInfo: {
          part2: this.props.auth.department,
        },
      });
      return;
    }
    this.setState({
      isDataLoading: true,
    });
    isFirstDarpmentChange = true;
    const { data } = await fetchCustomDetailRequest({ id });
    let fileUrl = '';
    let fileName = '';
    if (data.status) {
      const detailInfo = data.data;

      fileUrl = detailInfo.file_url;
      fileName = detailInfo.file_name;

      const entryInfo = Object.assign({}, this.state.entryInfo, detailInfo, {
        start_time: moment(detailInfo.start_time).format('YYYY-MM-DD HH:mm'),
        end_time: moment(detailInfo.end_time).format('YYYY-MM-DD HH:mm'),
      });
      // NOTE: 保存原先选择的账户 ID;
      this.offer_account = detailInfo.offer_account;
      const defaultPartmentInfo = {
        part2: detailInfo.initiate_department,
        part1: detailInfo.department_pid,
      };
      const ext = this.getFileExt(fileUrl);
      const fileList = [
        {
          uid: '1',
          name: fileName,
          status: 'done',
          url: fileUrl,
          thumbUrl: ext === 'pdf' ? '' : fileUrl,
          type: ext === 'pdf' ? 'application/pdf' : '',
        },
      ];

      const offer_policy_entry_id = detailInfo.offer_policy_entry_id || '';
      this.setState(
        {
          defaultPartmentInfo,
          entryInfo,
          fileList,
          offer_policy_entry_id,
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
        isDataLoading: false,
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
    isFirstDarpmentChange = null;
    message.destroy();
    if (this.templateUrl) {
      URL.revokeObjectURL(this.templateUrl);
      this.templateUrl = null;
    }
  }

  // 日期更改事件
  dateAndTimeChangeAction(value) {
    const entryInfo = Object.assign({}, this.state.entryInfo, value);
    this.setState({
      entryInfo,
    });
  }

  // 停发余额更改 事件
  balanceChangeAction = (value) => {
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      stop_rule_points: value,
    });
    this.setState({
      entryInfo,
    });
  };

  // 输入框 更改事件
  handleInputChangeAction = (type, e) => {
    const { value } = e.target;
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      [type]: value,
    });
    this.setState({
      entryInfo,
    });
  };
  // 子账户 输入框 更改事件
  handleSubAccountName = (e) => {
    const { value } = e.target;
    const accountData = Object.assign({}, this.state.entryInfo.account_data, {
      account_name: value,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      account_data: accountData,
    });
    this.setState({
      entryInfo,
    });
  };

  // 子账户 输入框 更改事件
  handleSubAccountPoints = (value) => {
    const accountData = Object.assign({}, this.state.entryInfo.account_data, {
      points: value,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      account_data: accountData,
    });
    this.setState({
      entryInfo,
    });
  };

  // 子账户 输入框 更改事件
  handleSubAccountWarning = (value) => {
    const accountData = Object.assign({}, this.state.entryInfo.account_data, {
      warning_value: value,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      account_data: accountData,
    });
    this.setState({
      entryInfo,
    });
  };

  // 积分账户更改 事件
  accoutNameChangeAction = (value) => {
    const { accountList } = this.state;
    const offer_account_union_id = accountList.filter(
      (item) => +item.id === +value
    )[0].union_id;

    // 复制给子账户 保存
    const accountData = Object.assign({}, this.state.entryInfo.account_data, {
      p_account_id: offer_account_union_id,
    });

    const entryInfo = Object.assign({}, this.state.entryInfo, {
      offer_account: value,
      offer_account_union_id,
      account_data: accountData,
    });
    this.setState({
      entryInfo,
    });
  };

  // 账户类型更改
  accoutTypeChangeAction = (e) => {
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      account_type: e.target.checked ? 1 : 0,
    });
    this.setState({
      entryInfo,
    });
  };

  // 部门发生变化 事件
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
    const res = await fetchAccountByDepartment({
      department: pid,
      is_filter: 1,
    });
    if (res.data.status && res.data.data) {
      const list = res.data.data.list || [];
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

  handleChangeValidTime = (validTime) => {
    const { selected, designation } = validTime;
    const { entryInfo } = this.state;
    entryInfo.offer_points_valid_date = {
      type: selected,
      period: designation,
    };
    this.setState({ entryInfo });
  };

  handleCancel = () => this.setState({ previewVisible: false });

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

  formatData() {
    const { entryInfo, id } = this.state;
    const {
      stop_rule_points,
      end_time,
      start_time,
      entry_name,
      title,
      entry_desc,
      offer_account,
      offer_points_valid_date,
      account_type,
      account_data,
    } = entryInfo;
    if (!entry_name.trim()) {
      message.error('發放項名稱不能爲空!');
      return;
    }

    if (!entry_desc.trim()) {
      message.error('發放項描述不能爲空!');
      return;
    }

    if (!offer_account) {
      message.error('請選擇一個積分發放帳戶!');
      return;
    }

    if (account_type === 1) {
      if (!account_data.account_name.trim()) {
        message.error('子帳戶名稱不能爲空!');
        return;
      }
      if (!account_data.points) {
        message.error('子帳戶所需積分額不能爲空!');
        return;
      }
      if (!account_data.warning_value) {
        message.error('子帳戶低積分結餘警示值不能爲空!');
        return;
      }
    }

    if (!title || !title.trim()) {
      message.error('請填寫積分明細顯示名稱描述!');
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

    if (new Date(start_time) * 1 >= new Date(end_time)) {
      message.error('生效時間選擇有誤，開始時間不能大於或等於結束時間!');
      return;
    }

    if (!entryInfo.approval_annex) {
      message.error('請上傳附件!');
      return;
    }

    entryInfo.entry_name = entryInfo.entry_name.trim();
    entryInfo.title = entryInfo.title.trim();
    entryInfo.entry_desc = entryInfo.entry_desc.trim();
    const postData = { ...entryInfo };
    return postData;
  }

  // 下一步
  async nextAction(type) {
    if (type === 'look') {
      const { id } = this.state;
      this.props.history.push(
        '/integral-manage/give-custom/config/rule?id=' + id + '&type=look'
      );
    } else {
      const postData = this.formatData();
      if (postData) {
        const { id, out_sn, app_id } = this.state;
        if (postData.offer_rules) {
          delete postData.offer_rules;
        }
        if (out_sn) {
          postData.out_sn = out_sn;
        }
        if (app_id) {
          postData.app_id = app_id;
        }
        const { offer_account_status, offer_account } = postData;
        if (
          offer_account_status === 2 &&
          offer_account === this.offer_account
        ) {
          return message.error('該積分發放帳戶已凍結, 請更換積分發放賬戶');
        }
        this.setState({
          isSubmiting: true,
        });
        const updatePostData = Object.assign({}, postData, {
          id,
          action: 'temporary_storage',
        });

        if (postData.account_type === 1) {
          const { data: accountData } = await fetchAccoutDetail(offer_account);
          if (accountData.status) {
            if (
              accountData.data.balance_amount >= postData.account_data.points
            ) {
              const { data } = this.state.id
                ? await updateCustomBaseRequest(updatePostData)
                : await addCustomBaseRequest(postData);
              if (data.status) {
                message.success('成功!');
                const returnId = this.state.id || data.data.id;
                if (returnId) {
                  this.props.history.push(
                    '/integral-manage/give-custom/config/rule?id=' + returnId
                  );
                } else {
                  message.error('返回參數ID有誤!');
                }
              }
            } else {
              message.error('子帳戶請求數額不可大於主帳戶積分結餘');
            }
          }
        } else {
          updatePostData.account_data = null;
          postData.account_data = null;
          const { data } = this.state.id
            ? await updateCustomBaseRequest(updatePostData)
            : await addCustomBaseRequest(postData);
          if (data.status) {
            message.success('成功!');
            const returnId = this.state.id || data.data.id;
            if (returnId) {
              this.props.history.push(
                '/integral-manage/give-custom/config/rule?id=' + returnId
              );
            } else {
              message.error('返回參數ID有誤!');
            }
          }
        }
        this.setState({
          isSubmiting: false,
        });
      }
    }
  }

  gotoAccountDetail = (union_id) => {
    if (union_id) {
      window.open(
        `${window.location.origin}/integral-manage/account/operation?union_id=${union_id}`,
        '_blank'
      );
    }
  };

  render() {
    const {
      entryInfo,
      accountList,
      isDataLoading,
      defaultPartmentInfo,
      listType,
      fileList,
      isDisabledEdit,
      previewFileType,
      previewUrl,
      previewVisible,
    } = this.state;
    const { offer_points_valid_date } = entryInfo;
    const { type, period } = offer_points_valid_date || {};
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    if (isDataLoading) {
      return (
        <div className="p-custom-configstep-wrap">
          <div className="step-wrap">
            <Steps current={0}>
              <Step title="基本信息" />
              <Step title="配置規則" />
              <Step title="提交審批" />
            </Steps>
          </div>
          <div className="configstep-content-wrap">
            <p className="step-title">基本信息</p>
            <div className="p-approve-set-wrap">
              <div className="approve-set-content">
                <div style={{ textAlign: 'center', margin: '30px' }}>
                  <Spin tip="加載中..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="p-custom-configstep-wrap">
        <div className="step-wrap">
          <Steps current={0}>
            <Step title="基本信息" />
            <Step title="配置規則" />
            <Step title="提交審批" />
          </Steps>
        </div>
        <div className="configstep-content-wrap">
          <p className="step-title">基本信息</p>
          <div className="p-approve-set-wrap">
            <div className="approve-set-content">
              {this.state.id ? (
                <div className="list-item">
                  <p className="item-title">發放項ID</p>
                  <div className="item-value-wrap">
                    <p>{this.state.id}</p>
                  </div>
                </div>
              ) : null}
              <div className="list-item">
                <p className="item-title">發放項名稱</p>
                <div className="item-value-wrap">
                  <Input
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    placeholder="發放項名稱(20长度内)"
                    value={entryInfo.entry_name}
                    maxLength={20}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'entry_name'
                    )}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">發放項描述</p>
                <div className="item-value-wrap">
                  <TextArea
                    disabled={isDisabledEdit}
                    rows={5}
                    style={{ width: '360px', resize: 'none' }}
                    placeholder="發放項描述(100字以內)"
                    value={entryInfo.entry_desc}
                    maxLength={100}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'entry_desc'
                    )}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">發起部門</p>
                <div className="item-value-wrap">
                  {/* <BelongDepartment
                    disabled={isDisabledEdit}
                    defaultValue={defaultPartmentInfo}
                    style={{ width: '360px' }}
                    onChange={this.partmentChangeAction.bind(this)}
                  /> */}
                  <PartmentTreeSelect
                    value={defaultPartmentInfo.part2}
                    onChange={this.partmentChangeAction.bind(this)}
                    partmentList={this.props.system.partmentList}
                    style={{ width: '360px' }}
                    disabled={isDisabledEdit}
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
                      disabled={isDisabledEdit}
                      style={{ width: '100%' }}
                      value={entryInfo.offer_account}
                      onChange={this.accoutNameChangeAction}
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
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
                <p className="item-title" />
                <div className="item-value-wrap">
                  <Checkbox
                    defaultChecked={entryInfo.account_type === 1 ? true : false}
                    onChange={this.accoutTypeChangeAction}
                    disabled={isDisabledEdit}
                  >
                    創建積分子賬戶
                  </Checkbox>
                </div>
              </div>
              {entryInfo.account_type === 1 ? (
                <div className="list-item">
                  <p className="item-title" />
                  <div className="item-box">
                    <div className="item-box-list-item">
                      <p className="item-box-item-title">子帳戶名稱</p>
                      <div className="item-box-item-value-wrap">
                        <Input
                          disabled={isDisabledEdit}
                          style={{ width: '360px' }}
                          value={entryInfo.account_data.account_name}
                          placeholder="請輸入賬戶名稱"
                          maxLength={20}
                          onChange={this.handleSubAccountName}
                        />
                      </div>
                    </div>
                    <div className="item-box-list-item">
                      <p className="item-box-item-title">連繫主帳戶</p>
                      <div className="item-box-item-value-wrap">
                        <Select
                          disabled
                          style={{ width: '360px' }}
                          value={entryInfo.offer_account}
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentNode
                          }
                        >
                          {accountList.map((item) => {
                            return (
                              <Option key={item.id} value={item.id}>
                                {item.account_name}
                              </Option>
                            );
                          })}
                        </Select>
                        {entryInfo.offer_account ? (
                          <div
                            className="tips"
                            onClick={() => {
                              this.gotoAccountDetail(
                                entryInfo.offer_account_union_id
                              );
                            }}
                          >
                            查看積分餘額
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="item-box-list-item">
                      <p className="item-box-item-title">所需積分額</p>
                      <div className="item-box-item-value-wrap">
                        <InputToolTipCom
                          disabled={isDisabledEdit}
                          onChange={this.handleSubAccountPoints}
                          value={entryInfo.account_data.points}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => value.replace(/(,*)/g, '')}
                          max={INPUT_NUMBER_MAX}
                          min={1}
                          step={1}
                          style={{ width: '360px' }}
                        />
                      </div>
                    </div>
                    <div className="item-box-list-item">
                      <p className="item-box-item-title">低積分結餘警示值</p>
                      <div className="item-box-item-value-wrap">
                        <InputToolTipCom
                          disabled={isDisabledEdit}
                          onChange={this.handleSubAccountWarning}
                          value={entryInfo.account_data.warning_value}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => value.replace(/(,*)/g, '')}
                          max={INPUT_NUMBER_MAX}
                          min={1}
                          step={1}
                          style={{ width: '360px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <div className="list-item">
                <p className="item-title">積分明細顯示名稱描述</p>
                <div className="item-value-wrap">
                  <Input
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    value={entryInfo.title}
                    placeholder="10個字以內"
                    maxLength={10}
                    onChange={this.handleInputChangeAction.bind(this, 'title')}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">變動類型</p>
                <div className="item-value-wrap">
                  <span
                    style={{
                      display: 'inline-block',
                      width: '360px',
                      marginRight: '10px',
                    }}
                  >
                    <Select
                      style={{ width: '100%' }}
                      disabled={isDisabledEdit}
                      value={entryInfo.change_type}
                    >
                      <Option value={1}>增加</Option>
                    </Select>
                  </span>
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
                      disabled={isDisabledEdit}
                      onChange={this.balanceChangeAction}
                      value={entryInfo.stop_rule_points}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/(,*)/g, '')}
                      max={INPUT_NUMBER_MAX}
                      min={1}
                      step={1}
                      style={{ width: '120px' }}
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
                    disabled={isDisabledEdit}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">生效時間</p>
                <div className="item-value-wrap">
                  <div className="select-time-wrap">
                    <DateAndTimeSelect
                      disabled={isDisabledEdit}
                      dateInfo={{
                        start_time: entryInfo.start_time,
                        end_time: entryInfo.end_time,
                      }}
                      onChange={this.dateAndTimeChangeAction.bind(this)}
                    />
                  </div>
                  <p className="tips">
                    *
                    超出使用有效時間，則系統帳戶會回收未使用的積分，完成成本核算
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
                      disabled={isDisabledEdit}
                      listType={listType}
                      fileList={fileList}
                      onPreview={this.handlePreview}
                      onSuccess={this.fileUploadSuccessAction}
                      showUploadList={{
                        showPreviewIcon: true,
                        showRemoveIcon: !isDisabledEdit,
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
              {this.NODE_ENV !== 'production' &&
              this.state.offer_policy_entry_id ? (
                <span style={{ float: 'left', color: '#ccc' }}>
                  策略服务发放项id： <b>{this.state.offer_policy_entry_id}</b>
                </span>
              ) : null}
              <CancelBtnCom
                disabled={this.state.isSubmiting}
                onClick={() =>
                  this.props.history.push('/integral-manage/give-custom')
                }
              />
              {isDisabledEdit ? (
                <Button type="primary" onClick={() => this.nextAction('look')}>
                  查看下一步
                </Button>
              ) : (
                <Button
                  type="primary"
                  loading={this.state.isSubmiting}
                  disabled={this.state.isSubmiting}
                  onClick={() => this.nextAction()}
                >
                  {this.state.id ? '更新且' : ''}
                  下一步
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ integralManageGive, system, auth }) => ({
    integralManageGive: integralManageGive.toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(ConfigStep1Page)
);
