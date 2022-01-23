import React from 'react';
import { TreeSelect } from 'antd';
import { isEqual } from 'lodash';

const TreeNode = TreeSelect.TreeNode;
export default class PartmentTreeSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.firstFlag = true;
    this.firstExistFlag = true;
  }

  componentDidMount() {
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateStateByProps(nextProps);
  }

  updateStateByProps(newProps) {
    const newState = { ...newProps };
    const { value } = this.state;
    const newValue = newState.value || '';
    this.setState({
      value: newValue,
    });
    if (this.props.onChange && typeof this.props.onChange === 'function') {
      if (!isEqual(value, newValue) && this.firstFlag) {
        this.firstFlag = false;
        this.firstExistFlag = false;
        this.existCheck(newValue);
        if (this.firstExistFlag) {
          this.props.onChange(newValue);
        } else {
          this.props.onChange('');
        }
      }
    }
  }

  existCheck = (val) => {
    const { partmentList } = this.props;
    this.checkHandle(partmentList, val);
  };
  checkHandle = (arr, val, flag) => {
    for (let i = 0; i < arr.length; i += 1) {
      if (arr[i].id + '' === val + '') {
        this.firstExistFlag = true;
      }
      if (arr[i].child) {
        this.checkHandle(arr[i].child, val);
      }
    }
  };

  onChange = (value) => {
    this.setState({
      value,
    });
    if (this.props.onChange && typeof this.props.onChange === 'function') {
      this.props.onChange(value);
    }
  };

  createTreeNode(partmentList) {
    const self = this;
    return partmentList.map((item) => {
      return (
        <TreeNode title={item.name} key={`${item.id}`} value={`${item.id}`}>
          {item.child && item.child.length
            ? self.createTreeNode(item.child)
            : null}
        </TreeNode>
      );
    });
  }
  render() {
    const { partmentList, disabled } = this.props;
    return (
      <TreeSelect
        disabled={disabled}
        value={this.state.value}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        style={this.props.style ? this.props.style : null}
        placeholder="請選擇"
        treeDefaultExpandAll
        onChange={this.onChange}
        getPopupContainer={(triggerNode) => triggerNode.parentNode}
      >
        {/* <TreeNode value="" title="全部" key="" /> */}
        {this.createTreeNode(partmentList)}
      </TreeSelect>
    );
  }
}
