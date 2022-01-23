import React from 'react';
import PropTypes from 'prop-types';
import _noop from 'lodash/noop';
import { Row, Col, Input } from 'antd';

export default class ColumnType extends React.PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    options: PropTypes.array,
    disabled: PropTypes.bool,
    maxLength: PropTypes.number
  }

  static defaultProps = {
    onChange: _noop,
    options: [],
    disabled: false
  }

  handleChange = async (item, e) => {
    if (this.props.onChange) {
      await this.props.onChange(item, e.target.value);
    }
  }

  render() {
    const { maxLength, disabled } = this.props;
    return (
      <React.Fragment>
        {
          this.props.options.map(item => {
            return (
              <Row type="flex" align="middle" style={{ marginTop: '10px' }} key={item.id + '-' + item.option_template_id}>
                <Col span={5}>選項：{item.origin_value}</Col>
                <Col span={19}>
                  <Row type="flex" align="middle">
                    <Col>自定義選項：</Col>
                    <Col>
                      <Input
                        style={{ minWidth: '400px' }}
                        onChange={this.handleChange.bind(this, item)}
                        value={item.alias_value}
                        disabled={disabled}
                        maxLength={maxLength}
                        placeholder={`請輸入自定義選項(不超過${maxLength}個字符)`}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            );
          })
        }
      </React.Fragment>
    );
  }
}
