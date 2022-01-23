// tab路由
import React from 'react';
import { withRouter } from 'react-router';
import { connect } from 'dva';

const defaultList = [
  {
    name: '會員積分賬戶',
    url: '',
    key: 'member',
  },
  {
    name: '運營積分賬戶',
    url: '',
    key: 'operation',
  },
  {
    name: '商家積分賬戶',
    url: '',
    key: 'merchant',
  },
];
class TabRouter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentItem: props.tabList.length > 0 && props.tabList[0].key,
    };
  }
  tabClickAction(item) {
    if (item && item.url) {
      const { system } = this.props;
      const query = system.query;
      let url = item.url;
      if (query.id) {
        url += `?id=${query.id}`;
      }
      this.props.history.push(url);
    }
  }
  render() {
    const lists = this.props.tabList;
    const currentItem = this.props.defaultKey || this.state.currentItem;
    return (
      <div className="m-tabrouter-wrap">
        {lists.map((item, index) => {
          return (
            <div
              className={[
                'tab-list-item',
                currentItem === item.key && 'active',
              ].join(' ')}
              key={index}
              onClick={() => this.tabClickAction(item)}
            >
              <p className="tab-item-title">{item.name}</p>
            </div>
          );
        })}
      </div>
    );
  }
}
export default withRouter(
  connect(({ system }) => ({
    system: system.toJS(),
  }))(TabRouter)
);
