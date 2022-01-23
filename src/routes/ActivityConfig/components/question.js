import React from 'react';
import { fromJS } from 'immutable';
import PropTypes from 'prop-types';
import {
  message,
  Card,
  Icon,
  Row,
  Col,
  Input,
  DatePicker,
  Select,
  Form,
  Modal
} from 'antd';
import _debouce from 'lodash/debounce';
import { styleMap } from '../constants';
import styles from './styles.less';
import OptionStyle from './option';

export function checkTextareaValue(text, col, row) {
  const wrapReg = /\r\n|[\r\n]/;
  const textList = text.trim().split(wrapReg);
  if (textList.length > row) {
    return false;
  }
  const res = textList.filter(t => {
    return t.length > col;
  });
  if (res.length > 0) {
    return false;
  }
  return true;
}

const { TextArea } = Input;

const DateType = () => (
  <Row type="flex" align="middle" style={{ marginTop: '20px' }}>
    <Col>選項：</Col>
    <Col style={{ marginLeft: '20px' }}>
      <DatePicker placeholder="請選擇日期" disabled />
    </Col>
  </Row>
);

const SelectType = ({ options = [] }) => {
  return (
    <Row type="flex" align="middle" style={{ marginTop: '20px' }}>
      <Col>選項：</Col>
      <Col style={{ marginLeft: '20px' }}>
        <Select
          style={{ width: '300px' }}
          placeholder="請選擇"
          value={options[0].option_template_id}
        >
          {options.map((item, index) => (
            <Select.Option
              key={item.option_template_id}
              value={item.option_template_id}
            >
              {item.origin_value}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

async function valueChange(props, changedValues) {
  const changeKeys = Object.keys(changedValues);
  if (props.onQuestionChange) {
    await props.onQuestionChange(props.info, changedValues);
  }
}

@Form.create({
  mapPropsToFields: props => {
    const aliasName = props.info.alias_value;
    return {
      alias_value: Form.createFormField({
        value: aliasName
      })
    };
  },
  onValuesChange: _debouce(valueChange, 200)
})
export default class Question extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string.isRequired,
    onDelete: PropTypes.func,
    info: PropTypes.object.isRequired,
    onQuestionChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    index: PropTypes.number,
    isLast: PropTypes.bool
  };
  static defaultProps = {
    onDelete: () => {},
    disabled: false
  };

  handleChangeOpt = (data, val) => {
    const changeOptId = data.id;
    const oldOpt = fromJS(this.props.info.option);
    const newOpt = oldOpt.map(item => {
      if (item.get('id') !== changeOptId) {
        return item;
      }
      const newItem = item.set('alias_value', val);
      return newItem;
    });
    this.props.onQuestionChange(this.props.info, {
      option: newOpt.toJS()
    });
  };

  submit = () => {
    return new Promise((resolve, reject) => {
      this.props.form.validateFields(async (err, values) => {
        const { alias_value: aliasValue } = values;
        if (err) {
          return resolve(false);
        }
        if (!checkTextareaValue(aliasValue, 16, 3)) {
          message.error('自定義題幹不符合要求');
          resolve(false);
          return;
        }
        return resolve(true);
      });
    });
  };

  renderType = () => {
    const { alias_style: aliasStyle, option } = this.props.info;
    let maxLength = 8;
    if (aliasStyle === 'MULTIPLE_SELECTION') {
      maxLength = 5;
    }
    switch (aliasStyle) {
      case 'SELECT':
        return <SelectType options={option} />;

      case 'DATE':
        return <DateType />;
      case 'RADIO_SINGLE':
      case 'RADIO_DOUBLE':
      case 'MULTIPLE_SELECTION':
      case 'LIMIT_MULTIPLE_SELECTION':
        return (
          <OptionStyle
            options={option}
            disabled={this.props.disabled}
            onChange={this.handleChangeOpt}
            maxLength={maxLength}
          />
        );
      default:
        return null;
    }
  };

  handleDel = () => {
    const { id } = this.props.info;
    Modal.confirm({
      icon: 'info-circle',
      title: '',
      content: '刪除操作不可恢復，你還要繼續嗎？',
      okText: '繼續',
      onOk: () => {
        this.props.onDelete(id);
      }
    });
  };

  moveQuestion(type, index) {
    // 下移
    if (type === 'down') {
      this.props.moveDown(index);
      // 上移
    } else {
      this.props.moveUp(index);
    }
  }

  renderCardExtra = () => {
    const { index, isLast, disabled } = this.props;
    if (disabled) {
      return null;
    }
    return (
      <React.Fragment>
        {index !== 0 ? (
          <span
            style={{ cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              console.log('up');
              this.moveQuestion('up', index);
            }}
          >
            <Icon type="up" style={{ marginRight: 10, padding: 5 }} />
          </span>
        ) : (
          ''
        )}
        {isLast ? (
          ''
        ) : (
          <span
            style={{ cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
              console.log('down');
              this.moveQuestion('down', index);
            }}
          >
            <Icon type="down" style={{ marginRight: 10, padding: 5 }} />
          </span>
        )}
        <Icon
          type="delete"
          style={{ color: '#f5222d' }}
          onClick={this.handleDel}
          className={styles.delete}
        />
      </React.Fragment>
    );
  };

  render() {
    const {
      id,
      origin_value: originVal,
      alias_style: aliasStyle
    } = this.props.info;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 }
      }
    };
    const { getFieldDecorator } = this.props.form;
    return (
      <Card
        className="question-card"
        style={{ marginBottom: '20px' }}
        title={this.props.title}
        extra={this.renderCardExtra()}
        bordered={false}
      >
        <Form>
          <Row type="flex" align="middle">
            <Col span={5}>
              題幹: {originVal}
              {/* <Form.Item label="" {...formItemLayout}>
              </Form.Item> */}
            </Col>
            <Col span={19}>
              <Row type="flex" align="top">
                <Form.Item label="自定義題幹" {...formItemLayout}>
                  {getFieldDecorator('alias_value', {
                    rules: [{ message: '請輸入自定義題幹別名' }]
                  })(
                    <TextArea
                      style={{ minWidth: '400px' }}
                      rows={4}
                      cols={16}
                      maxLength={50}
                      placeholder="請輸入自定義題幹別名(每行16個字符, 最多48個字符)"
                      disabled={this.props.disabled}
                    />
                  )}
                </Form.Item>
              </Row>
            </Col>
          </Row>
          <Row type="flex" align="middle">
            <Col span={5}>題型：{styleMap[aliasStyle]}</Col>
          </Row>
          {this.renderType()}
        </Form>
      </Card>
    );
  }
}
