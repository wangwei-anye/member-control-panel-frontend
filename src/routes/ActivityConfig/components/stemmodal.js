import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import { Modal, Form, Select } from 'antd';
import { styleMap } from '../constants';

const Option = Select.Option;
const formItemLayout = {
  labelcol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrappercol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};

@Form.create()
export default class StemModal extends React.Component {
  static propTypes = {
    list: PropTypes.array,
    visible: PropTypes.bool.isRequired,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
  }
  static defaultProps = {
    list: []
  }
  constructor(props) {
    super(props);
    this.state = {
      stem: undefined,
      style: undefined,
      styleLoading: false,
      styleList: [],
    };
  }

  handleSelectChange = async (id) => {
    await this.setState({ styleLoading: true });
    this.props.form.resetFields(['style']);
    const target = this.props.list.find((item) => item.id === id);
    const styleList = target ? target.alias_style : [];
    this.setState({
      style: undefined,
      styleList,
      styleLoading: false
    });
  }

  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { stem: stemId, style: styleStr } = values;
        this.props.onOk({ stemId, styleStr, cb: this.reset });
      }
    });
  }

  handleCancel = () => {
    this.props.onCancel(this.reset);
  }

  reset = () => {
    this.props.form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="創建題型"
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <Form>
          <Form.Item label="題幹查找" {...formItemLayout}>
            {getFieldDecorator('stem', {
              initialValue: this.state.stem,
              rules: [{ required: true, message: '請選擇題幹' }],
            })(
              <Select
                placeholder="請選擇題幹"
                onChange={this.handleSelectChange}
              >
                {
                  this.props.list.map((item) => {
                    return (
                      <Option
                        value={item.id}
                        key={item.id}
                      >
                        {item.value}({item.option_total}選項)
                      </Option>
                    );
                  })
                }
              </Select>
            )}
          </Form.Item>
          <Form.Item label="題型樣式" {...formItemLayout}>
            {getFieldDecorator('style', {
              initialValue: this.state.style,
              rules: [{ required: true, message: '請選擇題型樣式' }],
            })(
              <Select placeholder="請選擇題型樣式" loading={this.state.styleLoading}>
                {
                  this.state.styleList.map(item => (
                    <Option value={item} key={item}>{styleMap[item]}</Option>
                  ))
                }
              </Select>
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
