/*
  事件池中的每次事件
*/
import React from 'react';
import { Tooltip } from 'antd';

export default class EventCell extends React.Component {
  deleteAction() {
    if (this.props.onDelete) {
      this.props.onDelete();
    }
  }
  editAction() {
    if (this.props.onEdit) {
      this.props.onEdit();
    }
  }

  detailAction() {
    if (this.props.onDetail) {
      this.props.onDetail();
    }
  }

  renderEventParamsDom = () => {
    const { eventInfo } = this.props;
    const { event_params } = eventInfo;
    const list = event_params.length > 2 ? event_params.slice(0, 2) : event_params;
    // console.log(list);
    return list.map((item, index) => {
      return (
        <React.Fragment key={index}>
          <div className="cell-item">
            <p className="cell-item-title">参数{index + 1}：</p>
            <p className="cell-item-value">{item.name}</p>
          </div>
          <div className="cell-item">
            <p className="cell-item-title">返回值：</p>
            <p className="cell-item-value">{item.type === 'abs' ? `(絕對值)${item.value.join('')}` : `(區間值)${item.value.join('~')}`}</p>
          </div>
        </React.Fragment>
      );
    });
  }

  render() {
    const { eventInfo } = this.props;
    return (
      <div className={['m-event-cell-wrap', this.props.className].join(' ')}>
        <div className="cell-desc-wrap">
          <h3 className="cell-item name">
            事件實例
            {eventInfo.id}
          </h3>
          <div className="cell-item">
            <p className="cell-item-title">上報渠道：</p>
            <p className="cell-item-value">{eventInfo.report_channel}</p>
          </div>
          <div className="cell-item">
            <p className="cell-item-title">事件描述：</p>
            <p className="cell-item-value cell-item-oneline">
              <Tooltip title={eventInfo.event_desc} placement="top">
                {eventInfo.event_desc}
              </Tooltip>
            </p>
          </div>
          {this.renderEventParamsDom()}
          {
            eventInfo.event_params.length > 1 ? <p>...</p> : ''
          }
        </div>
        {this.props.isHideBtn ? this.props.isShowDetailBtn ? (
          <div className="cell-btn-wrap">
            <span className="btn-cell" onClick={() => this.detailAction()}>
              查看
            </span>
          </div>
        ) : '' : (
          <div className="cell-btn-wrap">
            <span className="btn-cell" onClick={() => this.editAction()}>
              編輯
            </span>
            <span
              className="btn-cell btn-del"
              onClick={() => this.deleteAction()}
            >
              刪除
            </span>
          </div>
          )}
      </div>
    );
  }
}
