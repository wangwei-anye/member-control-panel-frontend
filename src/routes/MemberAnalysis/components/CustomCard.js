import React from 'react';
import PropTypes from 'prop-types';
import { Card, Spin } from 'antd';

export default class CustomCard extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    loading: PropTypes.bool
  }
  static defaultProps = {
    loading: true
  }
  render() {
    return (
      <Card
        bodyStyle={{ padding: '24px 24px 0' }}
        bordered={false}
        title={null}
      >
        <React.Fragment>
          <p className="common__chart__title">{this.props.title}</p>
          <Spin spinning={this.props.loading}>
            {this.props.children}
          </Spin>
        </React.Fragment>
      </Card>
    );
  }
}
