/**
 * 可折叠Card，基于antd Card
 * 用法及参数、配置与Card完全相同，可参看 https://ant.design/components/card/
 */
import React from 'react';
import { Card, Icon } from 'antd';

class FoldableCard extends React.PureComponent {
  state = {
    folded: false
  };

  // 折叠搜索栏
  handleFold = () => {
    const { folded } = this.state;
    this.setState({ folded: !folded });
  };

  render() {
    return (
      <Card
        {...this.props}
        bordered={false}
        extra={
          this.state.folded ? (
            <a onClick={this.handleFold}>
              展开<Icon type="down" />
            </a>
          ) : (
            <a onClick={this.handleFold}>
              收起<Icon type="up" />
            </a>
          )
        }
      >
        {!this.state.folded ? this.props.children : null}
      </Card>
    );
  }
}

export default FoldableCard;
