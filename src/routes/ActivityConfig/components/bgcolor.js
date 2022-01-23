import React from 'react';
import PropTypes from 'prop-types';
import { bgColorList } from '../constants';

export default class BgColor extends React.PureComponent {
  static propTypes = {
    disabled: PropTypes.bool
  }
  static defaultProps = {
    disabled: false
  }
  static getDerivedStateFromProps(nextProps) {
    if ('value' in nextProps) {
      return {
        active: nextProps.value || ''
      };
    }
    return null;
  }
  constructor(props) {
    super(props);
    this.state = {
      active: props.value || ''
    };
  }
  handleSelectBgColor = (color) => {
    if (this.props.disabled) {
      return;
    }
    if (!('value' in this.props)) {
      this.setState({ active: color });
    }
    this.triggerChange(color);
  }
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(changedValue);
    }
  }
  render() {
    return (
      <React.Fragment>
        {bgColorList.map((item, index) => {
          return (
            <span
              key={index}
              onClick={() => { this.handleSelectBgColor(item); }}
              className={[
                'bg-item',
                item === '#ffffff' ? 'bg-item-border' : '',
                this.state.active === item ? 's-active' : ''
              ].join(' ')}
              style={{ backgroundColor: item }}
            />
          );
        })}
      </React.Fragment>
    );
  }
}
