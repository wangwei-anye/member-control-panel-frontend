import React from 'react';
import PropTypes from 'prop-types';
import _map from 'lodash/map';
import _find from 'lodash/find';
import _result from 'lodash/result';
import { getHumanDate } from 'utils/tools';
import './humandatelist.less';

export default class HumanDateList extends React.PureComponent {
  constructor(props) {
    super(props);
    const list = getHumanDate(props.list, props.format);
    const active = props.active || list[0].value;
    this.state = {
      list,
      active,
    };
  }
  static propTypes = {
    onChange: PropTypes.func,
    list: PropTypes.array.isRequired,
    active: PropTypes.string,
    format: PropTypes.string
  }
  static defaultProps = {
    onChange: () => {},
  }
  static getDerivedStateFromProps(props, state) {
    if (props.active !== undefined && props.active !== state.active) {
      return {
        active: props.active
      };
    }
    return null;
  }
  changeDate = (value) => {
    const range = _result(_find(this.state.list, { value }), 'range');
    if (this.props.active !== undefined) {
      this.props.onChange(range, value);
    } else {
      this.setState({
        active: value
      }, () => {
        this.props.onChange(range, value);
      });
    }
  }
  render() {
    return (
      <div className="human-date-list">
        {
          _map(this.state.list, (item) => {
            let cls = 'human-date-list__item';
            if (item.value === this.state.active) {
              cls = 'human-date-list__item human-date-list__item--active';
            }
            return (
              <div className={cls} key={item.value} onClick={() => this.changeDate(item.value)}>
                {item.name}
              </div>
            );
          })
        }
      </div>
    );
  }
}
