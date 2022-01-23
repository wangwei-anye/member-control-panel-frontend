import React from 'react';
import PropTypes from 'prop-types';
import NavigationPrompt from 'react-router-navigation-prompt';
import { Modal, Row, Col, Button, Icon } from 'antd';

class PromptLeave extends React.Component {
  static propTypes = {
    when: PropTypes.bool,
    message: PropTypes.node,
    extraCheck: PropTypes.func,
  }

  static defaultProps = {
    extraCheck: (nextLocation) => true
  }

  handleWhen = (crntLocation, nextLocation) => {
    return this.props.when && !this.props.extraCheck(nextLocation);
  }

  render() {
    const { message, when } = this.props;
    return (
      <NavigationPrompt when={this.handleWhen}>
        {
          ({ onConfirm, onCancel, isActive }) => (
            <Modal
              visible={!!isActive}
              footer={null}
              closable={false}
            >
              <React.Fragment>
                <Row style={{ paddingTop: '40px', paddingBottom: '40px' }}>
                  <Col>
                    <Icon type="exclamation-circle" style={{ fontSize: '20px', marginRight: '10px', color: '#faad14' }} />
                    {message}
                  </Col>
                </Row>
                <Row>
                  <Col offset={3}>
                    <Button onClick={onCancel} style={{ marginRight: '10px' }}>取消</Button>
                    <Button type="primary" onClick={onConfirm}>確認</Button>
                  </Col>
                </Row>
              </React.Fragment>
            </Modal>
          )
        }
      </NavigationPrompt>
    );
  }
}

export default PromptLeave;
