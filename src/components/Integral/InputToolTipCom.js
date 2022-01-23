import React from 'react';
import { Tooltip, InputNumber } from 'antd';

const INPUT_NUMBER_MAX = 1000000;
export default class InputToolTipCom extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false
    };
  }
  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  onChange = value => {
    const maxNum = this.props.maxNum || INPUT_NUMBER_MAX;
    const newMaxNum = maxNum
      ? parseFloat(maxNum) || INPUT_NUMBER_MAX
      : INPUT_NUMBER_MAX;

    if (value > maxNum) {
      this.showTip(`最大限額爲${newMaxNum.toLocaleString()}`);
    }
    if (/\D\./g.test(value)) {
      this.showTip('必须为数字');
    }

    if (!this.props.isDecimals) {
      if (/\./g.test(value)) {
        this.showTip('不能包含小数点');
      }
    }

    const { onChange } = this.props;
    if (onChange && typeof onChange === 'function') {
      onChange(value > maxNum ? maxNum : value);
    }
    this.hideTip();
  };

  hideTip = () => {
    this.timer = null;
    this.timer = setTimeout(() => {
      this.setState({
        isShow: false,
      });
    }, 3000);
  }

  showTip = title => {
    this.setState({
      isShow: true,
      title
    });
  }

  render() {
    const { maxNum, ...otherProps } = this.props;
    if (otherProps.onChange) {
      delete otherProps.onChange;
    }
    const { isShow, title } = this.state;
    return (
      <Tooltip
        title={title}
        visible={isShow}
      >
        <InputNumber onChange={this.onChange} {...otherProps} />
      </Tooltip>
    );
  }
}
