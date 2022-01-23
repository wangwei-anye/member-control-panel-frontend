import React from 'react';
import { connect } from 'dva';

class AppPage extends React.Component {
  componentWillMount() {
    this.props.dispatch({ type: 'auth/logout' });
    this.props.history.replace('/login');
  }

  render() {
    return null;
  }
}

export default connect(({ auth, system }) => ({
  auth: auth.toJS(),
  system: system.toJS()
}))(AppPage);
