import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Icon, Tooltip, Typography } from 'antd';
import { getLen } from 'utils/tools';

import './stringtip.less';

export default class StringTip extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    limit: PropTypes.number
  }
  static defaultProps = {
    limit: 0
  }
  render() {
    let str = this.props.text;
    if (this.props.limit && getLen(str) > this.props.limit) {
      str = str.slice(0, 16) + '......';
    }
    return (
      <div className="c-string-tip__text">
        <Tooltip placement="topLeft" title={this.props.text}>
          <Icon type="question-circle" style={{ fontSize: '12px', marginRight: '4px' }} />
        </Tooltip>
        {str}
      </div>
    );
  }
}
