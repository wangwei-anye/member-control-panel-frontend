/* eslint-disable global-require */
/* eslint-disable no-plusplus */
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Steps,
  Select,
  Input,
  Button,
  Icon,
  Radio,
  message,
  Spin,
  DatePicker,
  Upload,
  InputNumber,
} from 'antd';

import { fetchAccountByDepartment } from 'services/integralManage/approve/approve';
import {
  addCustomBaseRequest,
  updateCustomBaseRequest,
  fetchCustomDetailRequest,
} from 'services/memberTask';
import { getImgRequest } from 'services/common/common';
import UploadComponents from 'components/Upload';
import CancelBtnCom from 'components/CancelBtn';
import DateAndTimeInput from 'components/DateAndTimeInput';
import moment from 'moment';
import { INPUT_NUMBER_MAX, HEADER_TOKEN_NAME, API_BASE } from 'constants';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import { getToken } from 'utils/session';
import PreviewComponent from 'components/PreviewComponent';
import UploadTipAndDownTmpCom from 'components/UploadTipAndDownTmp';
import './config.less';

const Option = Select.Option;
const { TextArea } = Input;
const Step = Steps.Step;
let isFirstDarpmentChange = false; // 用于判断是否是从请求的详情数据来 判断账户名称

class ConfigStep1Page extends React.Component {
  constructor(props) {
    super(props);
    const id = props.system.query.id || '';
    const editType = props.system.query.type || '';
    this.state = {
      id,
      isDisabledEdit: editType === 'look',
      editType,
      entryInfo: {
        base_task_config: {
          task_title: '', // 任務標題
          task_sub_title: '', // 任務fu標題
          task_desc: '', // 发放项描述
          task_image_url: {
            file_name: '',
            approval_annex: '',
            file_url: '',
          },
          reference: '', // 條款及細則
        },
        reward_config: {
          reward_type: 0,
          reward_value: 1,
          reward_title: '',
          reward_dec: '',
          get_reward_txt: '',
          reward_limit: 1,
          receive_prize_type: 0, // 固定 0  手動領取
        },
        // 任务周期
        task_config: {
          start_time: moment().add(1, 'day').format('YYYY-MM-DD HH:mm'), // 生效开始时间
          task_cycle: {
            is_repeat: 1,
            cycle_type: 'day', // day=天/week=周/month=月
            cycle_value: 1,
            cycle_type_value: 1,
          },
          end_time_json: {
            end_time_type: 1, // 0 按重复次数, 1 按固定时间
            repeat_time: 1,
            fix_datetime: moment().add(8, 'day').format('YYYY-MM-DD HH:mm'), // 生效结束时间
          },
          cycle_limit_time: 1,
          join_type: 0, // 固定是0
        },
        // 白名单
        task_for: {
          task_for_type: 0,
          task_users_file_url: [],
        },
      },
      task_period: [],
      cycle_type_value_day: 0,
      cycle_type_value_date: 1,
      white_fileList: [],
      isSubmiting: false,
      isDataLoading: true,
      listType: 'picture-card',
      fileList: [],
      fileUrl: '',
      fileName: '',
      previewVisible: false,
      previewFileType: 1,
      previewUrl: '',
    };
    this.NODE_ENV = process.env.environment;
  }

  async componentDidMount() {
    const { id } = this.state;
    if (!id) {
      this.setState({
        isDataLoading: false,
      });
      return;
    }
    this.setState({
      isDataLoading: true,
    });
    isFirstDarpmentChange = true;
    const { data } = await fetchCustomDetailRequest({ id });
    let fileUrl = '';
    let fileName = 'a.png';
    if (data.status) {
      const detailInfo = data.data;
      if (
        detailInfo.base_task_config.task_image_url &&
        detailInfo.base_task_config.task_image_url.approval_annex
      ) {
        fileUrl = detailInfo.base_task_config.task_image_url.file_url; // 显示用
        fileName = detailInfo.base_task_config.task_image_url.file_name;
      }

      detailInfo.task_config.start_time = moment(
        detailInfo.task_config.start_time
      ).format('YYYY-MM-DD HH:mm');
      // NOTE: 保存原先选择的账户 ID;
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

      this.setState(
        {
          entryInfo: detailInfo,
          fileList,
          previewUrl: fileUrl,
          listType: ext === 'pdf' ? 'picture' : 'picture-card',
          previewFileType: ext === 'pdf' ? 2 : 1,
        },
        () => {
          this.calculateDate();
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

  // 開始時間更改事件
  dateAndTimeChangeAction(value) {
    const dateNow = moment(value.start_time);
    const cycle_type_value_day = dateNow.day();
    const cycle_type_value_date = dateNow.date();
    const task_config = Object.assign({}, this.state.entryInfo.task_config, {
      start_time: value.start_time,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      task_config,
    });
    this.setState(
      {
        entryInfo,
        cycle_type_value_day,
        cycle_type_value_date,
      },
      () => {
        this.calculateDate();
      }
    );
  }

  // 输入框 更改事件
  handleInputChangeAction = (dataType, type, e) => {
    const { value } = e.target;
    const dataObj = Object.assign({}, this.state.entryInfo[dataType], {
      [type]: value,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      [dataType]: dataObj,
    });
    this.setState({
      entryInfo,
    });
  };
  // 直接取值的控件 更改事件
  handleValueChangeAction = (dataType, type, value) => {
    const dataObj = Object.assign({}, this.state.entryInfo[dataType], {
      [type]: value,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      [dataType]: dataObj,
    });
    this.setState({
      entryInfo,
    });
  };

  // 任務週期 更改事件
  handleTaskCycleChangeAction = (type, value) => {
    const task_cycle = Object.assign(
      {},
      this.state.entryInfo.task_config.task_cycle,
      {
        [type]: value,
      }
    );
    const task_config = Object.assign({}, this.state.entryInfo.task_config, {
      task_cycle,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      task_config,
    });
    this.setState(
      {
        entryInfo,
      },
      () => {
        this.calculateDate();
      }
    );
  };
  // 任務週期 結束時間 更改事件
  handleTaskCycleEndTimeChangeAction = (type, value) => {
    if (type === 'end_time_type') {
      value = value.target.value;
    }
    const end_time_json = Object.assign(
      {},
      this.state.entryInfo.task_config.end_time_json,
      {
        [type]: value,
      }
    );
    const task_config = Object.assign({}, this.state.entryInfo.task_config, {
      end_time_json,
    });
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      task_config,
    });
    this.setState(
      {
        entryInfo,
      },
      () => {
        this.calculateDate();
      }
    );
  };

  calculateDate = () => {
    const { entryInfo } = this.state;
    const { start_time, task_cycle, end_time_json } = entryInfo.task_config;
    if (start_time && task_cycle.is_repeat === 1 && task_cycle.cycle_value) {
      if (end_time_json.end_time_type === 0) {
        if (!end_time_json.repeat_time) {
          this.setPeriodNull();
          return;
        }
      }
      if (end_time_json.end_time_type === 1) {
        if (!end_time_json.fix_datetime) {
          this.setPeriodNull();
          return;
        }
      }
      const dateArr = [];
      const startTime = moment(start_time);
      if (end_time_json.end_time_type === 0) {
        dateArr.push(start_time);
        let tempStartTime = startTime;
        for (let i = 0; i < end_time_json.repeat_time; i += 1) {
          const tempEndTime = this.getPeriodTime(
            tempStartTime,
            task_cycle.cycle_type,
            task_cycle.cycle_value
          );
          dateArr.push(tempEndTime.format('YYYY-MM-DD HH:mm:ss'));
          tempStartTime = tempEndTime;
        }
      }
      if (end_time_json.end_time_type === 1) {
        let tempEndTime = this.getPeriodTime(
          startTime,
          task_cycle.cycle_type,
          task_cycle.cycle_value
        );
        const endTime = moment(end_time_json.fix_datetime);
        let i = 1;
        while (tempEndTime.isBefore(endTime) && i < 30) {
          dateArr.push(tempEndTime.format('YYYY-MM-DD HH:mm:ss'));
          tempEndTime = this.getPeriodTime(
            tempEndTime,
            task_cycle.cycle_type,
            task_cycle.cycle_value
          );
          i++;
        }
      }
      const task_config = Object.assign({}, this.state.entryInfo.task_config, {
        end_time: dateArr.length > 0 ? dateArr[dateArr.length - 1] : '',
      });
      const tempEntryInfo = Object.assign({}, this.state.entryInfo, {
        task_config,
      });
      this.setState({
        task_period: dateArr,
        entryInfo: tempEntryInfo,
      });
    } else {
      this.setPeriodNull();
    }
  };
  setPeriodNull = () => {
    const task_config = Object.assign({}, this.state.entryInfo.task_config, {
      end_time: '',
    });
    const tempEntryInfo = Object.assign({}, this.state.entryInfo, {
      task_config,
    });
    this.setState({
      task_period: [],
      entryInfo: tempEntryInfo,
    });
  };
  getPeriodTime = (startTime, type, value) => {
    if (type === 'day') {
      return startTime.add(value, 'day');
    }
    if (type === 'week') {
      return startTime.add(value, 'week');
    }
    if (type === 'month') {
      return startTime.add(value, 'month');
    }
  };

  // 文件上传成功事件
  fileUploadSuccessAction = (values) => {
    const { path, type, absolute_path, fileList, file_type, file_name } =
      values;
    let task_image_url;
    let listType = 'picture-card';
    let attrFilesList = [];
    if (type === 'done' && path) {
      task_image_url = {
        file_name,
        approval_annex: path,
        file_url: absolute_path,
      };
      attrFilesList = [...fileList];
      listType = file_type === 1 ? 'picture-card' : 'picture';
    }

    const base_task_config = Object.assign(
      {},
      this.state.entryInfo.base_task_config,
      {
        task_image_url,
      }
    );
    const entryInfo = Object.assign({}, this.state.entryInfo, {
      base_task_config,
    });
    this.setState({
      entryInfo,
      fileList: attrFilesList,
      listType,
      previewFileType: file_type,
    });
  };
  // 白名单上传成功事件
  uploadHandleChange = async ({ fileList }) => {
    this.setState({
      white_fileList: fileList,
    });
  };
  deleteWhiteFile = (index) => {
    const fileList = this.state.white_fileList;
    fileList.splice(index, 1);
    this.setState({
      white_fileList: fileList,
    });
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
    const {
      entryInfo,
      id,
      cycle_type_value_day,
      cycle_type_value_date,
      white_fileList,
      task_period,
    } = this.state;
    const { base_task_config, task_config, task_for, reward_config } =
      entryInfo;
    const { task_title, task_sub_title, task_desc, task_image_url, reference } =
      base_task_config;
    const {
      reward_type,
      reward_value,
      reward_title,
      reward_dec,
      get_reward_txt,
      reward_limit,
    } = reward_config;
    const { start_time, end_time_json, task_cycle } = task_config;

    if (!task_title.trim()) {
      message.error('任務標題不能爲空!');
      return;
    }
    if (!task_sub_title.trim()) {
      message.error('任務副標題不能爲空!');
      return;
    }
    if (!task_desc.trim()) {
      message.error('任務描述不能爲空!');
      return;
    }
    if (!task_image_url.approval_annex.trim()) {
      message.error('任務詳情圖片不能爲空!');
      return;
    }
    if (!reference.trim()) {
      message.error('條款及細則不能爲空!');
      return;
    }

    if (!id && new Date(start_time) * 1 <= new Date() * 1) {
      message.error('生效時間選擇有誤，開始時間不能小於等於當前時間!');
      return;
    }
    if (task_cycle.is_repeat === 1) {
      if (!task_cycle.cycle_value) {
        message.error('任務週期不能爲空!');
        return;
      }
      if (task_period && task_period.length > 0) {
        entryInfo.task_config.task_cycle.cycle_repeat_time = task_period.length;
      }
    }
    if (end_time_json.end_time_type === 0) {
      if (!end_time_json.repeat_time) {
        message.error('結束時間不能爲空!');
        return;
      }
    }
    if (end_time_json.end_time_type === 1) {
      if (!end_time_json.fix_datetime) {
        message.error('結束時間不能爲空!');
        return;
      }
      entryInfo.task_config.end_time_json.fix_datetime = moment(
        entryInfo.task_config.end_time_json.fix_datetime
      ).format('YYYY-MM-DD HH:mm');
    }

    if (end_time_json.end_time_type === 1) {
      if (new Date(start_time) * 1 >= new Date(end_time_json.fix_datetime)) {
        message.error('生效時間選擇有誤，開始時間不能大於或等於結束時間!');
        return;
      }
    }

    if (entryInfo.task_for.task_for_type === 1) {
      if (white_fileList.length === 0) {
        message.error('請上傳白名單!');
        return;
      }
      const arr = [];
      for (let i = 0; i < white_fileList.length; i++) {
        arr.push({
          title: white_fileList[i].name,
          url: white_fileList[i].response.data.path,
        });
      }
      entryInfo.task_for.task_users_file_url = arr;
    }

    if (reward_type === 0 || reward_type === 2) {
      if (!reward_value) {
        message.error('獎勵額度不能爲空!');
        return;
      }
    }
    if (reward_type === 1 || reward_type === 2) {
      if (!reward_title.trim()) {
        message.error('自訂獎勵名稱不能爲空!');
        return;
      }
      if (!reward_dec.trim()) {
        message.error('自訂獎勵描述不能爲空!');
        return;
      }
    }
    if (!get_reward_txt.trim()) {
      message.error('成功領獎信息不能爲空!');
      return;
    }
    if (!reward_limit) {
      message.error('獎勵封頂不能爲空!');
      return;
    }

    if (entryInfo.task_config.task_cycle.cycle_type === 'week') {
      entryInfo.task_config.task_cycle.cycle_type_value = cycle_type_value_day;
    }
    if (entryInfo.task_config.task_cycle.cycle_type === 'month') {
      entryInfo.task_config.task_cycle.cycle_type_value = cycle_type_value_date;
    }

    entryInfo.base_task_config.task_title =
      entryInfo.base_task_config.task_title.trim();
    entryInfo.base_task_config.task_sub_title =
      entryInfo.base_task_config.task_sub_title.trim();
    entryInfo.base_task_config.task_desc =
      entryInfo.base_task_config.task_desc.trim();
    const postData = { ...entryInfo };
    return postData;
  }

  // 下一步
  async nextAction(type) {
    if (type === 'look') {
      const { id } = this.state;
      this.props.history.push(
        '/member-task/config/account?id=' + id + '&type=look'
      );
    } else {
      const postData = this.formatData();
      console.log(postData);
      if (postData) {
        const { id } = this.state;
        if (postData.offer_rules) {
          delete postData.offer_rules;
        }
        this.setState({
          isSubmiting: true,
        });
        const updatePostData = Object.assign({}, postData, {
          id,
          action: 'temporary_storage',
          step: 'base_info',
        });
        const { data } = this.state.id
          ? await updateCustomBaseRequest(updatePostData)
          : await addCustomBaseRequest(postData);
        this.setState({
          isSubmiting: false,
        });
        if (data.status) {
          message.success('成功!');
          const returnId = this.state.id || data.data.id;
          if (returnId) {
            if (this.state.editType === 'edit') {
              this.props.history.push(
                '/member-task/config/account?id=' + returnId + '&type=edit'
              );
            } else {
              this.props.history.push(
                '/member-task/config/account?id=' + returnId
              );
            }
          } else {
            message.error('返回參數ID有誤!');
          }
        }
      }
    }
  }

  render() {
    const {
      entryInfo,
      cycle_type_value_day,
      cycle_type_value_date,
      isDataLoading,
      listType,
      fileList,
      isDisabledEdit,
      previewFileType,
      previewUrl,
      previewVisible,
      white_fileList,
      task_period,
    } = this.state;
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
              <Step title="配置積分發放項" />
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

    const MonthConfig = [];
    for (let i = 1; i <= 31; i += 1) {
      MonthConfig.push({ key: i, value: i + '號' });
    }

    return (
      <div className="p-custom-configstep-wrap">
        <div className="step-wrap">
          <Steps current={0}>
            <Step title="基本信息" />
            <Step title="配置積分發放項" />
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
                  <p className="item-title">任務ID</p>
                  <div className="item-value-wrap">
                    <p>{this.state.id}</p>
                  </div>
                </div>
              ) : null}
              <div className="list-item">
                <p className="item-title">任務標題</p>
                <div className="item-value-wrap">
                  <Input
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    placeholder=" 請輸入任務標題（18個字符內）"
                    value={entryInfo.base_task_config.task_title}
                    maxLength={18}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'base_task_config',
                      'task_title'
                    )}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">任務副標題</p>
                <div className="item-value-wrap">
                  <Input
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    placeholder="請輸入任務副標題（18個字符內）"
                    value={entryInfo.base_task_config.task_sub_title}
                    maxLength={18}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'base_task_config',
                      'task_sub_title'
                    )}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">任務描述</p>
                <div className="item-value-wrap">
                  <TextArea
                    disabled={isDisabledEdit}
                    rows={5}
                    style={{ width: '360px', resize: 'none' }}
                    placeholder="請輸入任務描述（200個字符內）"
                    value={entryInfo.base_task_config.task_desc}
                    maxLength={200}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'base_task_config',
                      'task_desc'
                    )}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">任務圖片</p>
                <div className="item-value-wrap">
                  <div
                    className="select-time-wrap"
                    style={{ overflow: 'hidden' }}
                  >
                    <UploadComponents
                      disabled={isDisabledEdit}
                      listType={listType}
                      fileList={fileList}
                      data={{ file_type: 1, modular: 'member_task' }}
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
                    </UploadComponents>
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
              <div className="list-item">
                <p className="item-title">條款及細則</p>
                <div className="item-value-wrap">
                  <TextArea
                    disabled={isDisabledEdit}
                    rows={5}
                    style={{ width: '360px', resize: 'none' }}
                    placeholder="請輸入條款內容"
                    value={entryInfo.base_task_config.reference}
                    maxLength={100}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'base_task_config',
                      'reference'
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="step-title">任務配置</p>
          <div className="p-approve-set-wrap">
            <div className="approve-set-content">
              <div className="list-item">
                <p className="item-title">開始時間</p>
                <div className="item-value-wrap">
                  <div className="select-time-wrap">
                    <DateAndTimeInput
                      disabled={isDisabledEdit}
                      dateInfo={{
                        start_time: entryInfo.task_config.start_time,
                      }}
                      onChange={this.dateAndTimeChangeAction.bind(this)}
                    />
                  </div>
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">任務週期</p>
                <div className="item-value-wrap">
                  <div className="select-time-wrap">
                    <Select
                      disabled={isDisabledEdit}
                      style={{ width: '120px', marginRight: '10px' }}
                      getPopupContainer={(triggerNode) =>
                        triggerNode.parentNode
                      }
                      onChange={this.handleTaskCycleChangeAction.bind(
                        this,
                        'is_repeat'
                      )}
                      value={entryInfo.task_config.task_cycle.is_repeat}
                    >
                      <Option value={0}>不重複</Option>
                      <Option value={1}>重複</Option>
                    </Select>
                    {entryInfo.task_config.task_cycle.is_repeat === 0 ? null : (
                      <React.Fragment>
                        <span
                          style={{
                            display: 'inline-block',
                            color: 'rgba(0,0,0,0.85)',
                            marginRight: '10px',
                          }}
                        >
                          每
                        </span>
                        <InputToolTipCom
                          disabled={isDisabledEdit}
                          value={entryInfo.task_config.task_cycle.cycle_value}
                          onChange={this.handleTaskCycleChangeAction.bind(
                            this,
                            'cycle_value'
                          )}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => value.replace(/(,*)/g, '')}
                          min={1}
                          step={1}
                          style={{ width: '90px', marginRight: '10px' }}
                        />
                        <Select
                          disabled={isDisabledEdit}
                          style={{ width: '80px', marginRight: '10px' }}
                          getPopupContainer={(triggerNode) =>
                            triggerNode.parentNode
                          }
                          value={entryInfo.task_config.task_cycle.cycle_type}
                          onChange={this.handleTaskCycleChangeAction.bind(
                            this,
                            'cycle_type'
                          )}
                        >
                          <Option value="day">天</Option>
                          <Option value="week">周</Option>
                          <Option value="month">月</Option>
                        </Select>
                        {entryInfo.task_config.task_cycle.cycle_type ===
                        'week' ? (
                          <Select
                            disabled
                            style={{ width: '80px', marginRight: '10px' }}
                            getPopupContainer={(triggerNode) =>
                              triggerNode.parentNode
                            }
                            value={cycle_type_value_day}
                          >
                            <Option value={0}>週日</Option>
                            <Option value={1}>週一</Option>
                            <Option value={2}>週二</Option>
                            <Option value={3}>週三</Option>
                            <Option value={4}>週四</Option>
                            <Option value={5}>週五</Option>
                            <Option value={6}>週六</Option>
                          </Select>
                        ) : null}
                        {entryInfo.task_config.task_cycle.cycle_type ===
                        'month' ? (
                          <Select
                            disabled
                            style={{ width: '80px', marginRight: '10px' }}
                            getPopupContainer={(triggerNode) =>
                              triggerNode.parentNode
                            }
                            value={cycle_type_value_date}
                          >
                            {MonthConfig.map((item) => {
                              return (
                                <Option key={item.key} value={item.key}>
                                  {item.value}
                                </Option>
                              );
                            })}
                          </Select>
                        ) : null}

                        {/* <InputNumber
                          disabled={isDisabledEdit}
                          style={{ width: '80px', marginRight: '5px' }}
                          max={23}
                          min={0}
                          step={1}
                          formatter={(value) => {
                            const str = value.toString();
                            return str[1] ? value : `0${value}`;
                          }}
                          onChange={(value) =>
                            this.timeChangeAction(value, 'startHour')
                          }
                        />
                        <span
                          style={{
                            display: 'inline-block',
                            color: 'rgba(0,0,0,0.85)',
                            marginRight: '5px',
                          }}
                        >
                          :
                        </span>
                        <InputNumber
                          disabled={isDisabledEdit}
                          style={{ width: '80px' }}
                          max={23}
                          min={0}
                          step={1}
                          formatter={(value) => {
                            const str = value.toString();
                            return str[1] ? value : `0${value}`;
                          }}
                          onChange={(value) =>
                            this.timeChangeAction(value, 'startHour')
                          }
                        /> */}
                      </React.Fragment>
                    )}
                  </div>
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">結束時間</p>
                <div className="item-value-wrap">
                  <div>
                    <Radio.Group
                      disabled={isDisabledEdit}
                      onChange={this.handleTaskCycleEndTimeChangeAction.bind(
                        this,
                        'end_time_type'
                      )}
                      value={entryInfo.task_config.end_time_json.end_time_type}
                    >
                      <Radio value={0}>
                        <span
                          style={{
                            display: 'inline-block',
                            color: 'rgba(0,0,0,0.85)',
                            marginRight: '10px',
                          }}
                        >
                          重複
                        </span>
                        <InputToolTipCom
                          disabled={isDisabledEdit}
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                          }
                          parser={(value) => value.replace(/(,*)/g, '')}
                          max={INPUT_NUMBER_MAX}
                          min={1}
                          step={1}
                          style={{ width: '120px' }}
                          onChange={this.handleTaskCycleEndTimeChangeAction.bind(
                            this,
                            'repeat_time'
                          )}
                          value={
                            entryInfo.task_config.end_time_json.repeat_time
                          }
                        />
                        <span
                          style={{
                            display: 'inline-block',
                            color: 'rgba(0,0,0,0.85)',
                            marginLeft: '10px',
                          }}
                        >
                          次後結束
                        </span>
                      </Radio>
                      <Radio value={1}>
                        <span
                          style={{
                            display: 'inline-block',
                            color: 'rgba(0,0,0,0.85)',
                            marginRight: '10px',
                          }}
                        >
                          固定時間
                        </span>
                        <DatePicker
                          disabled={isDisabledEdit}
                          showTime
                          onChange={this.handleTaskCycleEndTimeChangeAction.bind(
                            this,
                            'fix_datetime'
                          )}
                          value={
                            entryInfo.task_config.end_time_json.fix_datetime
                              ? moment(
                                  entryInfo.task_config.end_time_json
                                    .fix_datetime,
                                  'YYYY-MM-DD'
                                )
                              : null
                          }
                        />
                      </Radio>
                    </Radio.Group>
                  </div>
                </div>
              </div>
              {entryInfo.task_config.task_cycle.is_repeat === 0 ? null : (
                <div className="list-item">
                  <p className="item-title">任務周期日子</p>
                  <div className="item-value-wrap">
                    <div className="item-value-wrap-time-list">
                      {task_period.map((item, index) => {
                        return (
                          <div key={index}>
                            第{index + 1}次 ： {item}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              <div className="list-item">
                <p className="item-title">參與時限</p>
                <div className="item-value-wrap">
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        color: 'rgba(0,0,0,0.85)',
                        marginRight: '10px',
                      }}
                    >
                      參與任務起計
                    </span>
                    <InputToolTipCom
                      disabled={isDisabledEdit}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/(,*)/g, '')}
                      max={INPUT_NUMBER_MAX}
                      min={1}
                      step={1}
                      style={{ width: '120px' }}
                      value={entryInfo.task_config.cycle_limit_time}
                      onChange={this.handleValueChangeAction.bind(
                        this,
                        'task_config',
                        'cycle_limit_time'
                      )}
                    />
                    <span
                      style={{
                        display: 'inline-block',
                        color: 'rgba(0,0,0,0.85)',
                        marginLeft: '10px',
                      }}
                    >
                      天內
                    </span>
                    <span
                      style={{
                        display: 'inline-block',
                        color: 'rgba(0,0,0,0.45)',
                        marginLeft: '24px',
                      }}
                    >
                      *輸入0代表沒有時限
                    </span>
                  </div>
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">任務對象</p>
                <div className="item-value-wrap">
                  <Select
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    value={entryInfo.task_for.task_for_type}
                    onChange={this.handleValueChangeAction.bind(
                      this,
                      'task_for',
                      'task_for_type'
                    )}
                  >
                    <Option value={0}>所有會員</Option>
                    <Option value={1}>白名單</Option>
                  </Select>
                  {entryInfo.task_for.task_for_type === 1 ? (
                    <React.Fragment>
                      <div style={{ marginTop: 16 }}>
                        <div>
                          <Button
                            type="primary"
                            onClick={() => {
                              this.whiteUploadElement.click();
                            }}
                          >
                            上載白名單
                          </Button>
                          <span
                            style={{
                              marginLeft: 34,
                              color: ' #818d99',
                              display: 'inline-block',
                            }}
                          >
                            共2930條
                          </span>
                        </div>
                        <div style={{ display: 'none' }}>
                          <Upload
                            action={`${API_BASE}file_upload`}
                            headers={{ [HEADER_TOKEN_NAME]: getToken() }}
                            data={{ file_type: 2, modular: 'task_center' }}
                            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .xls, .xlsx, .XLS, .XLSX"
                            onChange={this.uploadHandleChange}
                            beforeUpload={this.beforeUpload}
                            listType="picture"
                          >
                            <div
                              ref={(input) => (this.whiteUploadElement = input)}
                            >
                              上載白名單
                            </div>
                          </Upload>
                        </div>
                        <div>
                          <div className="white_file_list">
                            {white_fileList.map((item, index) => {
                              return (
                                <div key={index} className="white_file_item">
                                  <span className="white_file_item_link">
                                    <Icon type="link" />
                                  </span>
                                  {item.name}
                                  <span
                                    className="white_file_item_close"
                                    onClick={() => {
                                      this.deleteWhiteFile(index);
                                    }}
                                  >
                                    <Icon type="close" />
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ) : null}
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">參加任務</p>
                <div className="item-value-wrap">自動</div>
              </div>
            </div>
          </div>
          <p className="step-title">獎勵配置</p>
          <div className="p-approve-set-wrap">
            <div className="approve-set-content">
              <div className="list-item">
                <p className="item-title">獎勵類型</p>
                <div className="item-value-wrap">積分</div>
              </div>
              <div className="list-item">
                <p className="item-title">獎勵額度</p>
                <div className="item-value-wrap">
                  <InputToolTipCom
                    disabled={isDisabledEdit}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/(,*)/g, '')}
                    max={INPUT_NUMBER_MAX}
                    min={1}
                    step={1}
                    style={{ width: '120px' }}
                    onChange={this.handleValueChangeAction.bind(
                      this,
                      'reward_config',
                      'reward_value'
                    )}
                    value={entryInfo.reward_config.reward_value}
                  />
                </div>
              </div>
              {/* <div className="list-item">
                <p className="item-title">自訂獎勵名稱</p>
                <div className="item-value-wrap">
                  <Input
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    placeholder="請輸入獎勵名稱"
                    value={entryInfo.reward_config.reward_title}
                    maxLength={20}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'reward_config',
                      'reward_title'
                    )}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">自訂獎勵描述</p>
                <div className="item-value-wrap">
                  <Input
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    placeholder="請輸入獎勵描述"
                    value={entryInfo.reward_config.reward_dec}
                    maxLength={20}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'reward_config',
                      'reward_dec'
                    )}
                  />
                </div>
              </div> */}
              <div className="list-item">
                <p className="item-title">成功領獎信息</p>
                <div className="item-value-wrap">
                  <Input
                    disabled={isDisabledEdit}
                    style={{ width: '360px' }}
                    placeholder="請輸入領獎信息"
                    value={entryInfo.reward_config.get_reward_txt}
                    maxLength={20}
                    onChange={this.handleInputChangeAction.bind(
                      this,
                      'reward_config',
                      'get_reward_txt'
                    )}
                  />
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">封頂</p>
                <div className="item-value-wrap">
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        color: 'rgba(0,0,0,0.85)',
                        marginRight: '10px',
                      }}
                    >
                      每任務周期最多獲得
                    </span>
                    <InputToolTipCom
                      disabled={isDisabledEdit}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }
                      parser={(value) => value.replace(/(,*)/g, '')}
                      max={INPUT_NUMBER_MAX}
                      min={1}
                      step={1}
                      style={{ width: '130px' }}
                      value={entryInfo.reward_config.reward_limit}
                      onChange={this.handleValueChangeAction.bind(
                        this,
                        'reward_config',
                        'reward_limit'
                      )}
                    />
                    <span
                      style={{
                        display: 'inline-block',
                        color: 'rgba(0,0,0,0.85)',
                        marginLeft: '10px',
                      }}
                    >
                      次
                    </span>
                  </div>
                </div>
              </div>
              <div className="list-item">
                <p className="item-title">領取獎勵方式</p>
                <div className="item-value-wrap">手動領取</div>
              </div>
            </div>
            <div className="footer-wrap">
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
  connect(({ system, auth }) => ({
    system: system.toJS(),
    auth: auth.toJS(),
  }))(ConfigStep1Page)
);
