import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { Steps, Button, Icon, Modal, message } from 'antd';
import { updateCustomStatusRequest } from 'services/integralManage/give/give';
import './config.less';

const Step = Steps.Step;
const confirm = Modal.confirm;
class ConfigStep1Page extends React.Component {
  componentWillUnmount() {
    message.destroy();
  }
  toListAction() {
    this.props.history.push('/member-task/list');
  }
  toDetailAction() {
    const { id } = this.props.system.query;
    if (id) {
      this.props.history.push(`/member-task/config/base?id=${id}&type=look`);
    }
  }
  cancleApplicationAction() {
    const { id } = this.props.system.query;
    if (id) {
      const self = this;
      confirm({
        title: '提示',
        content: '確定要取消該項申請嗎？',
        onOk() {
          return new Promise(async (resolve) => {
            const { data } = await updateCustomStatusRequest({
              id,
              action: 'cancel',
            });
            resolve();
            if (data.status) {
              message.success('取消成功', 1, () => {
                self.toListAction();
              });
            }
          });
        },
      });
    }
  }
  render() {
    return (
      <div className="p-custom-configstep-wrap">
        <div className="step-wrap">
          <Steps current={3}>
            <Step title="基本信息" />
            <Step title="配置積分發放項" />
            <Step title="配置規則" />
            <Step title="提交審批" />
          </Steps>
        </div>
        <div className="configstep-content-wrap">
          <p className="step-title">提交審批</p>
          <div className="submit-content">
            <Icon
              type="check-circle"
              style={{
                color: 'rgb(0,198,55)',
                fontSize: '72px',
              }}
            />
            <p className="success-tips">提交成功</p>
            <p className="tips">
              您發起的積分發放審批，已經成功提交，請等待審核結果，大約需要1-2個工作日
            </p>
            <div className="btns-wrap">
              <Button type="primary" onClick={() => this.toListAction()}>
                返回列表
              </Button>
              <Button
                style={{ margin: '8px' }}
                onClick={() => this.toDetailAction()}
              >
                查看事件詳情
              </Button>
              <Button onClick={() => this.cancleApplicationAction()}>
                取消申請
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ memberTask, system }) => ({
    memberTask: memberTask.toJS(),
    system: system.toJS(),
  }))(ConfigStep1Page)
);
