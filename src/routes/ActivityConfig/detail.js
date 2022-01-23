import React from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { message, Modal, Card, Tabs, Button } from 'antd';
import moment from 'moment';
import qs from 'qs';
import { parseSearch } from 'utils/tools';
import PromptLeave from 'components/PromptLeave';
import BaseInfo from './components/base';
import AnswerInfo from './components/answer';

@connect(({ auth, activityConfig, system }) => ({
  auth: auth.toJS(),
  system: system.toJS(),
  detail: activityConfig.get('detail'),
  questions: activityConfig.get('questions'),
}))
@withRouter
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isShowModal: false,
      iframeSrc:
        process.env.environment !== 'production'
          ? 'https://hk01-member-frontend.hktester.com/promotion/'
          : 'https://hk01-member-frontend.hk01.com/egg',
      tab: '1',
      isSubmiting: false,
      publishAction: false,
    };
    this.template = null;
    this.question = null;
  }

  async componentDidMount() {
    // 进入之前重置一下详情
    await this.props.dispatch({
      type: 'activityConfig/resetDetail',
    });
    const { id, type } = this.props.match.params;

    // 查看、编辑
    if (id) {
      if (!/^\d+$/g.test(id)) {
        this.props.history.push('/404');
        return;
      }
      await this.reflectToAdd();
      return;
    }
    // 添加
    if (type === 'tidy' || type === 'answer') {
      await this.props.dispatch({
        type: 'activityConfig/changeMode',
        mode: type,
      });
    }
    this.setState({
      loading: false,
    });
  }

  handleShowModal = () => {
    this.submit('preview');
  };

  handleModalCancel = () => {
    this.setState({
      isShowModal: false,
    });
  };

  reflectToAdd = async () => {
    const { id } = this.props.match.params;
    const newState = { loading: false };
    await this.props.dispatch({
      type: 'activityConfig/fetchDetail',
      payload: {
        id,
        type: this.getAction(),
      },
    });
    // 如果是从“保存并下一步“进入
    const fromWhere = this.getSearch().from;
    if (fromWhere === 'add') {
      newState.tab = '2';
    }
    // 如果是“保存并预览“进入
    const isPreview = this.getSearch().preview;
    if (isPreview) {
      newState.iframeSrc = this.getPreviewLink();
      newState.isShowModal = true;
    }
    this.setState(newState);
  };

  changeTab = (key) => {
    const type = this.props.detail.get('type');
    if (this.state.tab === key) {
      // 如果当前点击的tab处于激活状态不做反应
      return;
    } else if (key === '2' && type === 'answer') {
      // 如果点击了答题设置并且模板为answer
      const action = this.getAction();
      if (action !== 'look') {
        // 如果查看的话，则不做提交和检测
        const status = this.props.detail.get('status');
        // 可对未发布/已结束的活动进行内容编辑
        if (status === 0 || status === 2) {
          this.submit('save');
          return;
        }
      }
    }
    this.setState({ tab: key });
  };

  getTabList = () => {
    const mode = this.props.detail.get('type');
    const tabList = [
      {
        key: '1',
        tab: `${mode === 'tidy' ? '精簡模板設置' : '答題模板設置'}`,
      },
    ];
    if (mode !== 'tidy') {
      tabList.push({ key: '2', tab: '答題設置' });
    }
    return tabList;
  };

  // 对该页面编辑的内容进行保存，分为模板保存和问题保存
  submit = async (btnType) => {
    if (this.state.tab === '1') {
      // 模板保存
      // @see https://github.com/ant-design/ant-design/pull/2992
      // @see https://ant.design/components/form-cn/#Form.create(options)
      const baseInfoRef = this.template;
      if (baseInfoRef) {
        try {
          // 检测模板填写，如果填写不完整进行提示，过了检测完整性如果有错误则抛出错误
          await baseInfoRef.checkForm();
          await this.setState({
            isSubmiting: true,
          });
          await this.saveDetail(btnType);
          await this.setState({ isSubmiting: false });
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      // 问题保存
      const questionRef = this.question
        ? this.question.getWrappedInstance()
        : null;
      if (questionRef) {
        // @see https://github.com/reduxjs/react-redux/issues/475
        try {
          const result = await questionRef.submit();
          await this.setState({
            isSubmiting: true,
          });
          if (result) {
            // 检测通过
            await this.saveQuestion(btnType);
          }
        } catch (error) {
          console.log(error);
        } finally {
          await this.setState({
            isSubmiting: false,
          });
        }
      }
    }
  };

  saveDetail = async (action) => {
    const detail = this.props.detail;
    const id = detail.get('id');
    const data = {
      type: detail.get('type'),
      title: detail.get('name').trim(),
      nav_title: detail.get('documentTitle').trim(),
      background_color: detail.get('color'),
      main_title: detail.get('title').trim(),
      redeem_fail_title: detail.get('failTitle').trim(),
      preferential_type: detail.get('prizeType'),
      preferential_sku: detail.get('skuId'),
      reward_image: detail.get('prizeImg'),
      reward_image_url: detail.get('prizeImgUrl'),

      background_reward_image: detail.get('mainBackImg'),
      background_reward_image_url: detail.get('mainBackImgUrl'),
      activity_status_image: detail.get('startEndBackImg'),
      activity_status_image_url: detail.get('startEndBackImgUrl'),
      effective_time_section: detail.get('rewardTimeList').toJS(),

      reward_description: detail.get('prizeDesc').trim(),
      rule_description: detail.get('rules').trim(),
      // 领取规则,1:新会员专享（注册时间在30天以内的会员）。2:推广活动时间内注册的会员专享。3:无限制(已绑定手机号的均可领取)
      offer_rule: detail.get('receiveStandard'),
      offer_times: detail.get('receiveLimit'),
      offer_points_valid_date: detail.get('offer_points_valid_date'),
      delay_time: detail.get('delay_time'),
      send_time_status: this.template.getSendTimeStatus(),
      area_limit: detail.get('area_limit'),
      department_pid: detail.get('department_pid'),
      initiate_department: detail.get('initiate_department'),
      offer_account: detail.get('offer_account'),
      offer_account_union_id: detail.get('offer_account_union_id'),
      points_show_message: detail.get('points_show_message'),
    };
    data.effective_time_section.map((item) => {
      if (item.type) {
        delete item.type;
      }
      return item;
    });
    const total = detail.get('prizeNum');
    if (total === 0) {
      // 不限制
      data.preferential_limit = 1;
    } else {
      // 限制
      data.preferential_limit = 0;
      data.preferential_total = total;
    }
    const dailyNum = detail.get('dailyNum').toJS();
    data.daily_reset_time = dailyNum.daily_reset_time;
    if (dailyNum.daily_total === 0) {
      // 不限制
      data.daily_limit = 0;
    } else {
      // 限制
      data.daily_limit = 1;
      data.daily_total = dailyNum.daily_total;
    }
    if (id) {
      data.id = id;
    }
    if (detail.get('type') === 'answer') {
      data.question_image = detail.get('questionImg');
      data.question_image_url = detail.get('questionImgUrl');
    }
    // 活动开始时间(领取规则为活动时间内的会员专享时必填)
    if (detail.get('receiveStandard') !== 2) {
      if (detail.get('startTime') && detail.get('endTime')) {
        data.online_at = moment(detail.get('startTime')).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        data.offline_at = moment(detail.get('endTime')).format(
          'YYYY-MM-DD HH:mm:ss'
        );
      }
    } else {
      data.online_at = moment(detail.get('startTime')).format(
        'YYYY-MM-DD HH:mm:ss'
      );
      data.offline_at = moment(detail.get('endTime')).format(
        'YYYY-MM-DD HH:mm:ss'
      );
    }
    data.is_publish = action === 'save' || action === 'preview' ? 0 : 1;
    const { action: _action } = this.props.system.query;
    const mode = this.props.detail.get('type');
    if (mode === 'answer' && _action === 'edit') {
      data.is_publish = detail.get('status');
    }
    try {
      if (this.getAction() === 'copy') {
        data.is_copy = 1;
        data.copy_id = data.id;
        data.online_times = 0;
        delete data.id;
      }
      const successid = await this.props.dispatch({
        type: 'activityConfig/submitTemplate',
        payload: data,
      });
      if (successid) {
        // 保存完成后路由变更
        data.id = successid;
        delete data.is_copy;
        delete data.copy_id;
        this.changeRouteAfterSaveDetail(action, successid, data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  changeRouteAfterSaveDetail = async (action, id, copyData) => {
    const detail = this.props.detail;
    const oldId = detail.get('id');
    if (action === 'save' || action === 'preview') {
      const queryType = this.getAction();
      if (queryType !== 'look') {
        message.success('保存成功');
      }
      const isAnswer = detail.get('type') === 'answer';
      const isPreview = action === 'preview';
      // 是新增
      if (!oldId) {
        // 類型如果是答題模板，那麼跳转路由后需要調整到对应页面
        // 跳转路由后组件重新装载，需要在componentdidmount進行相应設置
        let url = `/activity-config/detail/${id}`;
        const params = {};
        if (isAnswer) {
          params.from = 'add';
        }
        if (isPreview) {
          params.preview = true;
          // 详情预览的话不跳转到答案设置，停留在详情
          delete params.from;
        }
        const qsStr = qs.stringify(params);
        if (qsStr) {
          url += `?${qsStr}`;
        }
        this.props.history.replace(url);
      } else {
        // 编辑
        if (this.getAction() === 'copy') {
          const url = `/activity-config/detail/${id}`;
          this.props.history.replace(url);
          this.props.dispatch({
            type: 'activityConfig/saveCopyDetail',
            payload: copyData,
          });
        }
        const newState = {};
        if (isAnswer) {
          newState.tab = '2';
        }
        if (isPreview) {
          newState.isShowModal = true;
          newState.iframeSrc = this.getPreviewLink();
          // 预览不改变tab
          delete newState.tab;
        }
        this.setState(newState);
      }
    } else if (action === 'publish') {
      // 保存并发布
      message.success('發佈成功');
      this.setState(
        {
          publishAction: true,
        },
        () => {
          // 保存成功后返回上一级
          setTimeout(() => {
            this.props.history.push('/activity-config/list');
          }, 0);
        }
      );
    }
  };

  onChangeParam = (item) => {
    this.props.dispatch({
      type: 'activityConfig/saveDetail',
      payload: item,
    });
  };

  handleShowPreivew = () => {
    this.preview();
  };

  getPreviewLink = () => {
    const detail = this.props.detail;
    let iframeSrc =
      process.env.environment !== 'production'
        ? 'https://hk01-member-frontend.hktester.com/promotion/'
        : 'https://hk01-member-frontend.hk01.com/promotion/';
    iframeSrc = iframeSrc + detail.get('id') + '?isPreview=true';
    return iframeSrc;
  };

  preview = () => {
    this.setState(
      {
        iframeSrc: this.getPreviewLink(),
      },
      () => {
        this.setState({
          isShowModal: true,
        });
      }
    );
  };

  saveQuestion = async (action) => {
    const detail = this.props.detail;
    const questions = this.props.questions.toJS();
    const id = detail.get('id');
    const data = {
      promotional_activity_id: id,
    };
    // 要删除的问题id
    data.delete_question_ids = questions.deleteids.join(',');

    const list = questions.list;
    const newList = list.map((item, index) => {
      const q = {
        alias_value: item.alias_value, // 题目别名
        style: item.alias_style, // 题目类型
        question_template_id: item.question_template_id, // 题干id
        question_answer_type: item.question_answer_type,
      };
      // 新增不传
      if (item.id && !(item.id + '').startsWith('uuid')) {
        q.id = item.id;
      }
      const option = item.option.map((temp) => {
        const t = {
          option_id: temp.option_template_id, // 题干选项id
        };
        t.alias_value = temp.alias_value;
        if (temp.id && !(temp.id + '').startsWith('uuid')) {
          t.id = temp.id;
        }
        return t;
      });
      q.option = option;
      q.position = index + 1;
      return q;
    });
    data.question_data = newList;
    data.status = 0;
    // 发布需要检测题目数量
    if (action === 'publish' || action === 'preview') {
      if (newList.length === 0) {
        // 发布的题目数量不能为0
        message.error('答題設置不能為空');
        return;
      }
      if (action === 'publish') {
        data.status = 1;
      }
    }
    try {
      const res = await this.props.dispatch({
        type: 'activityConfig/submitQuestion',
        payload: data,
      });
      if (res) {
        // 成功后才繼續如下動作，不成功系統提示
        this.changeRouteAfterSaveQuestion(action, id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  changeRouteAfterSaveQuestion = async (action, id) => {
    // 因为进入答题设置的话就证明已经进入了详情路由了
    // 所以只有在发布的时候才需要做路由跳转判断
    if (action === 'save') {
      message.success('保存成功');
      await this.props.dispatch({
        type: 'activityConfig/fetchActivityQuestion',
        id,
      });
    } else if (action === 'publish') {
      message.success('發佈成功');
      this.setState(
        {
          publishAction: true,
        },
        () => {
          // 返回上一级
          this.props.history.push('/activity-config/list');
        }
      );
    } else if (action === 'preview') {
      message.success('保存成功');
      await this.props.dispatch({
        type: 'activityConfig/fetchActivityQuestion',
        id,
      });
      this.preview();
    }
  };

  handleChangeForm = (changevalues) => {
    this.props.dispatch({
      type: 'activityConfig/changeForm',
      payload: changevalues,
    });
  };

  // 取消返回上级页面
  handleCancelBack = () => {
    this.props.history.go(-1);
  };

  getSearch = () => parseSearch(this.props.location.search);

  getAction = () => this.getSearch().action || '';

  checkSkip = (nextLocation) => {
    if (nextLocation) {
      // 從新增跳轉詳情
      if (this.state.publishAction) {
        return true;
      }
      const editPage = /^\/activity-config\/detail\/\d/.test(
        nextLocation.pathname
      );
      return editPage;
    }
    return false;
  };

  render() {
    const tabList = this.getTabList();
    const { isSubmiting } = this.state;
    const detail = this.props.detail.toJS();
    if (this.getAction() === 'copy') {
      detail.online_times = 0;
      delete detail.id;
    }
    const action = this.getAction();
    let isAnswerAndAdd = false;
    if (detail.type === 'answer') {
      isAnswerAndAdd = true;
    }
    detail.initiate_department =
      detail.initiate_department === ''
        ? this.props.auth.department
        : detail.initiate_department;
    return (
      <div className="p-activity-config-detail-wrap">
        <PromptLeave
          when={action !== 'look'}
          extraCheck={this.checkSkip}
          message="確認離開當前的頁面嗎？內容將不予保存"
        />
        <Card
          tabList={tabList}
          activeTabKey={this.state.tab}
          onTabChange={this.changeTab}
          loading={this.state.loading}
          bordered={false}
        >
          {this.state.tab === '1' ? (
            <BaseInfo
              {...detail}
              onChangeParam={this.onChangeParam}
              param={{
                department_pid: detail.department_pid,
                initiate_department: detail.initiate_department,
                offer_account: detail.offer_account,
                offer_account_union_id: detail.offer_account_union_id,
                rewardTimeList: detail.rewardTimeList,
              }}
              partmentList={this.props.system.partmentList}
              imgToken={this.props.auth.jwt}
              onChange={this.handleChangeForm}
              editable={action !== 'look'}
              action={action}
              wrappedComponentRef={(template) => (this.template = template)}
            />
          ) : (
            <AnswerInfo
              ref={(question) => (this.question = question)}
              editable={action !== 'look'}
              isAdd={isAnswerAndAdd}
            />
          )}
          <div className="m-footer">
            <Button onClick={this.handleCancelBack} disabled={isSubmiting}>
              {action === 'look' ? '返回' : '取消'}
            </Button>
            {action === 'look' ? (
              <Button
                onClick={this.handleShowPreivew}
                loading={isSubmiting}
                disabled={isSubmiting}
              >
                預覽
              </Button>
            ) : (
              <React.Fragment>
                <Button
                  onClick={this.handleShowModal}
                  loading={isSubmiting}
                  disabled={isSubmiting}
                >
                  保存預覽
                </Button>
                {/**
                1、答题模板-答题模板设置的页面，只有本活动发布过之后再进入编辑状态，才会看到这个按钮
                2、答题模板-答题设置页面，按钮保持常亮
                3、精簡模板-精簡模板常亮
              */}
                {detail.type === 'tidy' ||
                (detail.type === 'answer' && this.state.tab === '2') ? (
                  // eslint-disable-next-line react/jsx-indent
                  <Button
                    type="danger"
                    onClick={this.submit.bind(this, 'publish')}
                    loading={isSubmiting}
                    disabled={isSubmiting}
                  >
                    保存並發佈
                  </Button>
                ) : null}
                <Button
                  type="primary"
                  onClick={this.submit.bind(this, 'save')}
                  loading={isSubmiting}
                  disabled={isSubmiting}
                >
                  {isAnswerAndAdd && this.state.tab === '1'
                    ? '保存並下一步'
                    : '保存'}
                </Button>
              </React.Fragment>
            )}
          </div>
        </Card>
        <Modal
          title="預覽樣式"
          visible={this.state.isShowModal}
          footer={null}
          onCancel={this.handleModalCancel}
        >
          <div className="m-phone">
            {this.state.isShowModal ? (
              <iframe
                className="iframe"
                src={this.state.iframeSrc}
                frameBorder="0"
                title="預覽樣式"
              />
            ) : null}
          </div>
        </Modal>
      </div>
    );
  }
}
