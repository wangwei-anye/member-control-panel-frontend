import React from 'react';
import LoadingCom from 'components/LoadingCom';

class ActivePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }
  handleIframeLoad = () => {
    this.setState({
      isLoading: false
    });
  };
  render() {
    const iframeUrl =
      process.env.environment === 'production'
        ? 'https://remote-config-admin.hk01.com/sections/3/items/published'
        : 'https://remote-config-admin.hktester.com';
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <iframe
          onLoad={this.handleIframeLoad}
          title="精選活動"
          src={iframeUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
        {this.state.isLoading ? (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)'
            }}
          >
            <LoadingCom />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ActivePage;
