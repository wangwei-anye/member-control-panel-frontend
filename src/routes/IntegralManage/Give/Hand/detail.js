import React from 'react';
import TabRouter from 'components/TabRouter';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { INTEGRAL_GIVE_TABLIST } from 'config/ob.config.js';
import {
  Icon,
  Input,
  Button,
  Select,
  Upload,
  Avatar,
  message,
  Modal,
} from 'antd';
import { INPUT_NUMBER_MAX, API_BASE, HEADER_TOKEN_NAME } from 'constants';
import BelongDepartment from 'components/Integral/BelongDepartmentCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import LoadingCom from 'components/LoadingCom';
import CancelBtnCom from 'components/CancelBtn';
import IntegralValidTime from 'components/Integral/IntegralValidTime';
import { fetchAccountByDepartment } from 'services/integralManage/approve/approve';
import { getToken } from 'utils/session';
import UrlParse from 'url-parse';
import {
  fetchMemberRequest,
  createHandRequest,
  fetchHandDetailRequest,
} from 'services/integralManage/give/give';
import { isUserHasRights } from 'utils/tools';
import '../give.less';

const confirm = Modal.confirm;
const Option = Select.Option;
const { TextArea } = Input;
let isFirstDarpmentChange = false; // 用于判断是否是从请求的详情数据来 判断账户名称
// 表单项布局

// 下载地址
const base_url = new UrlParse(API_BASE);
const DOWNLOAD_ADDR = `${base_url.origin}/file/批量導入會員ID表格模板.xls`;

class HandPage extends React.Component {
  constructor(props) {
    super(props);
    // const id = props.system.query.id || '';
    const editType = props.system.query.type || '';
    this.state = {
      // id,
      isHasRight: isUserHasRights([
        'points_management',
        'points_offer',
        'manual',
        'create',
      ]),
      isDisabledEdit: editType === 'look',
      isSearching: false,
      isSubmiting: false,
      isDataLoading: true,
      infoObj: {
        title: '',
        account_id: '', // 账户ID
        union_id: '', // 账户union_id
        department: this.props.auth.department, // 部门最后一级 ID
        remark: '', // 说明
        receive_id: '', // 接受者id 用 ','隔开
        amount: 1, // 额度
        offer_points_valid_date: {
          // 积分有效期
          type: '',
          period: '',
        },
      },
      dispatchPointType: 1,
      uploadPath: null,
      fileList: [],
      searchKeyWord: '',
      searchMemberList: [], // 搜索账户列表
      receiveMemberList: [], // 接受者list
      accountList: [], // 部门相关联的积分账户list
      defaultPartmentInfo: {},
      isOpenSelect: false,
    };
  }
  async componentDidMount() {
    let defaultDispatch = 1;
    const isHasHandRight = isUserHasRights([
      'points_management',
      'points_offer',
      'manual',
      'choice',
    ]);
    const isHasLoadRight = isUserHasRights([
      'points_management',
      'points_offer',
      'manual',
      'load',
    ]);
    if (!isHasHandRight && isHasLoadRight) {
      defaultDispatch = 2;
    }

    this.setState({
      dispatchPointType: defaultDispatch,
    });

    const isHasAppInfoRight = isUserHasRights(['app_info', 'index']);

    if (!isHasHandRight && !isHasLoadRight) {
      if (!isHasAppInfoRight) {
        message.error('無權訪問，即將跳轉至看板', 2, () => {
          this.props.history.replace('/home');
        });
      } else {
        message.error('無權訪問，即將跳轉至應用概況', 2, () => {
          this.props.history.replace('/');
        });
      }
    }

    const { id, isHasRight } = this.state;
    if (!id) {
      this.setState({
        isDataLoading: false,
        defaultPartmentInfo: {
          part2: this.props.auth.department,
        },
      });
      if (!isHasRight) {
        message.error('無權限新增手動發放申請！');
      }
      return;
    }
    isFirstDarpmentChange = true;
    this.setState({
      isDataLoading: true,
    });
    const { data } = await fetchHandDetailRequest({ id });
    if (data.status) {
      const dataInfo = data.data;
      const infoObj = {
        title: dataInfo.title || '',
        account_id: dataInfo.account_id, // 账户ID
        union_id: dataInfo.union_id,
        department: dataInfo.department, // 部门最后一级 ID
        remark: dataInfo.remark, // 说明
        receive_id: dataInfo.receive_id, // 接受者id 用 ','隔开
        amount: dataInfo.amount, // 额度
        offer_points_valid_date: dataInfo.offer_points_valid_date,
      };
      const defaultPartmentInfo = {
        part2: dataInfo.department_info.department_id,
        part1: dataInfo.department_info.pid,
      };
      const receiveMemberList = [...dataInfo.receiver_info];
      this.setState({
        infoObj,
        defaultPartmentInfo,
        receiveMemberList,
      });
    }
    this.setState({
      isDataLoading: false,
    });
  }
  componentWillUnmount() {
    message.destroy();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  // 文件上传状态
  uploadHandleChange = async ({ fileList }) => {
    const length = fileList.length;
    await this.setState({ fileList });
    if (length > 0) {
      const file = fileList[0];
      const { status } = file;
      if (status === 'done') {
        const {
          response: { status: _status, data, message: msg },
        } = file;
        if (_status) {
          const { path } = data;
          console.log(path);
          this.setState({
            uploadPath: path,
          });
        } else {
          message.error(msg);
          this.setState({
            uploadPath: null,
            fileList: [],
          });
        }
      }
    } else {
      this.setState({
        uploadPath: null,
        fileList: [],
      });
    }
  };

  beforeUpload = async (file) => {
    const fileType = file.type;
    const fileTypeSet = new Set([
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]);
    const fileExtSet = new Set(['xlsx', 'xls', 'XLSX', 'XLS']);
    if (fileTypeSet.has(fileType)) {
      return true;
    }
    // NOTE: 如果从 file 对象中获取不到 type 字段, 那么只能从文件名字中获取文件类型
    if (!fileType) {
      const name = file.name;
      const fileExt = this.getFileExt(name);
      if (!fileExtSet.has(fileExt)) {
        message.error('暫支持xls、xlsx, XLSX, XLS格式文件上傳！');
        return false;
      }
      return true;
    }
    // NOTE: 如果存在文件类型, 由于不同平台上的文件类型存在很大的差异, 那么需要解析文件类型的后缀来判断文件的类型
    const tempList = fileType.split('/');
    const rawFileType = tempList[tempList.length - 1];
    const fileExt = this.getFileExt(rawFileType);
    if (!fileExtSet.has(fileExt)) {
      message.error('暫支持xls、xlsx, XLSX, XLS格式文件上傳！');
      return false;
    }
    return true;
  };

  getFileExt = (fileType) => {
    const index = fileType.lastIndexOf('.');
    const fileExt = fileType.slice(index + 1);
    return fileExt;
  };

  // 接受账户 输入关键字更改
  searchAction = (e) => {
    this.setState({
      searchKeyWord: e.target.value,
    });
  };
  // 接受账户 选择更改
  searchSelectAction = (value) => {
    const { searchMemberList, receiveMemberList } = this.state;
    let targetValue = {};
    // NOTE: 去掉 10 的限制
    // if (receiveMemberList.length >= 10) {
    //   message.warn('接受賬戶不能超過10個!');
    //   return;
    // }
    for (let i = 0; i < searchMemberList.length; i += 1) {
      const current = searchMemberList[i];
      if (+current.account_id === +value) {
        targetValue = current;
        break;
      }
    }
    let hasSame = false;
    if (receiveMemberList.length) {
      for (let i = 0; i < receiveMemberList.length; i += 1) {
        const current = receiveMemberList[i];
        if (+current.account_id === +value) {
          hasSame = true;
          break;
        } else {
          hasSame = false;
        }
      }
      if (!hasSame) {
        receiveMemberList.push(targetValue);
      }
    } else {
      receiveMemberList.push(targetValue);
    }
    this.setState({
      receiveMemberList,
    });
  };
  // 删除接受账户
  deletReceiveMemberAction(item, index) {
    const { receiveMemberList } = this.state;
    if (receiveMemberList[index]) {
      receiveMemberList.splice(index, 1);
      this.setState({
        receiveMemberList,
      });
    }
  }
  // 部门变化
  partmentChangeAction = (value) => {
    const infoObj = Object.assign({}, this.state.infoObj, {
      department: value,
    });
    this.setState({
      infoObj,
      defaultPartmentInfo: {
        part1: '',
        part2: value,
      },
    });
    this.fetchAccountNameByDepartment(value);
  };
  // 根据部门来获取审批账户名称
  async fetchAccountNameByDepartment(pid) {
    const res = await fetchAccountByDepartment({
      department: pid,
      is_filter: 1,
    });
    if (res.data.status && res.data.data) {
      const list = res.data.data.list || [];
      const infoObj = Object.assign({}, this.state.infoObj, {
        account_id: isFirstDarpmentChange ? this.state.infoObj.account_id : '',
      });
      this.setState({
        accountList: list,
        infoObj,
      });
      isFirstDarpmentChange = false;
    }
  }
  // 输入框更改  原因和积分   如果是inputNumer 输入框 增加  _type 字段 为 number
  inputChangeAction(e, type, _type) {
    const value = _type === 'number' ? e : e.target.value;
    const attr = type;
    const target = Object.assign({}, this.state.infoObj, { [attr]: value });
    this.setState({
      infoObj: target,
    });
  }
  // 审批账户更改 事件
  accountChangeAction = (value) => {
    const { accountList } = this.state;
    const union_id = accountList.filter((item) => +item.id === +value)[0]
      .union_id;
    const infoObj = Object.assign({}, this.state.infoObj, {
      account_id: value,
      union_id,
    });
    this.setState({
      infoObj,
    });
  };

  // 選擇發放方式
  handleChange = (value) => {
    this.setState({
      dispatchPointType: value,
    });
  };

  handleChangeValidTime = (validTime) => {
    const { selected, designation } = validTime;
    const { infoObj } = this.state;
    infoObj.offer_points_valid_date = {
      type: selected,
      period: designation,
    };
    this.setState({ infoObj });
  };

  // 查找
  fetchSearchAccountAction = async () => {
    const { searchKeyWord } = this.state;
    if (!searchKeyWord || !searchKeyWord.trim()) {
      message.error('請填寫接受賬戶關鍵字!');
      return;
    }
    this.setState({
      isSearching: true,
      isOpenSelect: false,
      searchMemberList: [],
    });
    const {
      data: { data, status },
    } = await fetchMemberRequest({ keyword: searchKeyWord });
    if (status) {
      await this.setState({
        searchMemberList: data,
      });
    }
    this.timer = setTimeout(() => {
      this.setState({
        isSearching: false,
        isOpenSelect: true,
      });
    }, 500);
  };
  selectBlurAction = () => {
    this.setState({ isOpenSelect: false });
  };
  searchInputFocus = () => {
    this.setState({ isOpenSelect: true });
  };
  // 提交
  async submitAction() {
    const {
      isHasRight,
      id,
      infoObj,
      receiveMemberList,
      dispatchPointType,
      uploadPath,
    } = this.state;
    console.log(infoObj);
    const { offer_points_valid_date } = infoObj;
    if (!id) {
      if (!isHasRight) {
        message.error('無權限新增手動發放申請！');
        return;
      }
    }
    if (!infoObj.department) {
      message.warning('請選擇發分發起部門');
      return;
    }

    if (!infoObj.account_id) {
      message.warning('請選擇一個積分發放帳戶');
      return;
    }

    if (!infoObj.remark.trim()) {
      message.warning('請填寫發放原因');
      return;
    }
    if (!infoObj.title.trim()) {
      message.warning('請填寫積分明細顯示名稱描述');
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

    if (dispatchPointType === 1 && !receiveMemberList.length) {
      message.warning('接受帳戶不能爲空');
      return;
    }

    if (dispatchPointType === 1 && !infoObj.amount) {
      message.warning('請填寫積分預算審批額度');
      return;
    }

    if (dispatchPointType === 2 && uploadPath === null) {
      message.warning('請完成批量導入');
      return;
    }

    let receive_id = '';
    receiveMemberList.forEach((item) => {
      receive_id += `,${item.account_id}`;
    });
    infoObj.receive_id = receive_id.replace(/,/, '');
    const self = this;
    infoObj.remark = infoObj.remark.trim();
    infoObj.title = infoObj.title.trim();
    infoObj.type = dispatchPointType;
    infoObj.table_path = uploadPath;
    confirm({
      title: '提示',
      content:
        dispatchPointType === 1
          ? `正在向 ${receiveMemberList.length} 個會員賬戶發放 ${infoObj.amount} 積分/人，操作不可撤回，你還要繼續嗎？`
          : '正在批量發分，操作不可撤回，你還要繼續嗎？',
      onOk() {
        return new Promise(async (reslove) => {
          self.setState({
            isSubmiting: true,
          });
          try {
            const { data } = await createHandRequest(infoObj);
            reslove();
            if (data.status) {
              message.success('成功', 2, () => {
                self.setState({
                  isSubmiting: false,
                });
                window.location.reload();
              });
            } else {
              self.setState({
                isSubmiting: false,
              });
            }
          } catch (error) {
            console.log(error);
          } finally {
            self.setState({
              isSubmiting: false,
            });
          }
        });
      },
    });
  }
  render() {
    const {
      infoObj,
      accountList,
      defaultPartmentInfo,
      isDataLoading,
      isDisabledEdit,
      isSearching,
      receiveMemberList,
      searchMemberList,
      isOpenSelect,
      dispatchPointType,
      fileList,
      uploadPath,
    } = this.state;
    const { offer_points_valid_date } = infoObj;
    const { type, period } = offer_points_valid_date || {};
    // 部门审批账户选择 option
    const accountOptions = accountList.map((item) => {
      return (
        <Option key={item.id} value={item.id}>
          {item.account_name}
        </Option>
      );
    });

    const isHasHandRight = isUserHasRights([
      'points_management',
      'points_offer',
      'manual',
      'choice',
    ]);
    const isHasLoadRight = isUserHasRights([
      'points_management',
      'points_offer',
      'manual',
      'load',
    ]);

    const dispatchOptions = [];
    let defaultDispatch = 1;
    let hasDispatch = false;
    if (isHasHandRight) {
      hasDispatch = true;
      dispatchOptions.push(
        <Option key={1} value={1}>
          手動選擇
        </Option>
      );
    }
    if (isHasLoadRight) {
      hasDispatch = true;
      dispatchOptions.push(
        <Option key={2} value={2}>
          批量導入
        </Option>
      );
    }
    if (!isHasHandRight && isHasLoadRight) {
      defaultDispatch = 2;
    }

    if (isDataLoading) {
      return (
        <div className="p-hand-wrap p-give-wrap">
          <div className="give-content-wrap hand-content-wrap">
            <div className="list-wrap">
              <LoadingCom />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="p-hand-wrap p-give-wrap">
        <TabRouter tabList={INTEGRAL_GIVE_TABLIST} defaultKey="hand" />
        <div className="give-content-wrap hand-content-wrap">
          <div className="list-wrap">
            {this.state.id ? (
              <div className="list-item">
                <p className="item-title">發放項 ID</p>
                <div className="item-value-wrap">
                  <p>{this.state.id}</p>
                </div>
              </div>
            ) : null}
            <div className="list-item">
              <p className="item-title">發起部門</p>
              <div className="item-value-wrap">
                {/* <BelongDepartment
                  disabled={isDisabledEdit}
                  defaultValue={defaultPartmentInfo}
                  style={{ width: '360px' }}
                  onChange={this.partmentChangeAction}
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
                    onChange={this.accountChangeAction}
                    value={infoObj.account_id}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  >
                    {accountOptions}
                  </Select>
                </span>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">發放原因</p>
              <div className="item-value-wrap">
                <TextArea
                  disabled={isDisabledEdit}
                  onChange={(e) => this.inputChangeAction(e, 'remark')}
                  rows={5}
                  placeholder="請輸入發放項描述(100字以內)"
                  value={infoObj.remark}
                  style={{ width: '360px', resize: 'none' }}
                  maxLength={100}
                />
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">積分明細顯示名稱描述</p>
              <div className="item-value-wrap">
                <Input
                  disabled={isDisabledEdit}
                  style={{ width: '360px' }}
                  value={infoObj.title}
                  placeholder="10個字以內"
                  maxLength={10}
                  onChange={(e) => this.inputChangeAction(e, 'title')}
                />
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
              <p className="item-title">選擇發放會員</p>
              <Select
                defaultValue={defaultDispatch}
                onChange={this.handleChange}
              >
                {dispatchOptions}
              </Select>
            </div>
            {dispatchPointType === 1 ? (
              <div>
                <div className="list-item">
                  <p className="item-title">接受帳戶</p>
                  <div className="item-value-wrap">
                    <span
                      style={{
                        display: 'inline-block',
                        width: '360px',
                        marginRight: '10px',
                        position: 'relative',
                      }}
                    >
                      <Input
                        style={{
                          width: '360px',
                          top: '0',
                          left: '0',
                          position: 'absolute',
                          zIndex: 2,
                          opacity: 1,
                        }}
                        className="u-search-input"
                        value={this.state.searchKeyWord}
                        onChange={this.searchAction}
                        onFocus={this.searchInputFocus}
                        onBlur={this.selectBlurAction}
                        placeholder="請輸入會員ID/手機號/郵箱"
                      />
                      <Select
                        disabled={isDisabledEdit}
                        style={{ width: '100%', opacity: 0 }}
                        showArrow={false}
                        showSearch
                        // value={this.state.searchKeyWord}
                        placeholder="請輸入會員ID/手機號/郵箱"
                        // onSearch={this.searchAction}
                        onSelect={this.searchSelectAction}
                        open={isOpenSelect}
                        onBlur={this.selectBlurAction}
                        getPopupContainer={(triggerNode) =>
                          triggerNode.parentNode
                        }
                      >
                        {searchMemberList.map((item) => {
                          return (
                            <Option
                              key={item.account_id}
                              value={item.account_id}
                            >
                              （{item.account_id}）{item.nick_name}
                              {item.real_name ? `（${item.real_name}）` : ''}
                            </Option>
                          );
                        })}
                      </Select>
                    </span>
                    <span style={{ display: 'inline-block', width: '65px' }}>
                      <Button
                        loading={isSearching}
                        disabled={isSearching || isDisabledEdit}
                        onClick={this.fetchSearchAccountAction}
                      >
                        查找
                      </Button>
                    </span>
                    <div className="user-list-wrap">
                      {receiveMemberList.map((item, index) => {
                        return (
                          <div className="user-item" key={index}>
                            <div className="avatar-img">
                              <Avatar
                                className="img"
                                style={{
                                  verticalAlign: 'middle',
                                }}
                                size="large"
                                src={item.avatar_url}
                              >
                                {item.nick_name}
                              </Avatar>
                            </div>
                            <div className="item-desc-wrap">
                              <p className="desc-item name">{item.nick_name}</p>
                              <p className="desc-item">
                                ID：
                                <span className="item-value">
                                  {item.account_id}
                                </span>
                              </p>
                              <p className="desc-item">
                                電話：
                                <span className="item-value">
                                  {item.telephone || '暫無'}
                                </span>
                              </p>
                            </div>
                            {isDisabledEdit ? null : (
                              <Icon
                                type="close"
                                className="close-icon"
                                onClick={() =>
                                  this.deletReceiveMemberAction(item, index)
                                }
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="list-item">
                  <p className="item-title">積分發放數額</p>
                  <div className="item-value-wrap">
                    <div>
                      <InputToolTipCom
                        disabled={isDisabledEdit}
                        style={{ width: '120px' }}
                        placeholder="積分"
                        max={INPUT_NUMBER_MAX}
                        min={1}
                        step={1}
                        value={infoObj.amount}
                        onChange={(value) =>
                          this.inputChangeAction(value, 'amount', 'number')
                        }
                      />
                      <span
                        style={{
                          display: 'inline-block',
                          color: 'rgba(0,0,0,0.85)',
                          marginLeft: '10px',
                        }}
                      >
                        積分/人
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="list-item">
                <p className="item-title" />
                <div className="item-value-wrap">
                  <div
                    style={{
                      display: 'inline-block',
                    }}
                  >
                    <Upload
                      action={`${API_BASE}file_upload`}
                      headers={{ [HEADER_TOKEN_NAME]: getToken() }}
                      data={{ file_type: 2, modular: 'task_center' }}
                      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .xls, .xlsx, .XLS, .XLSX"
                      onChange={this.uploadHandleChange}
                      beforeUpload={this.beforeUpload}
                      listType="picture"
                      className="upload-list-inline"
                      fileList={fileList}
                    >
                      <Button
                        disabled={fileList.length > 0 ? true : false}
                        type="primary"
                      >
                        導入Execl
                      </Button>
                    </Upload>
                  </div>
                  <div
                    style={{
                      color: '#1890ff',
                      display: 'inline-block',
                      marginLeft: 24,
                    }}
                  >
                    <a href={DOWNLOAD_ADDR} download className="download">
                      下載Execl模板
                    </a>
                  </div>
                  <div>
                    <div
                      style={{
                        marginTop: 30,
                        fontSize: 16,
                        color: 'rgba(0,0,0,0.45)',
                      }}
                    >
                      批量發分工具使用方法
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        marginTop: 30,
                        color: 'rgba(0,0,0,0.45)',
                      }}
                    >
                      1、下載附件Excel表格 ，在表格內粘貼需要發分的會員ID
                      <br />
                      2、導入編輯好的Excel表格，點擊保存完成導入
                      <br />
                      3、填寫頁面其他必填項，等待手動發分審批完成即可
                      <br />
                      4、批量導入最大條數為1萬條
                      <br />
                      <div
                        style={{
                          marginTop: 40,
                        }}
                      >
                        *使用須知：請勿修改Excel 表頭，僅粘貼會員ID即可
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="footer-wrap">
            <CancelBtnCom />
            {isDisabledEdit ? null : (
              <Button
                type="primary"
                onClick={() => this.submitAction()}
                disabled={this.state.isSubmiting}
                loading={this.state.isSubmiting}
              >
                提交
              </Button>
            )}
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
  }))(HandPage)
);
