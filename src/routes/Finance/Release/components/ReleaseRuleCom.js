import React from 'react';
import { dimenssion2Json } from 'config/ob.config';

export default class ReleaseRuleCom extends React.Component {
  render() {
    const { offerRuleList } = this.props;
    if (!offerRuleList || !offerRuleList.length) {
      return;
    }
    return (
      <React.Fragment>
        {offerRuleList.map((events, index) => {
          return (
            <p key={index} style={{ marginBottom: '5px' }}>
              <b style={{ marginLeft: 0 }}>
                規則
                {index + 1}：
              </b>
              {events.rule.map((item, childIndex) => {
                return (
                  <span key={childIndex}>
                    <b>
                      事件實例
                      {item.example_id}
                    </b>
                    觸發
                    <b>{item.times}</b>次
                    {childIndex < events.rule.length - 1 ? (
                      events.relation === 'and' ? (
                        <b>且</b>
                      ) : (
                        <b>或者</b>
                      )
                    ) : (
                      ''
                    )}
                  </span>
                );
              })}
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: '5px'
                }}
              >
                則發放
                {events.change_type === 'abs' ? (
                  <b>
                    {events.change_value[0]}
                    積分
                  </b>
                ) : (
                  <b>
                    {events.change_value[0]}-{events.change_value[1]}
                    積分
                  </b>
                )}
                ，
              </span>
              <span>
                {events.top.dimenssion !== 'no_top' ? (
                  <span>
                    <b>{dimenssion2Json[events.top.dimenssion]}</b>
                    最多可獲得
                    <b>{events.top.value}</b>
                    {events.top.type === 'get_times' ? '次' : '積分'}
                  </span>
                ) : (
                  <b>不封頂</b>
                )}
                ；
              </span>
            </p>
          );
        })}
        {offerRuleList.length > 1 ? (
          <p
            style={{
              fontSize: '12px',
              color: '#999'
            }}
          >
            說明：多個發放規則之間是【或】關係
          </p>
        ) : null}
      </React.Fragment>
    );
  }
}
