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
  Checkbox
} from 'antd';
import * as _ from 'lodash';
import { INPUT_NUMBER_MAX } from 'constants';

import {
  eventExampleListRequest,
  addEventExampleRequest,
  updateEventExampleRequest,
  updateCustomBaseRequest,
  fetchCustomDetailRequest
} from 'services/integralManage/give/give';
import { capTopTypeJsonList } from 'config/ob.config';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import CreateEventModal from './components/CreateEventModalCom';
import EventListModal from './components/eventListModal';
import EventCell from './components/EventCell';
import '../give.less';

const Option = Select.Option;
const Step = Steps.Step;
const confirm = Modal.confirm;
const defaultRuleInfo = {
  rule: [],
  relation: 'and', // 事件关系 事件实例间的关系,and且,or或
  event_params: [],
  change_value: [], // "变动值,传数组 比如,绝对值时传[10],为区间值时传[5,10]"
  change_type: 'abs', // 变动类型,abs绝对值,sec区间值
  top: {
    type: 'points_amount',
    dimenssion: 'day', // 封顶类型 维度,day每天,week每周,month每月,year每年
    value: 1 // 最多获得数量
  }
};

class ConfigStep2Page extends React.Component {
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
      isShowModal: false,
      isShowEventListModal: false,
      isAddEvent: false,
      currentEventInfo: {},
      eventsList: [],
      ruleList: [],
      currentSelectEventList: [], // 当前规则已经选择的事件list
      isCreateEventLoading: false, // 创建或者编辑事件实例loading
      currentClickIndex: 0, // 当前点击规则点击添加事件的index
      isLookEventInstance: false,
      submitLoadingFlag: false
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
        ruleList: detailInfo.offer_rules || []
      });
    }
  }
  // 获取事件池 实例list
  async fetchEventExampleList() {
    const { data } = await eventExampleListRequest({
      offer_entry_id: this.state.id
    });
    if (data.status) {
      this.setState({
        eventsList: data.data.list || []
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
        return new Promise(async resolve => {
          const res = await self.updateOrDeleteEventExample({
            id: item.id,
            action: 'delete'
          });
          resolve();
          if (res.status) {
            eventsList.splice(index, 1);
            self.setState({
              eventsList
            });
            self.reloadRuleList(item, 'delete');
          }
        });
      }
    });
  }
  // 事件池编辑事件
  eventEditAction(item, index) {
    if (item && Object.keys(item).length) {
      this.setState({
        currentEventInfo: item,
        isShowModal: true,
        isAddEvent: false,
        isCreateEventLoading: false
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
        isCreateEventLoading: false
      });
    }
  }

  /**
   * 编辑和删除事件池 以及删除规则里面 的事件都需要重新梳理ruleList
   * @param {item} item  事件池事件对象
   * @param {type} type  delete or edit
   */
  reloadRuleList(item, type) {
    const { ruleList } = this.state;
    ruleList.forEach(rule => {
      const currentEvents = rule.rule;
      if (currentEvents && currentEvents.length) {
        if (item && Object.keys(item).length) {
          for (let i = 0; i < currentEvents.length; i += 1) {
            const event = currentEvents[i];
            if (+event.example_id === +item.id) {
              rule.change_type = 'abs';
              if (type === 'delete') {
                currentEvents.splice(i, 1);
              } else {
                currentEvents[i] = Object.assign(event, item);
              }
              break;
            }
          }
        }
        // // 如果当前的事件板有2个及以上的事件为 区间值 则改发放规则积分变动类型只能为绝对值  或者  如果 当前的事件板都是 绝对事件 那么该 规则的积分变动只能是绝对值
        // const typeIsSecEventList = currentEvents.filter(ev => {
        //   return ev.type === 'sec';
        // });
        // const typeIsAbsEventList = currentEvents.filter(ev => {
        //   return ev.type === 'abs';
        // });
        // if (
        //   typeIsSecEventList.length >= 2 ||
        //   typeIsAbsEventList.length === currentEvents.length
        // || (rule.relation === 'or' && typeIsAbsEventList.length >= 1
        // && typeIsSecEventList.length >= 1)
        // ) {
        //   rule.change_type = 'abs';
        // }
      }
    });
    this.setState({
      ruleList
    });
  }

  // modal 新增或者编辑事件
  async modalOkAction(values) {
    const { eventsList } = this.state;
    await this.setState({
      isCreateEventLoading: true
    });
    let isShowModal = true;
    if (values.id) {
      const res = await this.updateOrDeleteEventExample({
        id: values.id,
        action: 'update',
        event_params: values.event_params,
        event_desc: values.event_desc,
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
        this.reloadRuleList(values, 'edit');
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
      offer_entry_id: this.state.id,
      channel_id: postData.report_channel_id
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
      isCreateEventLoading: false
    });
  }

  // 给发放项添加规则
  addRule() {
    const { ruleList } = this.state;
    const index = ruleList.length;
    // console.log(ruleList);
    ruleList.splice(index, 0, JSON.parse(JSON.stringify(defaultRuleInfo)));
    this.setState({
      ruleList
    });
  }

  // 删除一条发放规则
  deleteRuleItem(index) {
    const { ruleList } = this.state;
    ruleList.splice(index, 1);
    this.setState({
      ruleList
    });
  }

  // 给规则添加事件
  addEventToRuleAction(index) {
    const { ruleList } = this.state;
    this.setState({
      isShowEventListModal: true,
      currentClickIndex: index,
      currentSelectEventList: ruleList[index].rule || []
    });
  }

  // 事件列表modal 确定事件
  eventListModalOkAction(value) {
    const selectEventList = value.value;
    if (!(selectEventList && selectEventList.length)) {
      return;
    }
    const { currentClickIndex, ruleList } = this.state;
    if (!ruleList[currentClickIndex]) {
      return;
    }
    let currentEvents = ruleList[currentClickIndex].rule;
    currentEvents = [];
    selectEventList.forEach(item => {
      currentEvents.push({
        event_desc: item.event_desc,
        report_channel_id: item.report_channel_id,
        event_params: item.event_params,
        example_id: item.id,
        times: 1,
        type: item.return_value_type
      });
    });
    // 根据 example_id 排序从小到大排序一下
    currentEvents.sort((a, b) => {
      return a.example_id > b.example_id;
    });
    ruleList[currentClickIndex].rule = currentEvents;
    ruleList[currentClickIndex].change_type = 'abs';
    this.setState({
      ruleList,
      isShowEventListModal: false
    },
    () => {
      this.reloadRuleList();
    });
  }

  // 事件列表 modal 取消事件
  eventListModalCancelAction() {
    this.setState({
      isShowEventListModal: false
    });
  }

  // 从规则中删除事件  item=> 当前item index=>当前index pIndex =>父 index
  deleteRuleEventAction(item, index, pIndex) {
    const { ruleList } = this.state;
    if (!ruleList[pIndex]) {
      return;
    }
    const currentRuleItem = ruleList[pIndex]; // 当前所属的规则
    if (currentRuleItem.rule[index]) {
      currentRuleItem.rule.splice(index, 1);
      if (currentRuleItem.rule.length <= 1) {
        currentRuleItem.relation = 'and';
      }
    }
    this.setState(
      {
        ruleList
      },
      () => {
        this.reloadRuleList();
      }
    );
  }

  // 触发次数事件
  timesChangeAction(value, index, pIndex) {
    const { ruleList } = this.state;
    if (!ruleList[pIndex]) {
      return;
    }
    const currentRuleItem = ruleList[pIndex]; // 当前所属的规则
    const currentEvent = currentRuleItem.rule[index]; // 当前所属规则下的事件
    ruleList[pIndex].rule[index].times = value;
    this.setState({
      ruleList
    });
  }

  // 事件关系事件
  relationChangeAction(value, index) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index]; // 当前所属的规则
    if (!currentRuleItem.relation) {
      return;
    }
    if (value === 'or' && currentRuleItem.rule.length > 1) {
      ruleList[index].change_type = 'abs';
    }
    ruleList[index].relation = value;
    this.setState({
      ruleList
    },
    () => {
      this.reloadRuleList();
    });
  }

  // 积分变动类型事件
  eventTypeChangeAction(value, index) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    // const currentRuleItem = ruleList[index]; // 当前所属的规则
    // if (!currentRuleItem.change_type) {
    //   return;
    // }
    ruleList[index].change_type = value;
    this.setState({
      ruleList
    });
  }

  // 积分变动类型 积分额度 事件
  eventTypeAmountChangeAction(value, index, type) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index]; // 当前所属的规则
    if (!currentRuleItem.change_value) {
      return;
    }
    if (type === 'absolute') {
      ruleList[index].change_value[0] = value;
    }
    if (type === 'range-min') {
      ruleList[index].change_value[0] = value;
    }
    if (type === 'range-max') {
      ruleList[index].change_value[1] = value;
    }
    this.setState({ ruleList });
  }

  // 封顶类型 事件
  topTypeChangeAction(value, index) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index]; // 当前所属的规则
    if (!currentRuleItem.top) {
      return;
    }
    ruleList[index].top.dimenssion = value;
    this.setState({
      ruleList
    });
  }

  // 封顶类型 额度 事件
  topAmountChangeAction(value, index) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index]; // 当前所属的规则
    if (!currentRuleItem.top) {
      return;
    }
    ruleList[index].top.value = value;
    this.setState({
      ruleList
    });
  }

  // 最多获得 类型的变化 事件
  pointAmountOrTimesChangeAction(value, index) {
    const { ruleList } = this.state;
    if (!ruleList[index]) {
      return;
    }
    const currentRuleItem = ruleList[index]; // 当前所属的规则
    if (!currentRuleItem.top) {
      return;
    }
    ruleList[index].top.type = value;
    this.setState({
      ruleList
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
      if (currentRule.rule && !currentRule.rule.length) {
        message.error(`發放規則${i + 1}沒有添加事件！`);
        return;
      }
      const change_value = currentRule.change_value;
      const change_type = currentRule.change_type;
      if (!change_type) {
        message.error(`發放規則${i + 1}沒有選擇積分變動數額類型`);
        return;
      }
      const [v1, v2] = change_value;
      const { rule, top: { value, dimenssion } } = currentRule;
      for (const r of rule) {
        const { times } = r;
        if (!times) {
          message.error(`發放規則${i + 1}觸發次數設置不能为空`);
          return;
        }
        if (`${times}`.indexOf('.') > -1) {
          message.error(`發放規則${i + 1}觸發次數設置不能包含小數點`);
          return;
        }
      }
      if (!v1) {
        message.error(`發放規則${i + 1}積分變動數額設置不能为空`);
        return;
      }
      if (change_type === 'sec') {
        if (!v2) {
          message.error(`發放規則${i + 1}積分變動數額設置不能为空`);
          return;
        }
      }
      if (`${v1}`.indexOf('.') > -1 || `${v2}`.indexOf('.') > -1) {
        message.error(`發放規則${i + 1}積分設置不能包含小數點`);
        return;
      }
      if (dimenssion !== 'no_top') {
        if (!value) {
          message.error(`發放規則${i + 1}封頂積分設置不能为空`);
          return;
        }
        if (`${value}`.indexOf('.') > -1) {
          message.error(`發放規則${i + 1}封頂積分設置不能包含小數點`);
          return;
        }
      }
      if (currentRule.change_type === 'sec') {
        if (change_value[0] >= change_value[1]) {
          message.error(`發放規則${i + 1}積分變動數額區間值設置有誤！`);
          return;
        }
      }
    }

    return ruleList;
  }

  async submitAction() {
    const ruleList = this.formatData();
    if (ruleList) {
      const { id, out_sn, app_id } = this.state;
      if (!id) {
        message.error('參數有誤！，沒有id');
        return;
      }
      const postData = {
        id,
        action: 'submit_examine',
        offer_rules: ruleList
      };
      if (out_sn) {
        postData.out_sn = out_sn;
      }
      if (app_id) {
        postData.app_id = app_id;
      }
      await this.setState({ submitLoadingFlag: true });
      const { data } = await updateCustomBaseRequest(postData);
      if (data.status) {
        message.success('成功！');
        this.props.history.push(
          '/integral-manage/give-custom/config/submit?id=' + id
        );
      }
      this.setState({ submitLoadingFlag: false });
    }
  }

  async tmpSaveAction() {
    const ruleList = this.formatData();
    if (ruleList) {
      const { id, out_sn, app_id } = this.state;
      if (!id) {
        message.error('參數有誤！，沒有id');
        return;
      }
      const postData = {
        id,
        action: 'temporary_storage',
        offer_rules: ruleList
      };
      if (out_sn) {
        postData.out_sn = out_sn;
      }
      if (app_id) {
        postData.app_id = app_id;
      }
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
    let url = `/integral-manage/give-custom/config/base?id=${id}`;
    if (isDisabledEdit) {
      url += '&type=look';
    }
    if (id) {
      this.props.history.push(url);
    }
  }

  renderChangeTypeOptions = (rule, relation) => {
    const event_params = [];
    for (const item of rule) {
      event_params.push(...item.event_params);
    }
    if (event_params.length === 0) {
      return [{ type: 'sec', value: '區間值' }, { type: 'abs', value: '絕對值' }];
    }
    let count = 0;
    for (const e of event_params) {
      if (e.type === 'sec') {
        count += 1;
      }
    }
    // console.log(count);
    if (count !== 1 || relation === 'or') {
      return [{ type: 'abs', value: '絕對值' }];
    }
    return [{ type: 'sec', value: '區間值' }, { type: 'abs', value: '絕對值' }];
  }

  render() {
    const { eventsList, ruleList, isDisabledEdit } = this.state;
    return (
      <div className="p-custom-configstep-wrap">
        <div className="step-wrap">
          <Steps current={1}>
            <Step title="基本信息" />
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
                      currentEventInfo: {}
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
              backgroundColor: '#f0f4f7'
            }}
          />
          <div className="rule-config-wrap">
            <p className="rule-title">配置積分發放規則</p>
            <div className="m-rule-wrap">
              <div className="rule-title-wrap">
                <div className="rule-title-item">事件實例</div>
                <div className="rule-title-item flex-min">觸發次數（次）</div>
                <div className="rule-title-item flex-min">事件關係</div>
                <div className="rule-title-item">積分變動數額</div>
                <div className="rule-title-item">封頂</div>
              </div>
              <div className="rule-list-wrap">
                {ruleList.map((item, index) => {
                  return (
                    <div className="rule-list-item" key={index}>
                      <p className="rule-list-item-title">
                        發放規則 {index + 1}
                      </p>
                      <div className="rule-list-item-wrap">
                        <div className="rule-item">
                          {item.rule.map((cell, cellIndex) => {
                            return (
                              <div className="item-event-name" key={cellIndex}>
                                <span className="event-name">
                                  事件實例
                                  {cell.example_id}
                                </span>
                                {isDisabledEdit ? null : (
                                  <Icon
                                    type="close"
                                    className="close-icon"
                                    onClick={() =>
                                      this.deleteRuleEventAction(
                                        cell,
                                        cellIndex,
                                        index
                                      )
                                    }
                                  />
                                )}
                              </div>
                            );
                          })}
                          {isDisabledEdit ? null : item.rule.length !==
                            eventsList.length && eventsList.length !== 0 ? (
                              <div
                                className="add-event-wrap"
                                onClick={() => this.addEventToRuleAction(index)}
                              >
                                <Icon type="plus" />
                                <span>添加事件</span>
                              </div>
                            ) : null}
                        </div>
                        <div className="rule-item flex-min">
                          {/* c触发次数 */
                            item.rule.map((cell, cellIndex) => {
                              return (
                                <div key={cellIndex}>
                                  <InputNumber
                                    disabled={isDisabledEdit}
                                    min={1}
                                    value={cell.times}
                                    max={INPUT_NUMBER_MAX}
                                    step={1}
                                    className="form-control"
                                    onChange={value =>
                                      this.timesChangeAction(
                                        value,
                                        cellIndex,
                                        index
                                      )
                                    }
                                  />
                                </div>
                              );
                            })}
                        </div>
                        <div className="rule-item flex-min">
                          <div>
                            <Select
                              className="form-control"
                              value={item.relation}
                              disabled={isDisabledEdit || item.rule.length <= 1}
                              onChange={value =>
                                this.relationChangeAction(value, index)
                              }
                              getPopupContainer={triggerNode =>
                                triggerNode.parentNode
                              }
                            >
                              <Option value="and">且</Option>
                              <Option value="or">或</Option>
                            </Select>
                          </div>
                        </div>
                        <div className="rule-item">
                          <div>
                            <Select
                              className="form-control"
                              value={item.change_type}
                              onChange={value =>
                                this.eventTypeChangeAction(value, index)
                              }
                              disabled={
                                // 如果事件版上有超过1个事件为 区间值则只能为 绝对值  （由于绝对值为默认，disabled 即可）
                                isDisabledEdit
                              }
                              getPopupContainer={triggerNode =>
                                triggerNode.parentNode
                              }
                            >
                              {
                                this.renderChangeTypeOptions(item.rule, item.relation)
                                .map((t, i) => {
                                  return <Option key={i} value={t.type}>{t.value}</Option>;
                                })
                              }
                            </Select>
                          </div>
                          {item.change_type === 'abs' ? (
                            <div className="flex-value-wrap">
                              <InputToolTipCom
                                disabled={isDisabledEdit}
                                className="flex-value-item"
                                step={1}
                                min={1}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/(,*)/g, '')}
                                max={INPUT_NUMBER_MAX}
                                value={item.change_value[0]}
                                onChange={value =>
                                  this.eventTypeAmountChangeAction(
                                    value,
                                    index,
                                    'absolute'
                                  )
                                }
                              />
                              <span
                                className="fixed-value-item"
                                style={{ marginLeft: '9px' }}
                              >
                                積分
                              </span>
                            </div>
                          ) : (
                            <div className="flex-value-wrap">
                              <InputToolTipCom
                                disabled={isDisabledEdit}
                                className="flex-value-item flex-eq"
                                step={1}
                                min={1}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/(,*)/g, '')}
                                max={INPUT_NUMBER_MAX}
                                value={item.change_value[0]}
                                onChange={value =>
                                  this.eventTypeAmountChangeAction(
                                    value,
                                    index,
                                    'range-min'
                                  )
                                }
                              />
                              <span
                                className="fixed-value-item"
                                style={{
                                  marginLeft: '10px',
                                  marginRight: '10px'
                                }}
                              >
                                至
                              </span>
                              <InputToolTipCom
                                disabled={isDisabledEdit}
                                className="flex-value-item flex-eq"
                                step={1}
                                min={2}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/(,*)/g, '')}
                                max={INPUT_NUMBER_MAX}
                                value={item.change_value[1]}
                                onChange={value =>
                                  this.eventTypeAmountChangeAction(
                                    value,
                                    index,
                                    'range-max'
                                  )
                                }
                              />
                              <span
                                className="fixed-value-item"
                                style={{ marginLeft: '7px' }}
                              >
                                積分
                              </span>
                            </div>
                            )}
                        </div>
                        <div className="rule-item">
                          <div>
                            <Select
                              disabled={isDisabledEdit}
                              className="form-control"
                              value={item.top.dimenssion}
                              onChange={value =>
                                this.topTypeChangeAction(value, index)
                              }
                              getPopupContainer={triggerNode =>
                                triggerNode.parentNode
                              }
                            >
                              {capTopTypeJsonList.map(top => {
                                return (
                                  <Option key={top.value} value={top.value}>
                                    {top.name}
                                  </Option>
                                );
                              })}
                            </Select>
                          </div>
                          {item.top.dimenssion !== 'no_top' ? (
                            <div className="flex-value-wrap">
                              <span className="fixed-value-item">最多獲得</span>
                              <InputNumber
                                disabled={isDisabledEdit}
                                className="flex-value-item"
                                step={1}
                                min={1}
                                max={INPUT_NUMBER_MAX}
                                value={item.top.value}
                                onChange={value =>
                                  this.topAmountChangeAction(value, index)
                                }
                                style={{
                                  marginLeft: '8px',
                                  marginRight: '8px'
                                }}
                              />
                              <Select
                                disabled={isDisabledEdit}
                                className="flex-value-item"
                                value={item.top.type}
                                onChange={value =>
                                  this.pointAmountOrTimesChangeAction(
                                    value,
                                    index
                                  )
                                }
                              >
                                <Option value="points_amount">積分</Option>
                                <Option value="get_times">次</Option>
                              </Select>
                            </div>
                          ) : null}
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
                  <span>添加發放規則</span>
                </div>
              )}
              {ruleList.length ? (
                <p
                  style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}
                >
                  說明：多個發放規則之間是【或】關係
                </p>
              ) : null}
              <div className="cap-rule-wrap none">
                <p className="cap-title">全部發放項發放封頂</p>
                <div className="cap-value-wrap">
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginRight: '10px'
                      }}
                    >
                      最多獲得
                    </span>
                    <InputNumber
                      step={1}
                      defaultValue={20}
                      max={INPUT_NUMBER_MAX}
                      style={{ width: '100px', marginRight: '10px' }}
                    />
                    <Select value="integral" style={{ width: '200px' }}>
                      <Option value="integral">積分</Option>
                    </Select>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <Checkbox>不封頂</Checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="foot-wrap">
            <Button onClick={() => this.goBackAction()}>上一步</Button>
            {isDisabledEdit ? (
              <Button
                type="primary"
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  this.props.history.push('/integral-manage/give-custom');
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

        {/*
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
          ) : null}
        {/*
            给方法规则添加事件实例 modal
          */
          this.state.isShowEventListModal ? (
            <EventListModal
              selectList={this.state.currentSelectEventList}
              eventList={eventsList}
              onOk={this.eventListModalOkAction.bind(this)}
              onCancel={this.eventListModalCancelAction.bind(this)}
            />
          ) : null}
      </div>
    );
  }
}

export default withRouter(
  connect(({ integralManageGive, system }) => ({
    integralManageGive: integralManageGive.toJS(),
    system: system.toJS()
  }))(ConfigStep2Page)
);
