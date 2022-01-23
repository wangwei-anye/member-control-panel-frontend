import React from 'react';
import PropTypes from 'prop-types';
import { InputNumber, Switch } from 'antd';
import { bgColorList } from '../constants';

export default class PrizeNum extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
  };
  static defaultProps = {
    disabled: false,
  };
  static getDerivedStateFromProps(nextProps) {
    if (nextProps.value !== undefined) {
      return {
        value: nextProps.value || '',
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      checked: !!props.value,
    };
    this.timer = null;
  }
  handleChange = (value) => {
    if (this.props.disabled) {
      return;
    }
    if (this.props.value !== undefined) {
      this.setState({ value: value || '' });
    }
    this.triggerChange(value);
  };
  handleBlur = () => {
    if (this.state.value === '' || this.state.value + '' === '0') {
      this.timer = setTimeout(() => {
        this.setState({
          checked: false,
        });
        this.triggerChange(0);
      }, 300);
    }
  };
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      const val = changedValue !== undefined ? changedValue : '';
      onChange(val);
    }
  };
  handleSwitchChange = (checked) => {
    if (this.props.disabled) {
      return;
    }
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.setState(
      {
        checked,
      },
      () => {
        if (this.state.checked) {
          this.inputRef.focus();
        } else {
          this.triggerChange(0);
        }
      }
    );
  };
  render() {
    return (
      <React.Fragment>
        <span>
          <InputNumber
            ref={(refNode) => (this.inputRef = refNode)}
            min={1}
            step={1}
            max={100000000}
            style={{ display: 'inline-block', width: '120px' }}
            value={this.state.checked ? this.state.value : ''}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            disabled={!this.state.checked || this.props.disabled}
          />
          <span style={{ display: 'inline-block', marginLeft: 10 }}>份</span>
        </span>
        <span style={{ display: 'inline-block', marginLeft: 30 }}>
          <span style={{ display: 'inline-block', marginRight: 10 }}>限制</span>
          <Switch
            checkedChildren="開"
            unCheckedChildren="關"
            checked={this.state.checked}
            onChange={this.handleSwitchChange}
          />
        </span>
      </React.Fragment>
    );
  }
}
