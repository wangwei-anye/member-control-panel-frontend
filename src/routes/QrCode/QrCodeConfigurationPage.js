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
import { capTopTypeJsonListForQrcode } from 'config/ob.config';
import PreviewComponent from 'components/PreviewComponent';
import UploadTipAndDownTmpCom from 'components/UploadTipAndDownTmp';
import IntegralValidTime from 'components/Integral/IntegralValidTime';
import PromptLeave from 'components/PromptLeave';
import './index.less';

const Option = Select.Option;
const { TextArea } = Input;
const CHANNEL_ID = '1';
let isFirstDarpmentChange = false;

class QrCodeConfigurationPage extends React.Component {
  constructor(props) {
    super(props);
    const {
      system: { query },
    } = props;
    const id = query.id || '';
    const group_id = query.group_id || '';
    const editType = query.type || '';
    const out_sn =
      query.out_sn || sessionStorage.getItem('MCP_01_OUT_OUT_SN') || '';
    const app_id =
      query.app_id || sessionStorage.getItem('MCP_01_OUT_APP_ID') || '';
    this.state = {
      id,
      app_id,
      group_id,
      out_sn,
      isDisabledEidt: editType === 'look',
      entryInfo: {
        title: '',
        channel_id: CHANNEL_ID,
        initiate_department: this.props.auth.department, // ????????????id
        start_time: moment().add(1, 'day').format('YYYY-MM-DD HH:mm'),
        end_time: moment().add(8, 'day').format('YYYY-MM-DD HH:mm'),
        offer_account: null, // ????????????id
        offer_account_union_id: '', // ????????????union_id
        entry_desc: '', // ???????????????
        change_type: 1, // ????????????,1??????,-1??????
        stop_rule_points: null, // ????????????:????????????????????????????????????
        offer_points_valid_date: {
          // ???????????????
          type: '',
          period: '',
        },
        approval_annex: '', // ????????????
        offer_rules: {
          pay: 1, // ???????????????
          points: null, // ???????????????
          top: {
            dimenssion: '', // ????????????  ???????????? no_top
            most: null, // ???????????????????????????????????????
          },
        },
      },
      accountList: [], // ??????list
      previewVisible: false,
      fileList: [],
      previewUrl: '',
      previewFileType: 1,
      isSubmiting: false,
      isDateLoading: true,
      defaultPartmentInfo: {},
      listType: 'picture-card',
      publishAction: false,
    };
  }

  async componentWillMount() {
    const { id } = this.state;
    if (!id) {
      this.setState({
        isDateLoading: false,
        defaultPartmentInfo: {
          part2: this.props.auth.department,
        },
      });
      return;
    }
    isFirstDarpmentChange = true;
    const { data } = await fetchCustomDetailRequest({ id });
    let fileUrl = '';
    let fileName = '';
    if (data.status) {
      const dataInfo = data.data;
      const entryInfo = Object.assign({}, this.state.entryInfo, dataInfo);
      const { offer_points_valid_date } = entryInfo;
      const defaultPartmentInfo = {
        part2: dataInfo.initiate_department,
        part1: dataInfo.department_pid,
      };

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

  // NOTE: ??????????????????????????? ant-design ????????????, ??????????????????
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

  // ???????????????????????????list
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
          account_name: `${offer_account_name} (?????????)`,
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

  // ?????? inputNumber ?????????????????????
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
    } else if (type === 'points') {
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
  // ????????????????????????
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

  checkEntryNameVaildate = (entryName) => {
    const chCharReg = new RegExp('[\u4E00-\u9FA5]+');
    const enCharReg = new RegExp('[A-Za-z0-9]+');
    let count = 0;
    for (let i = 0; i < entryName.length; i += 1) {
      const char = entryName[i];
      // ??????
      if (chCharReg.test(char)) {
        count += 2;
      } else {
        // ??????
        count += 1;
      }
    }
    return count;
  };

  commonCheck = (str, errorMsg) => {
    const count = this.checkEntryNameVaildate(str);
    if (count > 20) {
      message.error(errorMsg);
      return false;
    }
    return true;
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

  formatData() {
    const { entryInfo, id } = this.state;
    const {
      start_time,
      end_time,
      entry_name,
      entry_desc,
      title,
      offer_account,
      stop_rule_points,
      offer_rules: { points, top },
      approval_annex,
      offer_points_valid_date,
    } = entryInfo;
    console.log(entryInfo);
    if (!entry_name || !entry_name.trim()) {
      message.error('?????????!');
      return;
    }

    if (entry_name.length > 20) {
      message.error('?????????????????????????????????????????????!');
      return;
    }

    if (!entry_desc || !entry_desc.trim()) {
      message.error('?????????????????????!');
      return;
    }
    if (!title || !title.trim()) {
      message.error('???????????????????????????????????????!');
      return;
    }

    if (
      !this.commonCheck(title.trim(), '?????????????????????????????????????????????????????????!')
    ) {
      return;
    }

    if (!offer_account) {
      message.error('?????????????????????????????????!');
      return;
    }

    const { dimenssion, most } = top;

    if (!dimenssion) {
      message.error('??????????????????????????????');
      return;
    }

    if (dimenssion !== 'no_top') {
      if (!most || most <= 0) {
        message.error('?????????????????????????????????');
        return;
      }
      if (`${most}`.indexOf('.') > -1) {
        message.error('???????????????????????????????????????');
        return;
      }
    }

    if (!points || points <= 0) {
      message.error('???????????????????????????');
      return;
    }

    if (`${points}`.indexOf('.') > -1) {
      message.error('?????????????????????????????????');
      return;
    }

    if (!stop_rule_points || stop_rule_points <= 0) {
      message.error('?????????????????????????????????');
      return;
    }

    if (`${stop_rule_points}`.indexOf('.') > -1) {
      message.error('???????????????????????????????????????');
      return;
    }

    if (!offer_points_valid_date) {
      message.error('????????????????????????');
      return;
    }
    const { type, period } = offer_points_valid_date;
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

    if (!id && new Date(start_time) * 1 <= new Date() * 1) {
      message.error('?????????????????????????????????????????????????????????????????????!');
      return;
    }

    if (new Date(start_time) * 1 >= new Date(end_time) * 1) {
      message.error('?????????????????????????????????????????????????????????????????????!');
      return;
    }

    if (!approval_annex) {
      message.error('?????????????????????!');
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
        message.error('group_id???????????????');
        return;
      }

      this.setState({
        isSubmiting: true,
      });

      if (id) {
        postData.id = id;
      }
      if (out_sn) {
        postData.out_sn = out_sn;
      }
      if (app_id) {
        postData.app_id = app_id;
      }

      const { data } = await addFixedChannelEntryRequest(
        Object.assign({}, postData, {
          group_id,
          type: 'add',
          action: 'submit_examine',
        })
      );

      if (data.status) {
        message.success('??????!', 2, () => {
          this.setState(
            {
              publishAction: true,
              isSubmiting: false,
            },
            () => {
              // ??????????????????????????????
              setTimeout(() => {
                this.props.history.go(-1);
              }, 0);
            }
          );
        });
      } else {
        this.setState({
          isSubmiting: false,
        });
      }
    }
  }

  checkSkip = (nextLocation) => {
    if (nextLocation) {
      // ?????????????????????
      if (this.state.publishAction) {
        return true;
      }
      const editPage = /^\/qr_code\/\d/.test(nextLocation.pathname);
      return editPage;
    }
    return false;
  };

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
    const { reportChannelList } = this.props.system;
    const { offer_points_valid_date } = entryInfo;
    const { type, period } = offer_points_valid_date || {};
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    if (isDateLoading) {
      return (
        <div className="p-approve-set-wrap">
          <Card title="QR Code ????????????" bordered={false}>
            <div className="approve-set-content">
              <LoadingCom />
            </div>
          </Card>
        </div>
      );
    }
    return (
      <div className="p-approve-set-wrap">
        <Card title="QR Code ????????????" bordered={false}>
          <div className="approve-set-content">
            {/* <div className="list-item">
              <p className="item-title">????????????</p>
              <div className="item-value-wrap">
                <Select
                  disabled={isDisabledEidt}
                  style={{ width: '360px' }}
                  value={entryInfo.channel_id}
                  onChange={this.selectChangeAction.bind(this, 'channel_id')}
                >
                  {reportChannelList.map(item => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.channel_name}
                      </Option>
                    );
                  })}
                </Select>
              </div>
            </div> */}

            {entryInfo.id ? (
              <div className="list-item">
                <p className="item-title">??????</p>
                <div className="item-value-wrap">
                  <span className="num">{entryInfo.id}</span>
                </div>
              </div>
            ) : (
              ''
            )}

            <div className="list-item">
              <p className="item-title">??????</p>
              <div className="item-value-wrap">
                <Input
                  disabled={isDisabledEidt}
                  style={{ width: '360px' }}
                  value={entryInfo.entry_name}
                  placeholder="???????????????20?????????"
                  onChange={(e) =>
                    this.inputNumberChangeAction(e.target.value, 'entry_name')
                  }
                />
              </div>
            </div>
            <div className="list-item flex-start">
              <p className="item-title">????????????</p>
              <div className="item-value-wrap">
                <TextArea
                  disabled={isDisabledEidt}
                  rows={5}
                  style={{ width: '360px', resize: 'none' }}
                  value={entryInfo.entry_desc}
                  placeholder="????????????(100?????????)"
                  maxLength={100}
                  onChange={(e) =>
                    this.inputNumberChangeAction(e.target.value, 'entry_desc')
                  }
                />
              </div>
            </div>

            <div className="list-item">
              <p className="item-title">????????????</p>
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
              <p className="item-title">??????????????????</p>
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
              <p className="item-title">????????????????????????</p>
              <div className="item-value-wrap">
                <Input
                  disabled={isDisabledEidt}
                  style={{ width: '360px' }}
                  value={entryInfo.title}
                  placeholder="10???????????????(20???????????????)"
                  onChange={(e) =>
                    this.inputNumberChangeAction(e.target.value, 'title')
                  }
                />
              </div>
            </div>

            <div className="list-item">
              <p className="item-title">????????????</p>
              <div className="item-value-wrap">
                <span className="text">???????????????????????????????????????</span>
                <Select
                  style={{
                    width: '80px',
                    marginLeft: '10px',
                    marginRight: '10px',
                  }}
                  value="1"
                >
                  <Option value="1">??????</Option>
                </Select>
                <InputToolTipCom
                  disabled={isDisabledEidt}
                  value={entryInfo.offer_rules.points}
                  max={INPUT_NUMBER_MAX}
                  min={1}
                  step={1}
                  style={{ width: '150px' }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value.replace(/(,*)/g, '')}
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
                  ??????
                </span>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">??????</p>
              <div className="item-value-wrap">
                <div>
                  ????????????
                  <Select
                    disabled={
                      entryInfo.offer_rules.top.dimenssion === 'no_top' ||
                      isDisabledEidt
                    }
                    style={{ width: '150px', marginLeft: 10 }}
                    value={
                      entryInfo.offer_rules.top.dimenssion === 'no_top'
                        ? ''
                        : entryInfo.offer_rules.top.dimenssion
                    }
                    onChange={this.typeChangeAction}
                  >
                    {capTopTypeJsonListForQrcode.map((top) => {
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
                    ????????????
                  </span>
                  <InputToolTipCom
                    disabled={
                      entryInfo.offer_rules.top.dimenssion === 'no_top' ||
                      isDisabledEidt
                    }
                    value={entryInfo.offer_rules.top.most}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/(,*)/g, '')}
                    max={INPUT_NUMBER_MAX}
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
                    ???
                  </span>
                </div>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title" />
              <div style={{ marginTop: -15 }}>
                <Checkbox
                  disabled={isDisabledEidt}
                  checked={entryInfo.offer_rules.top.dimenssion === 'no_top'}
                  onChange={this.checkBoxChangeAction}
                >
                  ?????????
                </Checkbox>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">????????????</p>
              <div className="item-value-wrap">
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'rgba(0,0,0,0.85)',
                      marginRight: '10px',
                    }}
                  >
                    ?????????????????????????????????
                  </span>
                  <InputToolTipCom
                    disabled={isDisabledEidt}
                    value={entryInfo.stop_rule_points}
                    max={INPUT_NUMBER_MAX}
                    min={1}
                    step={1}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/(,*)/g, '')}
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
                    ????????????????????? QR Code ??????
                  </span>
                </div>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">?????????????????????</p>
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
              <p className="item-title">????????????</p>
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
              </div>
            </div>
            <div className="list-item">
              <p className="item-title" />
              <div style={{ marginTop: -15 }} className="tips">
                * ?????????????????????????????????????????????????????????
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">????????????</p>
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
                onClick={() => this.submitAction()}
                disabled={isSubmiting}
                loading={isSubmiting}
              >
                ????????????
              </Button>
            )}
          </div>
        </Card>
        <PromptLeave
          when={!isDisabledEidt}
          extraCheck={this.checkSkip}
          message="??????????????????????????????????????????????????????"
        />
      </div>
    );
  }
}

export default withRouter(
  connect(({ qrcode, system, auth }) => ({
    qrcode: qrcode.toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(QrCodeConfigurationPage)
);
