import React from 'react';
import { Modal, Input, message } from 'antd';
import BelongDepartment from './BelongDepartmentCom';
import './department.less';

export default class CreateAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accountName: '',
      partmentInfo: {}
    };
  }
  componentDidMount() {
    if (this.props.accountInfo && Object.keys(this.props.accountInfo).length) {
      const departmentInfo = this.props.accountInfo.department_info;
      const accountName = this.props.accountInfo.account_name;
      const partmentInfo = Object.assign({}, this.state.partmentInfo, {
        part1: departmentInfo.pid,
        part2: departmentInfo.department_id
      });
      this.setState({
        partmentInfo,
        accountName
      });
    }
  }
  componentWillUnmount() {
    message.destroy();
  }
  modalOkAction() {
    const { partmentInfo, accountName } = this.state;
    if (!accountName.trim()) {
      message.error('請輸入賬戶名稱！');
      return;
    }
    let id = '';
    if (this.props.accountInfo && this.props.accountInfo.id) {
      id = this.props.accountInfo.id;
    }
    if (this.props.onOk) {
      this.props.onOk({
        accountName: accountName.trim(),
        partmentInfo,
        id
      });
    }
  }
  modalCancelAction() {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }
  nameChangeAction = e => {
    const { value } = e.target;
    this.setState({
      accountName: value
    });
  };
  onChangeAction(value) {
    this.setState({
      partmentInfo: value
    });
  }
  render() {
    const accountId = this.props.accountInfo && this.props.accountInfo.id;
    const title = `${accountId ? '編輯' : '創建'}運營賬戶`;
    return (
      <Modal
        bodyStyle={{ width: '800px' }}
        title={title}
        visible
        onOk={() => this.modalOkAction()}
        onCancel={() => this.modalCancelAction()}
        destroyOnClose
        okButtonProps={{
          disabled: this.props.isLoading,
          loading: this.props.isLoading
        }}
        cancelButtonProps={{ disabled: this.props.isLoading }}
        okText="保存"
      >
        <div className="m-createaccont-wrap">
          <div className="create-account-wrap">
            {accountId ? (
              <div className="g-row">
                <div className="name">賬戶ID</div>
                <div className="value-wrap">
                  {this.props.accountInfo.union_id}
                </div>
              </div>
            ) : null}
            <div className="g-row">
              <div className="name">賬戶名稱</div>
              <div className="value-wrap">
                <Input
                  style={{ width: '350px' }}
                  maxLength={20}
                  defaultValue={this.state.accountName}
                  onChange={this.nameChangeAction}
                />
              </div>
            </div>
            <div className="g-row">
              <div className="name">所屬部門</div>
              <div className="value-wrap">
                <BelongDepartment
                  defaultValue={this.state.partmentInfo}
                  onChange={this.onChangeAction.bind(this)}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
