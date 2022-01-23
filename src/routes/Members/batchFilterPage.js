/* eslint-disable react/no-unescaped-entities */
/* 用户行为 */
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import _trim from 'lodash/trim';
import {
  Card,
  Input,
  Form,
  Modal,
  Row,
  Col,
  Checkbox,
  Upload,
  Button,
  Icon,
  Steps,
  message,
} from 'antd';
import UrlParse from 'url-parse';
import { getToken } from 'utils/session';
import { str2Md5, copyString } from 'utils/tools';
import { API_BASE, HEADER_TOKEN_NAME } from 'constants';
import { addTask } from 'services/taskCenter';
import './members.less';

const FormItem = Form.Item;
const Step = Steps.Step;

// 表单项布局
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

// 下载地址
const base_url = new UrlParse(API_BASE);
const DOWNLOAD_ADDR = `${base_url.origin}/file/%E6%89%B9%E9%87%8F%E7%AD%9B%E9%80%89%E7%B4%A2%E5%BC%95%E8%A1%A8%EF%BC%88%E6%A8%A1%E6%9D%BF%EF%BC%89.csv`;

class BatchFilterPage extends React.PureComponent {
  state = {
    missionModalVisible: false,
    hintModalVisible: false,
    uploadPath: null,
    selected: [],
    submitting: false,
    successId: null,
    fileList: [],
  };

  // 拿到序号, 然后在处理对应的 item
  normalizeFilterItem = (selected) => {
    const list = new Array(7);
    for (const item of selected) {
      const [value, index] = item.split('.');
      list[index] = value;
    }
    return list.filter((val) => val);
  };

  handleOk = () => {
    this.props.form.validateFields(async (err, value) => {
      if (err) {
        return;
      }
      const { task_name, remark, password } = value;
      const { uploadPath, selected } = this.state;
      const query = {
        task_type: 1,
        task_name,
        index_table: uploadPath,
        target_select_field: this.normalizeFilterItem(selected),
      };
      if (_trim(remark) !== '') {
        query.remark = _trim(remark);
      }
      if (_trim(password)) {
        query.password = str2Md5(password);
      }
      await this.setState(
        {
          submitting: true,
        },
        () => {
          // 上傳
          addTask(query)
            .then((res) => {
              if (res && res.data && res.data.status) {
                this.hideAddmissionModal();
                this.setState({
                  submitting: false,
                  successId: res.data.data.id,
                });
                setTimeout(() => {
                  this.showHintModal();
                }, 500);
              } else {
                this.setState({
                  submitting: false,
                });
              }
            })
            .catch((_) => {
              this.setState({ submitting: false });
            });
        }
      );
    });
  };

  handleCancel = () => {
    this.hideAddmissionModal();
  };

  hideAddmissionModal = () => {
    this.setState({
      missionModalVisible: false,
    });
  };

  showAddmissionModal = () => {
    this.setState({
      missionModalVisible: true,
    });
  };

  handleClickSearchBtn = () => {
    // 检测表单: 没有选项和没有上传文件
    const needChecked = true; // DEBUG 方便調試
    const { selected, uploadPath } = this.state;
    if (needChecked) {
      if (selected.length === 0) {
        message.error('你沒有勾選目標篩選項');
        return;
      }
      if (!uploadPath) {
        message.error('你沒有上傳文件');
        return;
      }
    }
    this.showAddmissionModal();
  };

  jumpToMissionCenterPage = () => {
    this.props.history.push('/task-center/list');
  };

  hideHintModal = () => {
    this.setState({
      hintModalVisible: false,
    });
    this.props.history.goBack();
  };

  showHintModal = () => {
    this.setState({
      hintModalVisible: true,
    });
  };

  // 筛选项
  handleSelect = (value) => {
    this.setState({
      selected: value,
    });
  };

  handleCopy = async () => {
    const result = await copyString(this.state.successId);
    message.success(result ? '复制成功' : '复制失败');
  };

  handleClickCancelBtn = () => {
    this.props.history.goBack();
  };

  beforeUpload = async (file) => {
    const fileType = file.type;
    const fileTypeSet = new Set([
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]);
    const fileExtSet = new Set(['csv', 'CSV']);
    if (fileTypeSet.has(fileType)) {
      return true;
    }
    // NOTE: 如果从 file 对象中获取不到 type 字段, 那么只能从文件名字中获取文件类型
    if (!fileType) {
      const name = file.name;
      const fileExt = this.getFileExt(name);
      if (!fileExtSet.has(fileExt)) {
        message.error('暫支持CSV格式文件上傳！');
        return false;
      }
      return true;
    }
    // NOTE: 如果存在文件类型, 由于不同平台上的文件类型存在很大的差异, 那么需要解析文件类型的后缀来判断文件的类型
    const tempList = fileType.split('/');
    const rawFileType = tempList[tempList.length - 1];
    const fileExt = this.getFileExt(rawFileType);
    if (!fileExtSet.has(fileExt)) {
      message.error('暫支持CSV格式文件上傳！');
      return false;
    }
    return true;
  };

  getFileExt = (fileType) => {
    const index = fileType.lastIndexOf('.');
    const fileExt = fileType.slice(index + 1);
    return fileExt;
  };

  clearFileList = async () => {
    await this.setState({ fileList: [] });
  };

  // 文件上传状态
  handleChange = async ({ fileList }) => {
    const length = fileList.length;
    await this.setState({ fileList });
    if (length > 0) {
      const file = fileList[0];
      const { status } = file;
      if (status === 'done') {
        const {
          response: { status: _status, data, message: msg },
        } = file;
        if (_status) {
          const { path } = data;
          this.setState({
            uploadPath: path,
          });
        } else {
          message.error(msg);
          this.setState({
            uploadPath: null,
            fileList: [],
          });
        }
      }
    } else {
      this.setState({
        uploadPath: null,
        fileList: [],
      });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { uploadPath, fileList } = this.state;
    return (
      <div className="batch-filter-page">
        <Card bordered={false}>
          <h3 className="title">批量篩選工具使用方法：</h3>
          <p>• 下載附件Excel ，按照模板粘貼需要篩選的索引內容</p>
          <p>• 在下方上傳編輯好的索引表格，點擊篩選，生成任務，保存編號</p>
          <p>• 到任務中心下載查看篩選結果</p>
          <h3 className="title">使用須知：</h3>
          <p>
            • 請勿修改Excel 表頭，僅粘貼已有的索引項即可，沒有的內容直接留空
          </p>
          <p>
            •
            為節省篩選結果的產出時間、減少數據處理的工作量並降低會員數據洩露的風險，請根據實際情況選擇需要展現的字段
          </p>
          <p>• 請記住/複製當次篩選任務的編號，便於在任務中心進行查找</p>
          <p>• 會員ID、手機號、郵箱填寫任意一項即可，不同行可選填不同字段</p>
          <p>
            •
            若填寫多項，則按照ID&gt;手機號&gt;郵箱的優先級進行逐級篩選,篩選出結果則停止本行篩選,不進行下一級篩選
          </p>
          <p>&nbsp;&nbsp;&nbsp;舉例說明：</p>
          <p>
            &nbsp;&nbsp;&nbsp;&nbsp;（1）只輸入手機號，則以手機號爲準進行篩選，若無篩選結果,則結果表格中展示空白。
          </p>
          <p>
            &nbsp;&nbsp;&nbsp;&nbsp;（2）同時輸入ID、手機號，優先篩選會員ID，若篩選出結果,則停止本行篩選;
            若無結果, 則通過手機號再次進行篩選。
          </p>
          <p>
            •
            手機號需要以“區號+手機號“的形式輸入，號碼中請不要留空格，否則無法篩出結果
          </p>
          <p>
            &nbsp;&nbsp;&nbsp;正確示例：85512345678 或
            +85512345678（註：有無“+”均支持搜索）
          </p>
          <p>
            &nbsp;&nbsp;&nbsp;錯誤示例：855 12345678 或 85512 345678 或 12345678
          </p>
          <p>• 表格中請勿留空行(若留空行，會導致搜索終止）</p>
          <p>
            •
            表格內容請以半角字符進行填寫，全角字符可能會導致搜索失敗（會員ID若為全角字符，無法篩出結果）
          </p>
          <p>
            • 索引項（會員ID、手機號、郵箱）若為 藍色字體 ，如：
            <span style={{ color: '#0000ff' }}>100034</span>
            。則此行篩選結果是通過該索引項篩選得出
          </p>
          <p>
            • 索引項（手機號、郵箱）若為綠色字體，如：
            <span style={{ color: '#00ff00' }}>100034</span>
            。則該字段可能為全角符號，此行篩選結果是通過該索引項篩選得出
          </p>
        </Card>
        <Card
          title="目標篩選項（請根據實際需要勾選）："
          style={{ marginTop: 30 }}
          bordered={false}
        >
          <Checkbox.Group
            style={{ width: '100%' }}
            onChange={this.handleSelect}
          >
            <Row>
              {/* 这里使用 .[index] 的方式来处理每一个 item 顺序, 但是需要在提交服务器的时候进行处理  */}
              <Col span={5}>
                <Checkbox value="account_id.0">會員ID</Checkbox>
              </Col>
              <Col span={5}>
                <Checkbox value="telephone.1">手機號</Checkbox>
              </Col>
              <Col span={5}>
                <Checkbox value="email.2">郵箱</Checkbox>
              </Col>
              <Col span={5}>
                <Checkbox value="nick_name.3">會員暱稱</Checkbox>
              </Col>
            </Row>
            <Row>
              <Col span={5}>
                <Checkbox value="reg_time.4">註冊時間</Checkbox>
              </Col>
              <Col span={5}>
                <Checkbox value="reg_status.5">是否註冊/綁定01帳號</Checkbox>
              </Col>
              <Col span={5}>
                <Checkbox value="status.6">帳號狀態</Checkbox>
              </Col>
            </Row>
          </Checkbox.Group>
          <div style={{ marginTop: 25 }}>
            <Row>
              <Col span={2}>上傳索引表格: </Col>
              <Col span={10}>
                <Upload
                  action={`${API_BASE}file_upload`}
                  headers={{ [HEADER_TOKEN_NAME]: getToken() }}
                  data={{ file_type: 2, modular: 'task_center' }}
                  accept=".csv,.CSV"
                  onChange={this.handleChange}
                  beforeUpload={this.beforeUpload}
                  listType="picture"
                  className="upload-list-inline"
                  fileList={fileList}
                >
                  {uploadPath ? (
                    ''
                  ) : (
                    <Button>
                      <Icon type="upload" /> 上傳文件
                    </Button>
                  )}
                </Upload>
                <p className="tips">
                  <span>僅支持模板CSV指定的文件格式上傳; </span>
                  <a href={DOWNLOAD_ADDR} download className="download">
                    點擊下載批量筛选索引表（模板）.CSV
                  </a>
                </p>
              </Col>
            </Row>
            <Row>
              <Col span={2} style={{ visibility: 'hidden' }}>
                佔位符
              </Col>
              <Col>
                <Button type="normal" onClick={this.handleClickCancelBtn}>
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={this.handleClickSearchBtn}
                  style={{ marginLeft: 10 }}
                >
                  提交搜索
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
        <Modal
          title="提交任務"
          visible={this.state.missionModalVisible}
          onOk={this.handleOk}
          confirmLoading={this.state.submitting}
          onCancel={this.handleCancel}
        >
          <Form>
            <Row>
              <Col>
                <FormItem label="任務名稱" {...formItemLayout}>
                  {getFieldDecorator('task_name', {
                    rules: [
                      { required: true, message: '任務名稱不能為空' },
                      { max: 30, message: '任務名稱限制為30個字符' },
                    ],
                  })(<Input placeholder="請輸入簡單的任務名稱" />)}
                </FormItem>
                <FormItem label="備注" {...formItemLayout}>
                  {getFieldDecorator('remark', {
                    rules: [{ max: 100, message: '可不填寫，限制100個字符' }],
                  })(<Input.TextArea placeholder="可不填" />)}
                </FormItem>
                <FormItem label="密碼" {...formItemLayout}>
                  {getFieldDecorator('password', {
                    rules: [
                      {
                        max: 20,
                        message: '限制20個字符，區分大小寫，不支持空格',
                      },
                      { pattern: /^[^ ]*$/g, message: '密碼不能包含空格' },
                      {
                        pattern: /^[^\u4e00-\u9fa5]+$/,
                        message: '密码不能包含中文',
                      },
                    ],
                  })(<Input placeholder="可不填" />)}
                </FormItem>
                <p className="hint-text">
                  用於在任務中心提取處理結果的依據，如不設置,
                  則可以看見任務的所有人都可以提取此結果
                </p>
              </Col>
            </Row>
          </Form>
        </Modal>

        <Modal
          visible={this.state.hintModalVisible}
          onOk={this.jumpToMissionCenterPage}
          onCancel={this.hideHintModal}
          okText="前往任務中心"
          cancelText="關閉"
          className="hint-modal"
          closable={false}
        >
          <Row type="flex" justify="center">
            <Col span={4} style={{ textAlign: 'right', paddingRight: 10 }}>
              <Icon
                type="check-circle"
                style={{ color: '#52c41a', fontSize: 22 }}
              />
            </Col>
            <Col span={20} className="right-box">
              <p className="title">任務已提交</p>
              <p className="hint">您提交的任務在任務中心的編號將為：</p>
              <p className="number-box">
                <span className="number">{this.state.successId}</span>
                <span className="copy" onClick={this.handleCopy}>
                  復制
                </span>
              </p>
            </Col>
            <Steps current={1} progressDot>
              <Step title="提交任務" />
              <Step title="數據處理" />
              <Step title="完成處理" />
            </Steps>
          </Row>
        </Modal>
      </div>
    );
  }
}

export default withRouter(
  connect(({ memberInfo, system }) => ({
    memberInfo: memberInfo.toJS(),
    system: system.toJS(),
  }))(Form.create()(BatchFilterPage))
);
