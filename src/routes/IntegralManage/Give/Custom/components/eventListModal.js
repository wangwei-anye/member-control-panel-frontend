import React from 'react';
import { Modal, message, Icon } from 'antd';
import EventCell from './EventCell';

class EventListModal extends React.Component {
  state = {
    selectList: []
  };
  componentWillMount() {
    if (this.props.selectList && this.props.selectList.length) {
      const arr = [];
      const selectList = this.props.selectList;
      this.props.eventList.forEach(item => {
        selectList.forEach(list => {
          if (+list.example_id === item.id) {
            arr.push(item);
          }
        });
      });
      this.setState({
        selectList: arr
      });
    }
  }
  // 选择事件
  selectItem(item) {
    const { selectList } = this.state;
    let isHasSame = false;
    if (!selectList.length) {
      isHasSame = false;
    } else {
      for (let i = 0; i < selectList.length; i += 1) {
        const current = selectList[i];
        if (+current.id === +item.id) {
          selectList.splice(i, 1);
          isHasSame = true;
          break;
        } else {
          isHasSame = false;
        }
      }
    }
    if (!isHasSame) {
      selectList.push(item);
    }
    this.setState({
      selectList
    });
  }
  modalOkAction() {
    const { selectList } = this.state;
    if (this.props.onOk && typeof this.props.onOk === 'function') {
      this.props.onOk({
        value: selectList
      });
    }
  }
  modalCancelAction() {
    if (this.props.onCancel && typeof this.props.onCancel === 'function') {
      this.props.onCancel();
    }
  }
  isActive(item) {
    const { selectList } = this.state;
    return selectList.some(current => {
      return +current.id === +item.id;
    });
  }
  render() {
    const { eventList } = this.props;
    return (
      <Modal
        width="985px"
        style={{ top: 20 }}
        title="給規則添加事件"
        visible
        onOk={() => this.modalOkAction()}
        onCancel={() => this.modalCancelAction()}
        destroyOnClose
      >
        <div className="m-modal-event-wrap">
          {eventList.map((item, index) => {
            return (
              <div
                key={index}
                className={[
                  'm-modal-event-item',
                  this.isActive(item) && 'active'
                ].join(' ')}
                onClick={() => this.selectItem(item, index)}
              >
                <EventCell
                  isHideBtn
                  isShowDetailBtn={false}
                  eventInfo={item}
                />
                <Icon type="check-circle" className="check-icon" />
              </div>
            );
          })}
        </div>
      </Modal>
    );
  }
}
export default EventListModal;
