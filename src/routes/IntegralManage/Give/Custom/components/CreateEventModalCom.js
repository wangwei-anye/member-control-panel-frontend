import React from 'react';
import { connect } from 'dva';
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  message,
  Tooltip,
  Button,
  Icon,
  Row,
  Col
} from 'antd';
import { fetchEventListRequest } from 'services/integralManage/event/event';
import * as _ from 'lodash';
import './department.less';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18, offset: 1 }
};
const formItemWithOutLabel = {
  wrapperCol: {
    span: 18,
    offset: 5
  }
};
const style = {
  width: '224px'
};

const initEventParams = [
  {
    name: '',
    type: '',
    value: []
  }
];

class CreateEventCom extends React.Component {
  report_channel_id = '';
  constructor(props) {
    super(props);
    this.state = {
      reportChannelDescList: [],
      event_desc: '',
      getEventDescFlag: false,
      event_params: [
        {
          name: '',
          type: '',
          value: []
        }
      ]
    };
  }
  async componentWillMount() {
    if (this.props.eventInfo && this.props.eventInfo.event_desc) {
      const { eventInfo } = this.props;
      // TODO 这里 把 event_desc 换成了 event_id, 这样能避免描述有相同的 可以根据 event_id来标识唯一，
      // 最后传回去 event_desc 在根据event_id 来获取相对应的描述
      this.setState({
        event_desc: eventInfo.event_id,
        event_params: eventInfo.event_params
      });
      this.report_channel_id = this.props.eventInfo.report_channel_id;
      await this.fetchEventDescByReportChange(
        this.props.eventInfo.report_channel_id
      );
    }
  }
  // 事件上报渠道 更改事件
  reportChannelChangeAction(value) {
    message.destroy();
    // console.log(value);
    if (this.report_channel_id !== value) {
      this.setState({
        event_desc: '',
        event_params: [
          {
            name: '',
            type: '',
            value: []
          }
        ]
      });
    }
    if (value) {
      this.fetchEventDescByReportChange(value);
    }
  }
  // 根据上报渠道去获取对应的事件描述
  async fetchEventDescByReportChange(id) {
    message.loading('獲取事件描述列表', 0);
    this.setState({
      reportChannelDescList: [], getEventDescFlag: true
    });
    // NOTE: 这里根据后端的要求 trigger_type 参数写死为 0
    const {
      data: { data, status }
    } = await fetchEventListRequest({ report_channel_id: id, limit: 50, trigger_type: 0 });
    if (status) {
      await this.setState({
        reportChannelDescList: data.list || [], getEventDescFlag: false
      });
    } else {
      message.error('獲取事件描述列表錯誤');
      await this.setState({
        reportChannelDescList: [], getEventDescFlag: false
      });
    }
    message.destroy();
  }
  // 事件描述更改事件
  eventDescChangeAction(value) {
    if (value) {
      this.setState({
        event_desc: value,
        event_params: [
          {
            name: '',
            type: '',
            value: []
          }
        ]
      });
    }
  }

  rangeChangeAction(value, type, idx) {
    const { event_params } = this.state;
    if (type === 'range1') {
      event_params[idx].value[0] = value;
    }
    if (type === 'range2') {
      event_params[idx].value[1] = value;
    }
    this.setState({
      event_params
    });
  }

  modalOkAction = () => {
    const {
      event_desc, reportChannelDescList, event_params
    } = this.state;
    const { eventInfo } = this.props;
    const { reportChannelList } = this.props.system;
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      if (!event_desc) {
        message.error('請選擇一個事件描述');
        return;
      }
      const obj = {};
      for (const item of event_params) {
        const { type, name, value } = item;
        if (!name || !name.trim()) {
          message.error('請輸入參數值！');
          return;
        }
        item.name = name.trim();
        if (obj[item.name]) {
          message.error(`參數名字 "${item.name}" 出現重復, 請檢查！`);
          return;
        }
        obj[item.name] = 1;
        if (!type) {
          message.error(`參數名 "${item.name}" 沒有選擇返回值類型...`);
          return;
        }
        if (type === 'sec') {
          const [v1, v2] = value;
          if (!(v1 && v2)) {
            message.error('請輸入區間值！');
            return;
          }
          if (v1 >= v2) {
            message.error('返回的區間值輸入有誤！');
            return;
          }
          item.value = [+v1, +v2];
        } else {
          if (!value[0]) {
            message.error('返回的絕對值輸入不能爲空！');
            return;
          }
          item.value = [value[0]];
        }
      }
      // 找到渠道号和渠道名称 根据渠道号过滤
      const getItemChannel = reportChannelList.filter(item => {
        return +item.id === +values.report_channel_id;
      });
      // 找到事件描述所对应的事件id 根据渠道号过滤
      const getItemEventByChannel = reportChannelDescList.filter(item => {
        return +item.id === +event_desc;
      });
      values.report_channel = getItemChannel[0].channel_name;
      values.event_id = event_desc;
      values.event_desc = getItemEventByChannel[0].event_desc;
      if (eventInfo && Object.keys(eventInfo).length) {
        values.id = eventInfo.id;
      }
      values.event_params = event_params;
      if (this.props.onOk) {
        this.props.onOk({
          ...values
        });
      }
    });
  }
  modalCancelAction = () => {
    message.destroy();
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  handleEventParamChange = (v, idx) => {
    const { event_params } = this.state;
    event_params[idx].type = v;
    this.setState({ event_params });
  }

  handleEventParamNameChange = (v, idx) => {
    const { event_params } = this.state;
    event_params[idx].name = v;
    this.setState({ event_params });
  }

  handleClickDeleteEventParamItem = (idx) => {
    const { event_params } = this.state;
    if (event_params.length <= 1) {
      message.error('事件參數必須保留1個');
      return;
    }
    event_params.splice(idx, 1);
    this.setState({ event_params });
  }

  renderEventParamsDom = () => {
    const { event_params } = this.state;
    return event_params.map((item, idx) => {
      return (
        <React.Fragment key={idx}>
          <FormItem {...formItemLayout} label={`事件參數${idx + 1}`}>
            <Input
              style={{ width: '92%' }}
              maxLength={100}
              value={item.name}
              disabled={this.props.isLook}
              placeholder="請輸入數字/漢字/json/key(100長度內)"
              onChange={(e) => {
                this.handleEventParamNameChange(e.target.value, idx);
              }}
            />
            {
              this.props.isLook ? '' :
              <span
                onClick={() => {
                  this.handleClickDeleteEventParamItem(idx);
                }}
                className="u-color-red"
                style={{ cursor: 'pointer', marginLeft: '10px' }}
              >
                删除
              </span>
            }
          </FormItem>
          <FormItem {...formItemLayout} label="返回值">
            <Row justify="start">
              <Col span={8}>
                <Select
                  style={{ width: '150px' }}
                  value={item.type}
                  disabled={this.props.isLook}
                  onChange={(v) => {
                    this.handleEventParamChange(v, idx);
                  }}
                >
                  <Option value="abs">絕對值</Option>
                  <Option value="sec">區間值</Option>
                </Select>
              </Col>
              <Col span={16}>
                {item.type === 'abs' ? (
                  <Input
                    style={{ width: '294px' }}
                    placeholder="輸入參數值（100長度內）"
                    maxLength={100}
                    disabled={this.props.isLook}
                    value={item.value[0]}
                    onChange={value => this.rangeChangeAction(value.target.value, 'range1', idx)}
                  />
                ) : (
                    // eslint-disable-next-line react/jsx-indent
                    <div>
                      <InputNumber
                        min={1}
                        step={1}
                        style={{ width: '130px' }}
                        onChange={value => this.rangeChangeAction(value, 'range1', idx)}
                        value={item.value[0]}
                        disabled={this.props.isLook}
                      />
                      <span
                        style={{
                          marginLeft: '10px',
                          marginRight: '10px',
                          display: 'inline-block'
                        }}
                      >
                        至
                      </span>
                      <InputNumber
                        step={1}
                        disabled={this.props.isLook}
                        onChange={value => this.rangeChangeAction(value, 'range2', idx)}
                        style={{ width: '129px' }}
                        value={item.value[1]}
                      />
                    </div>
                  )}
              </Col>
            </Row>
          </FormItem>
        </React.Fragment >
      );
    });
  }

  addEventParamItem = () => {
    const { event_params } = this.state;
    if (event_params.length >= 10) {
      message.error('最多添加10條事件參數');
      return;
    }
    const value = _.cloneDeep(initEventParams);
    event_params.push(...value);
    this.setState({ event_params });
  }

  render() {
    const {
      reportChannelDescList,
      event_desc,
      event_params
    } = this.state;
    const { eventInfo } = this.props;
    const { reportChannelList } = this.props.system;
    const { getFieldDecorator, getFieldValue } = this.props.form;
    return (
      <Modal
        width="720px"
        title={this.props.isAdd ? '選取事件' : '編輯事件'}
        visible
        onCancel={() => this.modalCancelAction()}
        okButtonProps={{
          loading: this.props.isLoading
        }}
        footer={
          this.props.isLook ? [
            <Button key="back" onClick={this.modalCancelAction} disabled={this.props.isLoading} >
              取消
            </Button>,
          ] : [
              // eslint-disable-next-line react/jsx-indent
              <Button key="back" onClick={this.modalCancelAction} disabled={this.props.isLoading} >
                取消
              </Button>,
              // eslint-disable-next-line react/jsx-indent
              <Button key="submit" disabled={this.props.isLoading} type="primary" loading={this.props.isLoading || this.state.getEventDescFlag} onClick={this.modalOkAction} >
                确定
              </Button >
            ]
        }
        destroyOnClose
        cancelButtonProps={{ disabled: this.props.isLoading }}
      >
        <Form className="m-addevent-form-wrap">
          <FormItem {...formItemLayout} label="事件上報渠道">
            {getFieldDecorator('report_channel_id', {
              initialValue: eventInfo.report_channel_id || '',
              rules: [{ required: true, message: '請選擇一個事件上報渠道' }]
            })(
              <Select
                style={style}
                disabled={this.props.isLook}
                onChange={value => this.reportChannelChangeAction(value)}
              >
                {reportChannelList.map(item => {
                  return (
                    <Option key={item.id} value={item.id}>
                      {item.channel_name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="事件描述">
            <Select
              style={style}
              disabled={this.props.isLook}
              value={event_desc}
              onChange={value => this.eventDescChangeAction(value)}
            >
              {reportChannelDescList.map(item => {
                return (
                  <Option key={item.id} value={item.id}>
                    <Tooltip placement="top" title={item.event_desc}>
                      {item.event_desc}
                    </Tooltip>
                  </Option>
                );
              })}
            </Select>
          </FormItem>
          {this.renderEventParamsDom()}
          {
            this.props.isLook || event_params.length >= 10 ? '' :
              // eslint-disable-next-line react/jsx-indent
              <Button type="dashed" onClick={this.addEventParamItem}>
                <Icon type="add" />
                增加事件参数
              </Button>
          }
        </Form>
      </Modal>
    );
  }
}
export default connect(({ system }) => ({
  system: system.toJS()
}))(Form.create()(CreateEventCom));
