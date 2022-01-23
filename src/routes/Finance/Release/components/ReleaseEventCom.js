import React from 'react';
import { Tooltip } from 'antd';
import '../index.less';

export default class ReleaseEventCom extends React.Component {
  render() {
    const { offerRuleList, reportChannelJson } = this.props;
    if (!offerRuleList || !offerRuleList.length) {
      return;
    }
    const eventList = [];
    const example_id_list = [];
    offerRuleList.forEach((item) => {
      item.rule.forEach((it) => {
        if (!example_id_list.includes(it.example_id)) {
          eventList.push(it);
          example_id_list.push(it.example_id);
        }
      });
    });
    return (
      <React.Fragment>
        <div className="none">
          {offerRuleList.map((events) => {
            return events.rule.map((item, childIndex) => {
              return (
                <p key={childIndex}>
                  <b style={{ marginLeft: 0 }}>
                    事件實例
                    {item.example_id}
                  </b>
                  ： 返回值：
                  {item.type === 'abs' ? (
                    <span>
                      絕對值
                      {item.return_value ? (
                        <span>（{item.return_value[0]}）</span>
                      ) : null}
                    </span>
                  ) : (
                    <span>
                      區間值
                      {item.return_value ? (
                        <span>
                          （{item.return_value[0]}-{item.return_value[1]}）
                        </span>
                      ) : null}
                    </span>
                  )}
                  {item.event_desc ? (
                    <span>
                      ；事件描述：
                      {item.event_desc}
                    </span>
                  ) : null}
                  {item.report_channel_id ? (
                    <span>
                      ；上報渠道：
                      {reportChannelJson[item.report_channel_id]}
                    </span>
                  ) : null}
                </p>
              );
            });
          })}
        </div>
        <div className="m-event-list-wrap">
          <div className="flex-wrap m-header">
            <div className="event-list list-item item-header flex-small">
              上報渠道
            </div>
            <div className="event-list list-item item-header flex-small">
              事件名稱
            </div>
            <div className="event-list list-item item-header">事件描述</div>
            <div className="event-list list-item item-header flex-small">
              參數
            </div>
            <div className="event-list list-item item-header flex-small">
              返回類型
            </div>
            <div className="event-list list-item item-header flex-small">
              值為
            </div>
          </div>
          <div className="m-content">
            {eventList.map((item, index) => {
              return (
                <div className="flex-wrap flex-list" key={index}>
                  <div className="event-list list-item item-content flex-small">
                    {item.report_channel_id
                      ? reportChannelJson[item.report_channel_id]
                      : ''}
                  </div>
                  <div className="event-list list-item item-content flex-small">
                    事件實例{item.example_id}
                  </div>
                  <div className="event-list list-item item-content">
                    <Tooltip title={item.event_desc}>{item.event_desc}</Tooltip>
                  </div>
                  <div className="event-list list-item item-content flex-small">
                    {item.event_params &&
                      item.event_params.map((subItem, subIndex) => {
                        return <div key={subIndex}>{subItem.name}</div>;
                      })}
                  </div>
                  <div className="event-list list-item item-content flex-small">
                    {item.event_params &&
                      item.event_params.map((subItem, subIndex) => {
                        return (
                          <div key={subIndex}>
                            {' '}
                            {subItem.type === 'abs' ? '絕對值' : '區間值'}
                          </div>
                        );
                      })}
                  </div>
                  <div className="event-list list-item item-content flex-small">
                    {item.event_params &&
                      item.event_params.map((subItem, subIndex) => {
                        if (subItem.type === 'sec') {
                          return (
                            <div key={subIndex}>
                              {subItem.value[0]}-{subItem.value[1]}
                            </div>
                          );
                        }
                        return <div key={subIndex}>={subItem.value[0]}</div>;
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
