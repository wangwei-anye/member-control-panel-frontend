/* 用户个人档案 */
import React from 'react';
import {
  Icon,
  Tabs,
  Form,
  Avatar,
  Input,
  Radio,
  DatePicker,
  Select,
  Row,
  InputNumber,
  Col,
  Tooltip,
  Tag,
  Button,
  Card,
  Spin,
  Alert,
} from 'antd';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import moment from 'moment';
import TabRouter from 'components/TabRouter';
import LoadingCom from 'components/LoadingCom';
import { USRE_TYPE, MEMBER_DETAIL_TABLIST } from 'config/ob.config';
import { isUserHasRights } from 'utils/tools';
import './members.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};
const loadingStyle = {
  textAlign: 'center',
  padding: '20px',
};
const readBaseInfoRight = [
  'member_manage',
  'member_detail',
  'archives',
  'read_base_info',
]; // 查看用戶個人檔案/基礎信息
const readContactInfoRight = [
  'member_manage',
  'member_detail',
  'archives',
  'read_contact_info',
]; // 查看用戶個人檔案/聯繫信息
const readPrivateInfoRight = [
  'member_manage',
  'member_detail',
  'archives',
  'read_other_info',
]; // 查看用戶個人檔案/隱私信息
class UserRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCanEdit: false,
    };
  }

  // 提交
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log(values);
    });
  };

  render() {
    const { isCanEdit } = this.state;
    const userInfo = this.props.memberInfo.userRecordInfo;
    const { getFieldDecorator } = this.props.form;
    const { userRecordLoading } = this.props.memberInfo;

    let idStr = '';
    if (userInfo.id) {
      const tempIdStr = userInfo.id.toString();
      if (tempIdStr.length > 4) {
        idStr = tempIdStr.substring(0, tempIdStr.length - 2) + '**';
      } else {
        idStr = tempIdStr.substring(0, tempIdStr.length - 1) + '*';
      }
    }

    let first_name_str = '';
    if (userInfo.first_name) {
      for (let i = 0; i < userInfo.first_name.length; i += 1) {
        first_name_str += '*';
      }
    }
    let last_name_str = '';
    if (userInfo.last_name) {
      for (let i = 0; i < userInfo.last_name.length; i += 1) {
        last_name_str += '*';
      }
    }
    let email_str = '';
    if (userInfo.email) {
      const word = userInfo.email.split('@');
      if (word.length >= 2) {
        if (word[0].length > 4) {
          email_str =
            word[0].substring(0, word[0].length - 2) + '**@' + word[1];
        } else {
          email_str = word[0].substring(0, word[0].length - 1) + '*@' + word[1];
        }
      }
    }

    let telphone_str = '';
    if (userInfo.telphone) {
      telphone_str =
        userInfo.telphone
          .toString()
          .substring(0, userInfo.telphone.length - 2) + '**';
    }

    if (userInfo.facebook_account && userInfo.facebook_account.length > 0) {
      userInfo.facebook_account = 1;
    } else {
      userInfo.facebook_account = 0;
    }
    if (userInfo.google_account && userInfo.google_account.length > 0) {
      userInfo.google_account = 1;
    } else {
      userInfo.google_account = 0;
    }

    return (
      <div className="user-detail-wrap">
        <div className="user-record-wrap">
          <TabRouter tabList={MEMBER_DETAIL_TABLIST} defaultKey="record" />
          <Form onSubmit={this.handleSubmit}>
            <div>
              <div className="common-title">基礎信息</div>
              {isUserHasRights(readBaseInfoRight) ? (
                <React.Fragment>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap-inline">
                          <span
                            className="form-item-title"
                            style={{
                              verticalAlign: 'top',
                              display: 'inline-block',
                              marginTop: '-10px',
                            }}
                          >
                            會員頭像
                          </span>
                          <span style={{ verticalAlign: 'top' }}>
                            <Avatar
                              style={{
                                width: '104px',
                                height: '104px',
                                padding: '8px',
                              }}
                              size="large"
                              shape="square"
                              src={userInfo.avatar_url}
                            >
                              {userInfo.realname}
                            </Avatar>
                          </span>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap-inline">
                          <span className="form-item-title">會員ID：</span>
                          <Tooltip title={userInfo.id}>
                            <span className="form-item-value">{idStr}</span>
                          </Tooltip>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <span className="form-item-title">會員類型：</span>
                        <span>{USRE_TYPE[userInfo.account_type]}</span>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">姓</p>
                          <div className="form-item-value">
                            <Tooltip title={userInfo.first_name}>
                              <Input
                                placeholder="姓"
                                value={first_name_str}
                                disabled={!isCanEdit}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">名</p>
                          <div className="form-item-value">
                            <Tooltip title={userInfo.last_name}>
                              <Input
                                placeholder="名"
                                value={last_name_str}
                                disabled={!isCanEdit}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">會員名稱</p>
                          <div className="form-item-value">
                            <Input
                              placeholder="會員名稱"
                              value={userInfo.username}
                              disabled={!isCanEdit}
                            />
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">暱稱</p>
                          <div className="form-item-value">
                            {getFieldDecorator('nickname', {
                              initialValue: userInfo.nickname,
                              rules: [],
                            })(
                              <Input placeholder="暱稱" disabled={!isCanEdit} />
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">性別</p>
                          <div className="form-item-value">
                            {getFieldDecorator('gender', {
                              initialValue: userInfo.gender,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={2}>女 Female</Radio>
                                <Radio value={1}>男 Male</Radio>
                                <Radio value={3}>不願透露undisclosed</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    {/* <Col span={16}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">尊稱</p>
                          <div className="form-item-value">
                            {getFieldDecorator('title', {
                              initialValue: userInfo.title,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>先生 Mr</Radio>
                                <Radio value={2}>夫人 Mrs</Radio>
                                <Radio value={3}>女士 Ms</Radio>
                                <Radio value={4}>小姐 Miss</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col> */}
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">出生日期</p>
                          <div className="form-item-value">
                            {getFieldDecorator('birthday', {
                              initialValue: userInfo.birthday
                                ? moment(userInfo.birthday)
                                : null,
                              rules: [],
                            })(
                              <DatePicker
                                disabled={!isCanEdit}
                                style={{ width: '100%' }}
                              />
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">香港地區</p>
                          <div className="form-item-value">
                            {getFieldDecorator('district', {
                              initialValue: userInfo.district,
                              rules: [],
                            })(
                              <Select
                                style={{ width: '100%' }}
                                disabled={!isCanEdit}
                              >
                                <Option value="central_and_western">
                                  中西區
                                </Option>
                                <Option value="eastern">東區</Option>
                                <Option value="southern">南區</Option>
                                <Option value="wan_chai">灣仔區</Option>
                                <Option value="kowloon_city">九龍城區</Option>
                                <Option value="kwun_tong">觀塘區</Option>
                                <Option value="sham_shui_po">深水埗區</Option>
                                <Option value="wong_tai_sin">黃大仙區</Option>
                                <Option value="yau_tsim_mong">油尖旺區</Option>
                                <Option value="kwai_tsing">葵青區</Option>
                                <Option value="northern">北區</Option>
                                <Option value="sai_kung">西貢區</Option>
                                <Option value="sha_tin">沙田區</Option>
                                <Option value="tai_po">大埔區</Option>
                                <Option value="tsuen_wan">荃灣區</Option>
                                <Option value="tuen_mun">屯門區</Option>
                                <Option value="yuen_long">元朗區</Option>
                                <Option value="islands">離島</Option>
                              </Select>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                </React.Fragment>
              ) : (
                <Alert
                  message="沒有權限查看個人檔案基礎信息"
                  type="error"
                  showIcon
                />
              )}
            </div>
            <div>
              <div className="common-title">聯繫信息</div>
              {isUserHasRights(readContactInfoRight) ? (
                <React.Fragment>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">郵箱</p>
                          <div className="form-item-value">
                            <Tooltip title={userInfo.email}>
                              <Input
                                placeholder="郵箱"
                                value={email_str}
                                disabled={!isCanEdit}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">手機號碼</p>
                          <div className="form-item-value">
                            <Tooltip title={userInfo.telphone}>
                              <Input
                                placeholder="郵箱"
                                value={telphone_str}
                                disabled={!isCanEdit}
                              />
                            </Tooltip>
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">Facebook 帳號綁定</p>
                          <div className="form-item-value">
                            {getFieldDecorator('facebook_account', {
                              initialValue: userInfo.facebook_account,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>是</Radio>
                                <Radio value={0}>否</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">Google 帳號綁定</p>
                          <div className="form-item-value">
                            {getFieldDecorator('google_account', {
                              initialValue: userInfo.google_account,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>是</Radio>
                                <Radio value={0}>否</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">優惠資訊</p>
                          <div className="form-item-value">
                            {getFieldDecorator('promotion', {
                              initialValue: userInfo.promotion,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>接收</Radio>
                                <Radio value={0}>不接收</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                </React.Fragment>
              ) : (
                <Alert
                  message="無權限查看個人檔案聯繫信息"
                  type="error"
                  showIcon
                />
              )}
            </div>
            <div>
              <div className="common-title">其他信息</div>
              {isUserHasRights(readPrivateInfoRight) ? (
                <React.Fragment>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">婚姻狀況</p>
                          <div className="form-item-value">
                            {getFieldDecorator('marital_status', {
                              initialValue: userInfo.marital_status,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>單身</Radio>
                                <Radio value={2}>已婚</Radio>
                                <Radio value={3}>其他</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={16}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">教育程度</p>
                          <div className="form-item-value">
                            {getFieldDecorator('education_level', {
                              initialValue: userInfo.education_level,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>中學或以下</Radio>
                                <Radio value={2}>文憑/證書課程/副學位</Radio>
                                <Radio value={3}>學士學位課程或以上</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">有子女</p>
                          <div className="form-item-value">
                            {getFieldDecorator('child_under_18', {
                              initialValue: userInfo.child_under_18,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>有</Radio>
                                <Radio value={0}>無</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={16}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">居住地區</p>
                          <div className="form-item-value">
                            {getFieldDecorator('residence', {
                              initialValue: userInfo.residence,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>香港</Radio>
                                <Radio value={2}>澳門</Radio>
                                <Radio value={3}>中國大陸</Radio>
                                <Radio value={4}>海外</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">駕駛執照</p>
                          <div className="form-item-value">
                            {getFieldDecorator('driver_license', {
                              initialValue: userInfo.driver_license,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>有</Radio>
                                <Radio value={0}>無</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                    <Col span={16}>
                      <FormItem {...formItemLayout}>
                        <div className="form-item-wrap">
                          <p className="form-item-title">入息水平</p>
                          <div className="form-item-value">
                            {getFieldDecorator('income_level', {
                              initialValue: userInfo.income_level,
                              rules: [],
                            })(
                              <RadioGroup disabled={!isCanEdit}>
                                <Radio value={1}>$10,000或以下</Radio>
                                <Radio value={2}>$10,001 - $30,000</Radio>
                                <Radio value={3}>$30,001 - $50,000</Radio>
                                <Radio value={4}>$50,001或以上</Radio>
                              </RadioGroup>
                            )}
                          </div>
                        </div>
                      </FormItem>
                    </Col>
                  </Row>
                </React.Fragment>
              ) : (
                <Alert
                  message="無權限查看個人檔案其他信息"
                  type="error"
                  showIcon
                />
              )}
            </div>
            <FormItem
              style={{
                textAlign: 'right',
                marginTop: 20,
                borderTop: '1px solid #e8e8e8',
              }}
            >
              <Button
                style={{ marginTop: 20, marginBottom: '10px' }}
                type="primary"
                disabled={!isCanEdit}
              >
                提交
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}
export default withRouter(
  connect(({ memberInfo, system }) => ({
    memberInfo: memberInfo.toJS(),
    system: system.toJS(),
  }))(Form.create()(UserRecord))
);
