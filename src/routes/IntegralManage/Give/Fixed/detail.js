import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import qs from 'qs';
import { updateCustomStatusRequest } from 'services/integralManage/give/give';
import { Card, Divider, Button, Pagination, Modal } from 'antd';
import { dimenssion2Json } from 'config/ob.config';
import AuthWrapCom from 'components/AuthCom';
import { convertValidDateToText } from 'utils/tools';
import { entryFixedType2Json } from './constants';
import '../give.less';

const { confirm } = Modal;
const status2Json = {
  '-2': {
    name: '已失效',
    className: 'status-lose',
  },
  '-1': {
    name: '已失效',
    className: 'status-lose',
  },
  0: {
    name: '未完成',
    className: 'status-undone',
  },
  1: {
    name: '發放中',
    className: 'status-give',
  },
  2: {
    name: '審批中',
    className: 'status-approve',
  },
  3: {
    name: '即將開始',
    className: 'status-soon',
  },
  4: {
    name: '已駁回',
    className: 'status-reject',
  },
  5: {
    name: '已停發',
    className: 'status-stop',
  },
  6: {
    name: '預處理中',
    className: 'status-soon',
  },
  20: {
    name: '審批中',
    className: 'status-approve',
  },
  22: {
    name: '審批中',
    className: 'status-approve',
  },
  21: {
    name: '已駁回',
    className: 'status-reject',
  },
};

class FixedDetailPage extends React.Component {
  constructor(props) {
    super(props);
    const group_id = props.system.query.group_id || '';
    const editType = props.system.query.type || '';
    this.state = {
      group_id,
      isDisabledEdit: editType === 'look',
    };
  }

  toDetailAction(item, type) {
    const { group_id } = this.state;
    const {
      fixedGroupInfoDetail: { entry_fixed_type },
    } = this.props.integralManageGive;

    if (!item.id) {
      return;
    }
    let url =
      '/integral-manage/give-fixed/detail/config?id=' +
      item.id +
      '&group_id=' +
      group_id +
      '&type=' +
      type;
    // console.log(group_id);
    if (entryFixedType2Json[entry_fixed_type] === 'equities_package') {
      url =
        '/integral-manage/give-fixed/detail/equities_package_config?id=' +
        item.id +
        '&group_id=' +
        group_id +
        '&type=' +
        type;
    }
    if (entryFixedType2Json[entry_fixed_type] === 'promotion') {
      url =
        '/integral-manage/give-fixed/detail/promotion?id=' +
        item.id +
        '&group_id=' +
        group_id +
        '&type=' +
        type;
    }
    if (entryFixedType2Json[entry_fixed_type] === 'qr_code') {
      url =
        '/integral-manage/give-fixed/detail/qr_code_config?id=' +
        item.id +
        '&group_id=' +
        group_id +
        '&type=' +
        type;
    }
    this.props.history.push(url);
  }

  // renderLookBtn()

  renderOperation(record) {
    const { isDisabledEdit } = this.state;
    const status = +record.status;
    const offer_policy_entry_id = record.offer_policy_entry_id;
    if (isDisabledEdit) {
      return (
        <AuthWrapCom
          authList={[
            'points_management',
            'points_offer',
            'fixed',
            'offer_detail',
          ]}
        >
          <span
            style={{ color: '#1890ff' }}
            onClick={() => this.toDetailAction(record, 'look')}
          >
            查看
          </span>
        </AuthWrapCom>
      );
    }
    // 发放中 or 即将开始
    if (status === 1 || status === 3) {
      return (
        <span>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'offer_detail',
            ]}
          >
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthWrapCom>
          {offer_policy_entry_id ? (
            <AuthWrapCom
              authList={[
                'points_management',
                'points_offer',
                'fixed',
                'update_status',
              ]}
            >
              <Divider type="vertical" />
              <span
                style={{ color: '#F5222D' }}
                onClick={() => this.updateStateAction(record, 'stop')}
              >
                停發
              </span>
            </AuthWrapCom>
          ) : null}
        </span>
      );
    }
    // 审批中
    if (status === 2) {
      return (
        <span>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'offer_detail',
            ]}
          >
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthWrapCom>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'update_status',
            ]}
          >
            <Divider type="vertical" />
            <span
              style={{ color: '#F5222D' }}
              onClick={() => this.updateStateAction(record, 'cancel')}
            >
              取消申請
            </span>
          </AuthWrapCom>
        </span>
      );
    }
    // 已驳回
    if (status === 4) {
      return (
        <span>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'offer_detail',
            ]}
          >
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthWrapCom>
        </span>
      );
    }
    // 已停发
    if (status === 5) {
      return (
        <span>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'offer_detail',
            ]}
          >
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthWrapCom>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'update_status',
            ]}
          >
            <Divider type="vertical" />
            <span
              style={{ color: '#F5222D' }}
              onClick={() => this.updateStateAction(record, 'recover_offer')}
            >
              恢復發放
            </span>
          </AuthWrapCom>
        </span>
      );
    }
    // 已失效
    if (status === -1) {
      return (
        <span>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'offer_detail',
            ]}
          >
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthWrapCom>
        </span>
      );
    }
    // 未完成
    if (status === 0) {
      return (
        <span>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'offer_detail',
            ]}
          >
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthWrapCom>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'update_channel_entry',
            ]}
          >
            <Divider type="vertical" />
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'edit')}
            >
              编辑
            </span>
          </AuthWrapCom>
        </span>
      );
    }
    if (status === 6) {
      return (
        <span>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'offer_detail',
            ]}
          >
            <span
              style={{ color: '#1890ff' }}
              onClick={() => this.toDetailAction(record, 'look')}
            >
              查看
            </span>
          </AuthWrapCom>
          <AuthWrapCom
            authList={[
              'points_management',
              'points_offer',
              'fixed',
              'inside_test_pass',
            ]}
          >
            <Divider type="vertical" />
            <span
              style={{ color: '#F5222D' }}
              onClick={() => this.updateStateAction(record, 'pass_test')}
            >
              預處理通過
            </span>
          </AuthWrapCom>
        </span>
      );
    }
    return (
      <AuthWrapCom
        authList={[
          'points_management',
          'points_offer',
          'fixed',
          'offer_detail',
        ]}
      >
        <span
          style={{ color: '#1890ff' }}
          onClick={() => this.toDetailAction(record, 'look')}
        >
          查看
        </span>
      </AuthWrapCom>
    );
  }

  updateStateAction(record, type) {
    if (!record.id) {
      return;
    }
    if (!type) {
      return;
    }
    const self = this;
    const content2Json = {
      pass_test: '確定預處理通過嗎?',
      delete: '確定要刪除該項嗎?',
      recover_offer: '確定要恢復發放該項嗎?',
      cancel: '確定要取消該項嗎?',
      stop: '確定要停發該項嗎?',
    };
    confirm({
      title: '提示',
      content: content2Json[type],
      onOk() {
        return new Promise(async (resolve) => {
          const postData = {
            id: record.id,
            action: type,
          };
          if (type === 'stop' || type === 'recover_offer') {
            postData.offer_policy_entry_id = record.offer_policy_entry_id;
          }
          const { data } = await updateCustomStatusRequest(postData);
          resolve();
          if (data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }
  stopOrRestartAction(record) {
    if (!record.id) {
      return;
    }
    const self = this;
    confirm({
      title: '提示',
      content: '確定預處理通過嗎？',
      onOk() {
        return new Promise(async (resolve) => {
          const { data } = await updateCustomStatusRequest({
            id: record.id,
            action: 'pass_test',
          });
          resolve();
          if (data.status) {
            self.reloadPage();
          }
        });
      },
    });
  }

  pageChangeAction = (current, size) => {
    const { history, location, system } = this.props;
    const query = system.query;
    const querystring = qs.stringify({ ...query, page: current });
    history.push({ ...location, search: `?${querystring}` });
  };

  reloadPage() {
    const { history, location, system } = this.props;
    const querystring = qs.stringify(system.query);
    history.push({ ...location, search: `?${querystring}` });
  }

  render() {
    const { isDisabledEdit } = this.state;
    const {
      fixedGroupChannelListInfo,
      fixedGroupInfoDetail,
    } = this.props.integralManageGive;
    const { list, total } = fixedGroupChannelListInfo;
    const { reportChannelJson, query } = this.props.system;
    const page = +query.page || 1;

    const dispatchRule = (item) => {
      if (
        entryFixedType2Json[fixedGroupInfoDetail.entry_fixed_type] ===
          'equities_package' ||
        entryFixedType2Json[fixedGroupInfoDetail.entry_fixed_type] ===
          'promotion'
      ) {
        return '';
      }
      return (
        <p className="desc-item">
          <span className="title">發放規則：</span>
          <span className="value">
            {item.offer_rules &&
              `每消費${item.offer_rules.pay}港幣（元）可獲得${item.offer_rules.points}積分`}
          </span>
        </p>
      );
    };

    const dispatchDes = (item) => {
      if (
        entryFixedType2Json[fixedGroupInfoDetail.entry_fixed_type] ===
          'promotion' &&
        Array.isArray(item.offer_rules)
      ) {
        return (
          <React.Fragment>
            <p className="desc-item">
              <span className="title">發放描述：</span>
              <span className="value">{item.entry_desc || '--'}</span>
            </p>
            <p className="desc-item">
              <span className="title">封頂：</span>
              <span className="value">
                {item.offer_rules &&
                item.offer_rules.length > 0 &&
                item.offer_rules[0].top &&
                (item.offer_rules[0].top.dimenssion === 'no_top' ||
                  item.offer_rules[0].top.dimenssion === 'none')
                  ? '不封頂'
                  : `${
                      dimenssion2Json[item.offer_rules[0].top.dimenssion]
                    }最多獲得${item.offer_rules[0].top.most}次積分發放`}
              </span>
            </p>
          </React.Fragment>
        );
      }
      if (!Array.isArray(item.offer_rules)) {
        return (
          <React.Fragment>
            <p className="desc-item">
              <span className="title">發放描述：</span>
              <span className="value">{item.entry_desc || '--'}</span>
            </p>
            <p className="desc-item">
              <span className="title">封頂：</span>
              <span className="value">
                {item.offer_rules &&
                item.offer_rules.top &&
                (item.offer_rules.top.dimenssion === 'no_top' ||
                  item.offer_rules.top.dimenssion === 'none')
                  ? '不封頂'
                  : `${
                      dimenssion2Json[item.offer_rules.top.dimenssion]
                    }最多獲得${item.offer_rules.top.most}次積分發放`}
              </span>
            </p>
          </React.Fragment>
        );
      }
    };

    return (
      <div className="p-fixeddetail-wrap p-give-wrap">
        <div className="give-content-wrap">
          <div className="detail-header-wrap">
            <Card title="支付發放積分" bordered={false}>
              <div style={{ paddingLeft: 24, paddingRight: 24 }}>
                <div className="header-detail">
                  <div className="header-detail-item">
                    <p className="title">發放項名稱：</p>
                    <p className="value">{fixedGroupInfoDetail.entry_name}</p>
                  </div>
                  <div className="header-detail-item">
                    <p className="title">變動類型：</p>
                    <p className="value">
                      {+fixedGroupInfoDetail.change_type === 1
                        ? '增加'
                        : '減少'}
                    </p>
                  </div>
                </div>
                <div className="header-detail">
                  <div className="header-detail-item">
                    <p className="title">發放項描述：</p>
                    <p className="value">{fixedGroupInfoDetail.entry_desc}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div className="detail-content-wrap">
            <Card
              bordered={false}
              title="分渠道設置"
              extra={
                isDisabledEdit ? null : (
                  <AuthWrapCom
                    authList={[
                      'points_management',
                      'points_offer',
                      'fixed',
                      'add_channel_entry',
                    ]}
                  >
                    <Button
                      icon="plus"
                      type="primary"
                      onClick={() => {
                        this.props.history.push(
                          '/integral-manage/give-fixed/detail/config?group_id=' +
                            this.props.system.query.group_id
                        );
                      }}
                    >
                      創建渠道發放配置
                    </Button>
                  </AuthWrapCom>
                )
              }
            >
              <div className="content-list-wrap">
                {list &&
                  list.map((item, index) => {
                    const { offer_points_valid_date } = item;
                    return (
                      <div className="content-list-item" key={index}>
                        <div className="item-desc">
                          <p className="desc-item name">
                            發放渠道：
                            {reportChannelJson[item.channel_id]}
                          </p>
                          <p className="desc-item name">
                            發放項ID：
                            {item.id}
                          </p>

                          {dispatchRule(item)}
                          {dispatchDes(item)}

                          <p className="desc-item w-110 none">
                            <span className="title">生效時間：</span>
                            <span className="value">
                              2016-12-12 06:00 ~ 2017-12-12
                              18:00(假的数据，别看了，后台接口没有返回)
                            </span>
                          </p>
                        </div>
                        <div className="item-desc">
                          {/* TODO */}
                          <div className="desc-item">
                            <span>發出積分有效期：</span>
                            <span>
                              {convertValidDateToText(
                                offer_points_valid_date
                              ) || '-'}
                            </span>
                          </div>
                          <div className="desc-item">
                            <span>更新時間：</span>
                            <span>{item.edit_time}</span>
                          </div>
                        </div>
                        <div className="item-desc edit-name">
                          <div className="desc-item">
                            <span>編輯人：</span>
                            <span>{item.edit_by}</span>
                          </div>
                        </div>
                        {+item.offer_policy_entry_id === 0 &&
                        (item.status === 1 || item.status === 3) ? (
                          <p className="status w-90 u-status status-stop">
                            發放異常
                          </p>
                        ) : (
                          <p
                            className={[
                              'status',
                              'w-90',
                              'u-status',
                              status2Json[item.status] &&
                                status2Json[item.status].className,
                            ].join(' ')}
                          >
                            {status2Json[item.status] &&
                              status2Json[item.status].name}
                          </p>
                        )}
                        <div className="operation-wrap w-110">
                          {this.renderOperation(item, index)}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div style={{ textAlign: 'right', padding: '20px 10px' }}>
                <Pagination
                  current={page}
                  total={total}
                  onChange={this.pageChangeAction}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ integralManageGive, system }) => ({
    integralManageGive: integralManageGive.toJS(),
    system: system.toJS(),
  }))(FixedDetailPage)
);
