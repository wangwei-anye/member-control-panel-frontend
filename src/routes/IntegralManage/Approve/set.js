import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { Card, Form, Input, Select, Button, Icon, Modal, message } from 'antd';
import Upload from 'components/Upload';
import {
  fetchAccountByDepartment,
  addApplication,
  fetchApplicationDetail,
  updateApplication,
} from 'services/integralManage/approve/approve';
import { addBusinessAccount } from 'services/integralManage/account/account';
import { getImgRequest } from 'services/common/common';
import BelongDepartment from 'components/Integral/BelongDepartmentCom';
import PartmentTreeSelect from 'components/PartmentTreeSelect';
import CreateAccount from 'components/Integral/CreateAccountCom';
import InputToolTipCom from 'components/Integral/InputToolTipCom';
import LoadingCom from 'components/LoadingCom';
import CancelBtnCom from 'components/CancelBtn';
import PreviewComponent from 'components/PreviewComponent';
import { isImgByUrlLing, isUserHasRights } from 'utils/tools';
import UploadTipAndDownTmpCom from 'components/UploadTipAndDownTmp';
import './approve.less';

const Option = Select.Option;
const { TextArea } = Input;
let isFirstDarpmentChange = false; // 用于判断是否是从请求的详情数据来 判断账户名称
const MAX_NUM = 100000000; // 最大额度
class IntegralManageApproveSetPage extends React.Component {
  constructor(props) {
    super(props);
    const id = props.system.query.id || '';
    const editType = props.system.query.type || '';
    this.state = {
      id,
      isDisabledEdit: editType === 'look',
      approveInfo: {
        account_id: '', // 关联的积分账户 Id
        department: this.props.auth.department, // 部门最后一级的 id
        description: '', // 说明
        attr_files: '', // 附件地址
        amount: 1, // 额度
      },
      isSubmiting: false,
      previewVisible: false,
      fileList: [],
      previewUrl: '',
      previewFileType: 1,
      defaultPartmentInfo: {},
      isShowCreateAccountModal: false,
      isLoadingData: true,
      listType: 'picture-card',
      isCreateAccountLoading: false, // 创建账户loading
      accountList: [], // 部门相关联的积分账户list
    };
    this.timer = null;
  }

  async componentDidMount() {
    const id = this.state.id;
    if (!id) {
      this.setState({
        isLoadingData: false,
        defaultPartmentInfo: {
          part2: this.props.auth.department,
        },
      });
      if (!isUserHasRights(['points_management', 'points_approval', 'add'])) {
        message.error('沒有新增審批的權限!');
      }
      return;
    }
    this.setState({
      isLoadingData: true,
    });
    isFirstDarpmentChange = true;
    const { data } = await fetchApplicationDetail({ id });
    let fileUrl = '';
    let fileName = '';
    if (data.status) {
      const dataInfo = data.data;
      fileUrl = dataInfo.file_url;
      fileName = dataInfo.file_name;

      if (dataInfo && Object.keys(dataInfo).length) {
        const obj = {
          amount: dataInfo.amount,
          attr_files: dataInfo.attr_files,
          description: dataInfo.description,
          account_id: dataInfo.account_id,
          department: dataInfo.department,
          file_name: fileName,
        };
        const defaultPartmentInfo = {
          part2: dataInfo.department_info.department_id,
          part1: dataInfo.department_info.pid,
        };
        const ext = this.getFileExt(fileUrl);
        const fileList = [
          {
            uid: '1',
            name: fileName,
            status: 'done',
            url: fileUrl,
            thumbUrl: ext === 'pdf' ? '' : fileUrl,
          },
        ];
        const approveInfo = { ...this.state.approveInfo, ...obj };
        this.setState(
          {
            approveInfo,
            fileList,
            defaultPartmentInfo,
            previewUrl: fileUrl,
            listType: ext === 'pdf' ? 'picture' : 'picture-card',
            previewFileType: ext === 'pdf' ? 2 : 1,
          },
          () => {
            this.modifyUploadComponentStyle();
          }
        );
      }
    }
    this.setState(
      {
        isLoadingData: false,
      },
      async () => {
        if (!fileUrl) {
          return;
        }
        const ext = this.getFileExt(fileUrl);
        if (ext !== 'pdf') {
          await this.handleImagePreview(fileUrl, fileName);
        } else {
          this.handlePDFPreview(fileUrl);
        }
      }
    );
  }

  handlePDFPreview = (fileUrl) => {
    // todo
  };

  handleImagePreview = async (fileUrl, fileName) => {
    let templateUrl = fileUrl;
    try {
      templateUrl = await getImgRequest(templateUrl);
      templateUrl = URL.createObjectURL(templateUrl);
      this.templateUrl = templateUrl;
    } catch (err) {
      console.log(err);
    }
    const fileList = [
      {
        uid: '1',
        name: fileName,
        status: 'done',
        url: templateUrl,
      },
    ];
    this.setState({
      fileList,
    });
  };

  getFileExt = (fileUrl) => {
    const dotIndex = fileUrl.lastIndexOf('.');
    return fileUrl.slice(dotIndex + 1).toLowerCase();
  };

  // NOTE: 这里是为了动态修改 ant-design 中的样式, 做法比较暴力
  modifyUploadComponentStyle = () => {
    const { previewFileType } = this.state;
    if (previewFileType === 2) {
      setTimeout(() => {
        const selector =
          '.upload-list-inline .ant-upload-list-item-thumbnail img';
        const imgIconEl = document.querySelector(selector);
        if (imgIconEl) {
          imgIconEl.setAttribute('src', '/static/img/picture.png');
          imgIconEl.setAttribute('style', 'padding: 10px');
          imgIconEl.removeAttribute('alt');
        } else {
          this.modifyUploadComponentStyle();
        }
      }, 50);
    }
  };

  componentWillUnmount() {
    message.destroy();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.templateUrl) {
      URL.revokeObjectURL(this.templateUrl);
      this.templateUrl = null;
    }
  }
  // 额度输入事件
  inputChangeAction = (value) => {
    const approveInfo = Object.assign({}, this.state.approveInfo, {
      amount: +value > MAX_NUM ? MAX_NUM : value,
    });
    this.setState({
      approveInfo,
    });
  };
  /**
   * 部门发生变化
   * @param {value} value
   */
  departmentChanageAction(value) {
    const approveInfo = Object.assign({}, this.state.approveInfo, {
      department: value,
    });
    this.setState({
      approveInfo,
      defaultPartmentInfo: {
        part1: '',
        part2: value,
      },
    });
    this.fetchAccountNameByDepartment(value);
  }

  // 根据部门来获取审批账户名称
  async fetchAccountNameByDepartment(pid) {
    const res = await fetchAccountByDepartment({
      department: pid,
      is_filter: 2,
    });
    if (res.data.status && res.data.data) {
      const list = res.data.data.list || [];
      const approveInfo = Object.assign({}, this.state.approveInfo, {
        account_id: isFirstDarpmentChange
          ? this.state.approveInfo.account_id
          : '',
      });
      this.setState({
        accountList: list,
        approveInfo,
      });
      isFirstDarpmentChange = false;
    }
  }

  // 审批账户更改 事件
  accountChangeAction(value) {
    const approveInfo = Object.assign({}, this.state.approveInfo, {
      account_id: value,
    });
    this.setState({
      approveInfo,
    });
  }

  // 描述更改 事件
  descriptionChangeAction(e) {
    const { value } = e.target;
    const approveInfo = Object.assign({}, this.state.approveInfo, {
      description: value,
    });
    this.setState({
      approveInfo,
    });
  }

  // 创建账户弹出框取消事件
  modalCancelAction() {
    this.setState({
      isShowCreateAccountModal: false,
      isCreateAccountLoading: false,
    });
  }

  // 创建账户弹出框确定事件
  async modalOkAction(value) {
    this.setState({
      isCreateAccountLoading: true,
    });
    const res = await addBusinessAccount({
      account_name: value.accountName,
      department: value.partmentInfo.part2,
    });
    this.setState({
      isCreateAccountLoading: false,
      isShowCreateAccountModal: false,
    });
  }

  // 文件上传成功事件
  fileUploadSuccessAction = (values) => {
    const { path, type, fileList, file_type, file_name } = values;
    let attr_files = '';
    let listType = 'picture-card';
    let attrFilesList = [];
    if (type === 'done' && path) {
      attr_files = path;
      attrFilesList = [...fileList];
      listType = file_type === 1 ? 'picture-card' : 'picture';
    }
    const approveInfo = Object.assign({}, this.state.approveInfo, {
      attr_files,
      file_name,
    });
    this.setState({
      approveInfo,
      fileList: attrFilesList,
      listType,
      previewFileType: file_type,
    });
  };

  // 预览图片
  handlePreview = (file) => {
    let { previewFileType } = this.state;
    const { type } = file;
    let previewUrl = file.url || file.thumbUrl;
    if (type === 'application/pdf' && file.response && file.response.status) {
      const {
        response: {
          data: { absolute_path: url },
        },
      } = file;
      previewUrl = url;
      previewFileType = 2;
    }
    this.setState({
      previewUrl,
      previewVisible: true,
      previewFileType,
    });
  };

  // 预览图片取消
  handleCancel = () => this.setState({ previewVisible: false });

  // 格式话数据以供符合提交数据格式
  formatData() {
    const { approveInfo } = this.state;
    if (!approveInfo.account_id) {
      message.error('請選擇審批賬戶名稱');
      return;
    }

    if (!(approveInfo.amount && /^[0-9]{1,10}$/.test(approveInfo.amount))) {
      message.error('請填寫審批額度');
      return;
    }

    if (!approveInfo.description.trim()) {
      message.error('請填寫積分預算使用說明');
      return;
    }

    if (!approveInfo.attr_files) {
      message.error('請上傳文件!');
      return;
    }

    approveInfo.description = approveInfo.description.trim();
    return approveInfo;
  }

  // 提交审核
  submit() {
    if (this.formatData()) {
      const postData = this.formatData();
      postData.status = 1;
      this.submitApplication(postData);
    }
  }

  // 暂存
  tmpSave() {
    if (this.formatData()) {
      const postData = this.formatData();
      postData.status = 0;
      this.submitApplication(postData);
    }
  }

  async submitApplication(postData) {
    const id = this.props.system.query.id;
    if (!id) {
      if (!isUserHasRights(['points_management', 'points_approval', 'add'])) {
        message.error('沒有新增審批的權限!');
        return;
      }
    }
    this.setState({
      isSubmiting: true,
    });
    const res = id
      ? await updateApplication({ ...postData, id })
      : await addApplication(postData);
    if (res.data.status) {
      message.success('成功!', 3, () => {
        this.setState({
          isSubmiting: false,
        });
        this.props.history.push('/integral-manage/approve');
      });
    } else {
      this.setState({
        isSubmiting: false,
      });
    }
  }

  render() {
    const {
      approveInfo,
      fileList,
      previewVisible,
      accountList,
      listType,
      isDisabledEdit,
      previewFileType,
      previewUrl,
    } = this.state;
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    // 部门审批账户选择 option
    const accountOptions = accountList.map((item) => {
      return (
        <Option key={item.id} value={item.id}>
          {item.account_name}
        </Option>
      );
    });
    const applicationId = this.props.system.query.id;
    return (
      <div className="p-approve-set-wrap" style={{ padding: 0 }}>
        <Card
          title="積分發放配置"
          loading={this.state.isLoadingData}
          bordered={false}
        >
          <div className="approve-set-content">
            {applicationId ? (
              <div className="list-item">
                <p className="item-title">編號</p>
                <div className="item-value-wrap">
                  <p>{applicationId}</p>
                </div>
              </div>
            ) : null}
            <div className="list-item">
              <p className="item-title">預算審批發起部門</p>
              <div className="item-value-wrap">
                {/* <BelongDepartment
                  disabled={isDisabledEdit}
                  defaultValue={this.state.defaultPartmentInfo}
                  style={{ width: '360px' }}
                  onChange={this.departmentChanageAction.bind(this)}
                /> */}

                <PartmentTreeSelect
                  value={this.state.defaultPartmentInfo.part2}
                  onChange={this.departmentChanageAction.bind(this)}
                  partmentList={this.props.system.partmentList}
                  style={{ width: '360px' }}
                  disabled={isDisabledEdit}
                />
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">審批賬戶名稱</p>
              <div className="item-value-wrap">
                <span
                  style={{
                    display: 'inline-block',
                    width: '360px',
                    marginRight: '10px',
                  }}
                >
                  <Select
                    disabled={isDisabledEdit}
                    style={{ width: '100%' }}
                    onChange={(value) => this.accountChangeAction(value)}
                    defaultValue={approveInfo.account_id}
                    value={approveInfo.account_id}
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  >
                    {accountOptions}
                  </Select>
                </span>
                {
                  isDisabledEdit ? null : null
                  // <span style={{ display: 'inline-block', width: '360px' }}>
                  //   <Button
                  //     icon="plus"
                  //     type="dashed"
                  //     style={{ width: '100%' }}
                  //     onClick={() =>
                  //       this.setState({
                  //         isShowCreateAccountModal: true
                  //       })
                  //     }
                  //   >
                  //     創建新積分帳戶
                  //   </Button>
                  // </span>
                }
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">積分預算審批額度</p>
              <div className="item-value-wrap">
                <div>
                  <InputToolTipCom
                    maxNum={MAX_NUM}
                    onChange={this.inputChangeAction}
                    style={{ width: '120px' }}
                    placeholder="額度"
                    value={approveInfo.amount}
                    min={1}
                    step={1}
                    max={MAX_NUM}
                    disabled={isDisabledEdit}
                  />
                  <span
                    style={{
                      display: 'inline-block',
                      color: 'rgba(0,0,0,0.85)',
                      marginLeft: '10px',
                    }}
                  >
                    積分
                  </span>
                </div>
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">積分預算使用說明</p>
              <div className="item-value-wrap">
                <TextArea
                  disabled={isDisabledEdit}
                  rows={4}
                  value={approveInfo.description}
                  placeholder="積分預算使用說明"
                  onChange={(e) => this.descriptionChangeAction(e)}
                  style={{ width: '360px', resize: 'none' }}
                />
              </div>
            </div>
            <div className="list-item">
              <p className="item-title">審批附件</p>
              <div className="item-value-wrap">
                <div
                  className="select-time-wrap"
                  style={{ overflow: 'hidden', cursor: 'pointer' }}
                >
                  <Upload
                    listType={listType}
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onSuccess={this.fileUploadSuccessAction}
                    showUploadList={{
                      showPreviewIcon: true,
                      showRemoveIcon: !isDisabledEdit,
                    }}
                    className={
                      listType == 'picture' ? 'upload-list-inline' : ''
                    }
                  >
                    {fileList.length >= 1 ? null : uploadButton}
                  </Upload>
                  <PreviewComponent
                    previewFileType={previewFileType}
                    previewUrl={previewUrl}
                    previewVisible={previewVisible}
                    handleCancel={this.handleCancel}
                  />
                </div>
                <div style={{ marginTop: 8 }}>
                  <UploadTipAndDownTmpCom />
                </div>
              </div>
            </div>
          </div>
          <div className="footer-wrap">
            <CancelBtnCom />
            {isDisabledEdit ? null : (
              <span>
                <Button
                  onClick={() => this.tmpSave()}
                  disabled={this.state.isSubmiting}
                  loading={this.state.isSubmiting}
                >
                  暫存
                </Button>
                <Button
                  type="primary"
                  onClick={() => this.submit()}
                  disabled={this.state.isSubmiting}
                  loading={this.state.isSubmiting}
                >
                  提交審核
                </Button>
              </span>
            )}
          </div>
        </Card>
        {this.state.isShowCreateAccountModal ? (
          <CreateAccount
            isLoading={this.state.isCreateAccountLoading}
            onOk={this.modalOkAction.bind(this)}
            onCancel={this.modalCancelAction.bind(this)}
          />
        ) : null}
      </div>
    );
  }
}
export default withRouter(
  connect(({ integralManageApprove, system, auth }) => ({
    integralManageApprove: integralManageApprove.toJS(),
    system: system.toJS(),
    auth: auth.toJS(),
  }))(Form.create()(IntegralManageApproveSetPage))
);
