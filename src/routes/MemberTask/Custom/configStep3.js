import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import {
  Steps,
  Select,
  InputNumber,
  Button,
  Icon,
  Modal,
  message,
  Popconfirm,
  Input,
} from 'antd';
import * as _ from 'lodash';
import { INPUT_NUMBER_MAX, HEADER_TOKEN_NAME, API_BASE } from 'constants';
import {
  fetchCustomDetailRequest,
  eventExampleListRequest,
  addEventExampleRequest,
  updateCustomBaseRequest,
  updateEventExampleRequest,
  deleteEventExampleRequest,
} from 'services/memberTask';

import CreateEventModal from './components/CreateEventModalCom';
import EventCell from './components/EventCell';
import './config.less';

const images_icon = require('../../../assets/images/hk01.png');

const Option = Select.Option;
const Step = Steps.Step;
const confirm = Modal.confirm;

class ConfigStep2Page extends React.Component {
  constructor(props) {
    super(props);
    const id = props.system.query.id || '';
    const editType = props.system.query.type || '';
    this.state = {
      id,
      isDisabledEdit: editType === 'look',
      isShowModal: false,
      isShowEventListModal: false,
      isAddEvent: false,
      currentEventInfo: {}, // 編輯
      isCreateEventLoading: false, // 创建或者编辑事件实例loading
      eventsList: [],
      ruleList: [],
      isLookEventInstance: false,
      submitLoadingFlag: false,
    };
  }
  componentDidMount() {
    const { id } = this.state;
    if (!id) {
      message.error('參數有誤，id不能爲空！');
      return;
    }
    Promise.all([this.fetchEventExampleList(), this.fetchDetail()]);
  }
  componentWillUnmount() {
    message.destroy();
  }
  async fetchDetail() {
    const { id } = this.state;
    const { data } = await fetchCustomDetailRequest({ id });
    if (data.status) {
      const detailInfo = data.data;
      this.setState({
        ruleList: detailInfo.offer_rules || [],
      });
    }
  }
  // 获取事件池 实例list
  async fetchEventExampleList() {
    const { data } = await eventExampleListRequest({
      member_task_id: this.state.id,
    });
    if (data.status) {
      this.setState({
        eventsList: data.data.list || [],
      });
    }
  }
  // 事件池删除事件
  eventDeletAction(item, index) {
    const { eventsList } = this.state;
    const self = this;
    confirm({
      title: '提示',
      content: '確定要刪除該事件嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await deleteEventExampleRequest({
            member_task_id: self.state.id,
            id: item.id,
          });
          resolve();
          if (data.status) {
            eventsList.splice(index, 1);
            self.setState({
              eventsList,
            });
          }
        });
      },
    });
  }
  // 事件池编辑事件
  eventEditAction(item, index) {
    if (item && Object.keys(item).length) {
      this.setState({
        currentEventInfo: item,
        isShowModal: true,
        isAddEvent: false,
        isCreateEventLoading: false,
      });
    }
  }

  // 事件池查看事件
  eventDetailAction(item, index) {
    if (item && Object.keys(item).length) {
      this.setState({
        currentEventInfo: item,
        isShowModal: true,
        isAddEvent: false,
        isLookEventInstance: true,
        isCreateEventLoading: false,
      });
    }
  }

  // modal 新增或者编辑事件
  async modalOkAction(values) {
    const { eventsList } = this.state;
    await this.setState({
      isCreateEventLoading: true,
    });
    let isShowModal = true;
    if (values.id) {
      const res = await this.updateOrDeleteEventExample({
        id: values.id,
        member_task_id: this.state.id,
        event_params: values.event_params,
        event_id: values.event_id,
        event_desc: values.event_desc,
        report_channel: values.report_channel,
        report_channel_id: values.report_channel_id,
      });
      if (res.status) {
        isShowModal = false;
        // 有ID 编辑
        for (let i = 0; i < eventsList.length; i += 1) {
          const item = eventsList[i];
          if (item.id === values.id) {
            eventsList.splice(i, 1, values);
            break;
          }
        }
      }
    } else {
      // 没有 ID  新增
      const res = await this.addEventExample(values);
      if (res.status) {
        isShowModal = false;
        eventsList.push({ ...values, ...{ id: res.data.id } });
      }
    }

    this.setState({
      isShowModal,
      isCreateEventLoading: false,
      eventsList,
    });
  }

  // 添加事件实例
  async addEventExample(postData) {
    const { data } = await addEventExampleRequest({
      ...postData,
      member_task_id: this.state.id,
    });
    return data;
  }
  // 更新或者删除事件实例
  async updateOrDeleteEventExample(postData) {
    postData.offer_entry_id = this.state.id;
    const { data } = await updateEventExampleRequest(postData);
    return data;
  }

  modalCancelAction() {
    this.setState({
      isShowModal: false,
      isCreateEventLoading: false,
    });
  }

  // 给发放项添加规则
  addRule() {
    const { ruleList } = this.state;
    const index = ruleList.length;
    ruleList.splice(index, 0, {
      task_item_pic: {
        file_name: '1.png',
        approval_annex: '/mcp/123123.png',
        file_url:
          'https://member-control-panel-api.hktester.com/api/1.0/web/1.0/admin/document?path=%2Fmcp%2F123123.png',
      },
    });
    this.setState({
      ruleList,
    });
  }

  // 删除一条发放规则
  deleteRuleItem(index) {
    const { ruleList } = this.state;
    ruleList.splice(index, 1);
    this.setState({
      ruleList,
    });
  }

  ruleEventSelectHandle = (index, value) => {
    const { eventsList, ruleList } = this.state;
    const currentRule = ruleList[index];
    let selectEvent;

    for (let i = 0; i < eventsList.length; i += 1) {
      if (+eventsList[i].id === +value) {
        selectEvent = eventsList[i];
      }
    }
    currentRule.report_channel_id = selectEvent.report_channel_id;
    currentRule.event_params = selectEvent.event_params;
    currentRule.example_id = selectEvent.id;

    this.setState({
      ruleList,
      isShowEventListModal: false,
    });
  };

  timesChangeHandle(value, index) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index];
    currentRuleItem.times = value;
    this.setState({
      ruleList,
    });
  }

  inputChangeHandle(e, index, type) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index];
    currentRuleItem[type] = e.target.value;
    this.setState({
      ruleList,
    });
  }

  formatData() {
    const { ruleList } = this.state;
    if (!ruleList.length) {
      message.error('請至少添加一個發放規則');
      return;
    }
    for (let i = 0; i < ruleList.length; i += 1) {
      const currentRule = ruleList[i];
      if (!currentRule.example_id) {
        message.error(`任務項${i + 1}沒有添加事件！`);
        return;
      }
      if (!currentRule.times) {
        message.error(`任務項${i + 1}觸發次數設置不能为空`);
        return;
      }
      if (!currentRule.task_item_name) {
        message.error(`任務項${i + 1}任務項名稱設置不能为空`);
        return;
      }
      if (!currentRule.task_item_description) {
        message.error(`任務項${i + 1}任務描述設置不能为空`);
        return;
      }
      if (!currentRule.link_url) {
        message.error(`任務項${i + 1}跳轉連結設置不能为空`);
        return;
      }
      if (!currentRule.button_text) {
        message.error(`任務項${i + 1}按鈕文字設置不能为空`);
        return;
      }
    }

    return ruleList;
  }

  async submitAction() {
    const ruleList = this.formatData();
    console.log(ruleList);
    if (ruleList) {
      const { id } = this.state;
      if (!id) {
        message.error('參數有誤！，沒有id');
        return;
      }
      const postData = {
        id,
        action: 'submit_examine',
        offer_rules: ruleList,
        step: 'offer_rules',
      };
      await this.setState({ submitLoadingFlag: true });
      const { data } = await updateCustomBaseRequest(postData);
      if (data.status) {
        message.success('成功！');
        this.props.history.push('/member-task/config/submit?id=' + id);
      }
      this.setState({ submitLoadingFlag: false });
    }
  }

  async tmpSaveAction() {
    const ruleList = this.formatData();
    if (ruleList) {
      const { id } = this.state;
      if (!id) {
        message.error('參數有誤！，沒有id');
        return;
      }
      const postData = {
        id,
        action: 'temporary_storage',
        offer_rules: ruleList,
        step: 'offer_rules',
      };
      await this.setState({ submitLoadingFlag: true });
      const { data } = await updateCustomBaseRequest(postData);
      if (data.status) {
        message.success('暫存成功！');
      }
      this.setState({ submitLoadingFlag: false });
    }
  }

  goBackAction() {
    const { id, isDisabledEdit } = this.state;
    let url = `/member-task/config/base?id=${id}`;
    if (isDisabledEdit) {
      url += '&type=look';
    }
    if (id) {
      this.props.history.push(url);
    }
  }

  showUploadIcon = (index) => {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index];
    currentRuleItem.isUploadIconShow = true;
    this.setState({
      ruleList,
    });
  };
  hideUploadIcon = (index) => {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index];
    currentRuleItem.isUploadIconShow = false;
    this.setState({
      ruleList,
    });
  };

  uploadLocalIconToServer = async (index) => {
    // eslint-disable-next-line global-require
    const aaa = require('../../../assets/images/hk01.png');
    const image = new Image();
    image.crossOrigin = '';
    image.src = aaa;
    image.onload = async () => {
      const base64 = this.getBase64Image(image);
      const fileData = this.dataURLtoFile(base64, 'icon.png');
      // 创建提交表单数据对象
      const formdata = new FormData();
      // 添加要上传的文件
      formdata.append('file_type', 1);
      formdata.append('file', fileData, fileData.name);
      try {
        // 接口
        const res = await this.uploadFile(formdata);
        if (res.status && res.code === 0) {
          const { ruleList } = this.state;
          if (!ruleList[index]) {
            return;
          }
          const currentRuleItem = ruleList[index];
          currentRuleItem.task_item_pic = res.data.path;
          currentRuleItem.absolute_path = base64;
          currentRuleItem.isUploadIconShow = false;
          this.setState({
            ruleList,
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
  };
  /*
   * 图片的绝对路径地址 转换成base64编码 如下代码：
   */
  getBase64Image = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const ext = img.src.substring(img.src.lastIndexOf('.') + 1).toLowerCase();
    const dataURL = canvas.toDataURL('image/' + ext);
    return dataURL;
  };

  uploadFile = (file) => {
    return fetch(`${API_BASE}file_upload`, {
      body: file,
      credentials: 'include',
      headers: {
        [HEADER_TOKEN_NAME]: this.props.auth.jwt,
      },
      method: 'POST',
    }).then((response) => response.json());
  };

  dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while ((n -= 1)) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  render() {
    const { eventsList, ruleList, isDisabledEdit } = this.state;
    return (
      <div className="p-custom-configstep-wrap">
        <div className="step-wrap">
          <Steps current={2}>
            <Step title="基本信息" />
            <Step title="配置積分發放項" />
            <Step title="配置規則" />
            <Step title="提交審批" />
          </Steps>
        </div>
        <div className="configstep-content-wrap rule-content-wrap">
          <p className="step-title">配置規則</p>
          <div className="events-bus-wrap">
            <p className="rule-title">事件池</p>
            <div className="events-list-wrap">
              {eventsList.map((item, index) => {
                return (
                  <EventCell
                    isHideBtn={isDisabledEdit}
                    isShowDetailBtn={isDisabledEdit}
                    key={index}
                    eventInfo={item}
                    className="events-list-cell"
                    onDelete={() => this.eventDeletAction(item, index)}
                    onEdit={() => this.eventEditAction(item, index)}
                    onDetail={() => this.eventDetailAction(item, index)}
                  />
                );
              })}
              {isDisabledEdit ? null : (
                <div
                  className="add-event"
                  onClick={() =>
                    this.setState({
                      isShowModal: true,
                      isAddEvent: true,
                      currentEventInfo: {},
                    })
                  }
                >
                  <Icon type="plus" />
                  <span>選取事件</span>
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              width: '100%',
              height: '24px',
              backgroundColor: '#f0f4f7',
            }}
          />
          <div className="rule-config-wrap">
            <p className="rule-title">配置積分發放規則</p>
            <div className="m-rule-wrap">
              <div className="rule-title-wrap">
                <div className="rule-title-item flex-min">事件實例</div>
                <div className="rule-title-item">任務配置</div>
              </div>
              <div className="rule-list-wrap">
                {ruleList.map((item, index) => {
                  return (
                    <div className="rule-list-item" key={index}>
                      <p className="rule-list-item-title">任務項 {index + 1}</p>
                      <div className="rule-list-item-wrap">
                        <div className="rule-item flex-min">
                          <div>
                            <Select
                              disabled={isDisabledEdit}
                              className="form-control"
                              onChange={(value) =>
                                this.ruleEventSelectHandle(index, value)
                              }
                              value={item.example_id}
                            >
                              {eventsList.map((eventItem, eventIndex) => {
                                return (
                                  <Option value={eventItem.id} key={eventIndex}>
                                    事件實例 {eventItem.id}
                                  </Option>
                                );
                              })}
                            </Select>
                          </div>
                          <div className="flex-value-wrap">
                            <span className="fixed-value-item">觸發</span>
                            <InputNumber
                              disabled={isDisabledEdit}
                              className="flex-value-item"
                              step={1}
                              min={1}
                              max={INPUT_NUMBER_MAX}
                              value={item.times}
                              onChange={(e) => this.timesChangeHandle(e, index)}
                            />
                            <span className="fixed-value-item">次</span>
                          </div>
                          <div
                            style={{
                              color: 'rgba(0, 0, 0, 0.45)',
                              textAlign: 'left',
                            }}
                          >
                            注意：會員需在任務周期內需觸發事件實例的次數，在周期開始或領取獎勵（可重覆領獎）後重新計算
                          </div>
                        </div>
                        <div className="rule-item flex-box-wrap">
                          <div className="flex-box-wrap">
                            <div className="flex-box-item">
                              <div className="flex-value-wrap">
                                <span className="fixed-value-item">
                                  任務項名稱
                                </span>
                                <Input
                                  disabled={isDisabledEdit}
                                  className="flex-value-item"
                                  placeholder="18個字符內"
                                  maxLength={18}
                                  value={item.task_item_name}
                                  onChange={(e) =>
                                    this.inputChangeHandle(
                                      e,
                                      index,
                                      'task_item_name'
                                    )
                                  }
                                />
                              </div>
                              <div className="flex-value-wrap">
                                <span className="fixed-value-item">
                                  任務描述 &nbsp;&nbsp;&nbsp;
                                </span>
                                <Input
                                  disabled={isDisabledEdit}
                                  className="flex-value-item"
                                  placeholder="18個字符內"
                                  maxLength={18}
                                  value={item.task_item_description}
                                  onChange={(e) =>
                                    this.inputChangeHandle(
                                      e,
                                      index,
                                      'task_item_description'
                                    )
                                  }
                                />
                              </div>
                              <div className="flex-value-wrap">
                                <span className="fixed-value-item">
                                  跳轉連結&nbsp;&nbsp;&nbsp;&nbsp;
                                </span>
                                <Input
                                  disabled={isDisabledEdit}
                                  className="flex-value-item"
                                  value={item.link_url}
                                  onChange={(e) =>
                                    this.inputChangeHandle(e, index, 'link_url')
                                  }
                                />
                              </div>
                              <div className="flex-value-wrap">
                                <span className="fixed-value-item">
                                  按鈕文字&nbsp;&nbsp;&nbsp;&nbsp;
                                </span>
                                <Input
                                  disabled={isDisabledEdit}
                                  className="flex-value-item"
                                  placeholder="4個字符內"
                                  maxLength={4}
                                  value={item.button_text}
                                  onChange={(value) =>
                                    this.inputChangeHandle(
                                      value,
                                      index,
                                      'button_text'
                                    )
                                  }
                                />
                              </div>
                            </div>
                            <div className="flex-box-item">
                              <div className="flex-value-wrap">
                                <span className="fixed-value-item">
                                  任務項圖標
                                </span>
                                <div className="fixed-value-item member-task-icon-upload">
                                  {item.isUploadIconShow ? (
                                    <div className="upload-icon-box">
                                      <div className="upload-icon-item-list">
                                        <div
                                          className="icon-item"
                                          onClick={() => {
                                            this.uploadLocalIconToServer(index);
                                          }}
                                        >
                                          <img src={images_icon} alt="" />
                                        </div>
                                        <div className="icon-item">
                                          <img src={images_icon} alt="" />
                                        </div>
                                        <div className="icon-item">
                                          <img src={images_icon} alt="" />
                                        </div>
                                        <div className="icon-item">
                                          <img src={images_icon} alt="" />
                                        </div>
                                        <div className="icon-item">
                                          <img src={images_icon} alt="" />
                                        </div>
                                        <div className="icon-item">
                                          <img src={images_icon} alt="" />
                                        </div>
                                      </div>{' '}
                                      <div
                                        className="btn"
                                        onClick={() => {
                                          this.hideUploadIcon(index);
                                        }}
                                      >
                                        取消
                                      </div>
                                    </div>
                                  ) : null}

                                  {item.absolute_path ? (
                                    <div
                                      onClick={() => {
                                        this.showUploadIcon(index);
                                      }}
                                    >
                                      <img
                                        className="upload-icon-btn"
                                        src={item.absolute_path}
                                        alt=""
                                      />
                                    </div>
                                  ) : (
                                    <div
                                      className="upload-icon-btn"
                                      onClick={() => {
                                        this.showUploadIcon(index);
                                      }}
                                    >
                                      選擇
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {isDisabledEdit ? null : (
                        <Icon
                          type="close-circle"
                          theme="outlined"
                          className="rule-close-icon"
                          onClick={() => this.deleteRuleItem(index)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {isDisabledEdit ? null : (
                <div className="add-rule-wrap" onClick={() => this.addRule()}>
                  <Icon type="plus" style={{ marginRight: '10px' }} />
                  <span>添加任務項</span>
                </div>
              )}
              {ruleList.length ? (
                <p
                  style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}
                >
                  說明：多個任務項之間的規則是【且】關係
                </p>
              ) : null}
            </div>
          </div>
          <div className="foot-wrap">
            <Button onClick={() => this.goBackAction()}>上一步</Button>
            {isDisabledEdit ? (
              <Button
                type="primary"
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  this.props.history.push('/member-task/list');
                }}
              >
                返回列表
              </Button>
            ) : (
              <span>
                <Button
                  style={{ marginLeft: '10px', marginRight: '10px' }}
                  onClick={() => this.tmpSaveAction()}
                  disabled={this.state.submitLoadingFlag}
                  loading={this.state.submitLoadingFlag}
                >
                  暫存
                </Button>
                <Button
                  disabled={this.state.submitLoadingFlag}
                  loading={this.state.submitLoadingFlag}
                  type="primary"
                  onClick={() => this.submitAction()}
                >
                  提交審核
                </Button>
              </span>
            )}
          </div>
        </div>

        {
          /*
            创建或者编制事件实例 modal
          */
          this.state.isShowModal ? (
            <CreateEventModal
              isLoading={this.state.isCreateEventLoading}
              eventInfo={_.cloneDeep(this.state.currentEventInfo)}
              isAdd={this.state.isAddEvent}
              isLook={this.state.isLookEventInstance}
              onOk={this.modalOkAction.bind(this)}
              onCancel={this.modalCancelAction.bind(this)}
            />
          ) : null
        }
      </div>
    );
  }
}

export default withRouter(
  connect(({ system, auth }) => ({
    system: system.toJS(),
    auth: auth.toJS(),
  }))(ConfigStep2Page)
);
