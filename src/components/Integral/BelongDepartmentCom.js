import React from 'react';
import { Select } from 'antd';
import { withRouter } from 'react-router';
import { connect } from 'dva';
import { isEqual } from 'lodash';

const Option = Select.Option;
class BelongDepartment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      department: {
        part1: '',
        part2: ''
      },
      part2List: [],
      departList: [],
      disabled: false
    };
    this.lastDepartmentValue = {};
  }
  async componentDidMountNotUse() {
    const departList = this.props.system.partmentList;
    let firstList = departList[0];
    let department = Object.assign({}, this.state.department, {
      part1: firstList.id,
      part2: firstList.child[0].id
    });
    if (
      this.props.defaultValue &&
      Object.keys(this.props.defaultValue).length
    ) {
      const propsPartmentInfo = this.props.defaultValue;
      department = propsPartmentInfo;
      for (let i = 0; i < departList.length; i += 1) {
        if (+departList[i].id === +propsPartmentInfo.part1) {
          firstList = departList[i];
          break;
        }
      }
    }
    await this.setState({
      departList,
      part2List: firstList.child,
      department
    });
    if (this.props.onChange) {
      this.props.onChange(this.state.department);
    }
  }

  componentWillReceivePropsNotUse(nextProps) {
    const nextPropsPartmentList = nextProps.system.partmentList;
    const stateDepartList = this.state.departList;
    if (
      nextPropsPartmentList.length &&
      nextPropsPartmentList.length !== stateDepartList.length
    ) {
      this.setState({
        departList: nextPropsPartmentList
      });
    }
  }

  componentDidMount() {
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateStateByProps(nextProps);
  }

  componentWillUnmount() {
    this.lastDepartmentValue = null;
  }

  async updateStateByProps(props) {
    const { department } = this.state;
    const newProps = { ...props };
    const newState = {
      department: this.getDefaultPartmentInfo(props).department,
      departList: newProps.system.partmentList,
      part2List: this.getDefaultPartmentInfo(props).part2List,
      disabled: newProps.disabled
    };
    await this.setState({
      ...newState
    });
    if (this.props.onChange && typeof this.props.onChange === 'function') {
      if (
        !isEqual(department, newState.department) &&
        !isEqual(newState.department, this.lastDepartmentValue)
      ) {
        this.lastDepartmentValue = newState.department;
        this.props.onChange(newState.department);
      }
    }
  }

  getDefaultPartmentInfo(newProps) {
    const partmentList = newProps.system.partmentList;
    const defaultPartInfo = newProps.defaultValue;
    const stateDepartment = this.state.department;
    const statePart2List = this.state.part2List;
    let part2List = [];
    let part1 = '';
    let part2 = '';
    // 如果都为空，则 return 空
    if (!partmentList || !partmentList.length || !defaultPartInfo) {
      return { part2List, department: { part1, part2 } };
    }
    // 如果 state 中有值就 return state中的值
    if (statePart2List.length && stateDepartment.part1) {
      return {
        part2List: [...statePart2List],
        department: { ...stateDepartment }
      };
    }
    // 如果有 传入 默认值，则便利
    if (Object.keys(defaultPartInfo).length && defaultPartInfo.part2) {
      part1 = defaultPartInfo.part1;
      part2 = defaultPartInfo.part2;
      for (let i = 0; i < partmentList.length; i += 1) {
        const current = partmentList[i];
        if (+current.id === +part1) {
          part2List = current.child;
          break;
        }
      }
    } else {
      // 没有默认值，就默认取所有的第一个
      part1 = partmentList[0].id;
      part2List = partmentList[0].child;
      part2 = part2List[0].id;
    }

    return { part2List, department: { part1, part2 } };
  }

  async selectAction(value, type) {
    if (type === 'part1') {
      const departmentList = this.state.departList;
      const part1 = value;
      let currentItemList = [];
      for (let i = 0; i < departmentList.length; i += 1) {
        const item = departmentList[i];
        if (+item.id === +part1) {
          currentItemList = item.child;
          break;
        }
      }
      const department = Object.assign({}, this.state.department, {
        part2: currentItemList[0].id,
        part1: value
      });
      await this.setState({
        part2List: currentItemList,
        department
      });
    } else {
      const department = Object.assign({}, this.state.department, {
        part2: value
      });
      await this.setState({
        department
      });
    }
    if (this.props.onChange) {
      this.props.onChange(this.state.department);
    }
  }
  renderOptions(lists) {
    if (!(lists && lists.length)) {
      return null;
    }
    return lists.map(item => (
      <Option key={item.id} value={item.id}>
        {item.name}
      </Option>
    ));
  }
  render() {
    const { department, departList, part2List } = this.state;
    const { disabled } = this.props;
    const cssStyle = Object.assign(
      {},
      { width: '170px', marginRight: '10px' },
      this.props.style
    );
    return (
      <div className="m-department-wrap">
        <span>
          <Select
            disabled={disabled}
            value={department.part1}
            style={cssStyle}
            onChange={value => this.selectAction(value, 'part1')}
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            {this.renderOptions(departList)}
          </Select>
        </span>
        <span>
          <Select
            disabled={disabled}
            value={department.part2}
            style={Object.assign({}, cssStyle, { marginRight: 0 })}
            onChange={value => this.selectAction(value, 'part2')}
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            {this.renderOptions(part2List)}
          </Select>
        </span>
      </div>
    );
  }
}
export default withRouter(
  connect(({ system }) => ({
    system: system.toJS()
  }))(BelongDepartment)
);
