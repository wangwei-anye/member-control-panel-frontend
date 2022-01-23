/* eslint-disable */
import React from 'react';
import { Modal, Button, Form, Tree, message } from 'antd';
import { cos } from 'locutus/php/math';

const { TreeNode } = Tree;
class DepartmentMove extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      selectedKeys: [],
    };
  }

  formtaData = (list) => {
    if (Array.isArray(list)) {
      list.map((item, index) => {
        if (item.children && item.children.length === 0) {
          delete item.children;
        } else if (item.children && item.children.length > 0) {
          this.formtaData(item.children);
        }
        return item;
      });
    }
  };

  componentDidMount() {
    const newList = this.props.list.slice(0);
    this.formtaData(newList);
    this.setState({
      data: newList,
    });
  }

  onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys });
  };

  swapNodeHandle = (type) => {
    const { data, selectedKeys } = this.state;
    if (selectedKeys.length > 0) {
      const keyArr = selectedKeys[0].split('-');
      let i = 0;
      let tempObj = data;
      let parentNode = null;
      while (i < keyArr.length) {
        parentNode = tempObj;
        if (tempObj[keyArr[i]].children) {
          tempObj = tempObj[keyArr[i]].children;
        } else {
          tempObj = tempObj[keyArr[i]];
        }
        i += 1;
      }
      if (parentNode.length <= 1) {
        message.error('僅可在同級部門內上下移動');
      }
      const key = parseInt(keyArr[keyArr.length - 1]);
      if (type === 'up' && key > 0) {
        this.swapNode(parentNode, key, type);
      }
      if (type === 'down' && key < parentNode.length - 1) {
        this.swapNode(parentNode, key, type);
      }
      this.setState({
        data,
      });
    }
  };

  swapNode = (parentNode, index, type) => {
    const { selectedKeys } = this.state;
    const tempNode = parentNode[index];
    parentNode.splice(index, 1);
    const keyArr = selectedKeys[0].split('-');
    if (type === 'up') {
      const newKey = parseInt(keyArr[keyArr.length - 1]) - 1;
      keyArr[keyArr.length - 1] = newKey + '';
      parentNode.splice(index - 1, 0, tempNode);
    } else {
      const newKey = parseInt(keyArr[keyArr.length - 1]) + 1;
      keyArr[keyArr.length - 1] = newKey + '';
      parentNode.splice(index + 1, 0, tempNode);
    }
    this.setState({
      selectedKeys: [keyArr.join('-')],
    });
    this.props.onMove(tempNode.id + ',' + parentNode[index].id);
  };

  treeNodeRender = (node, index) => {
    if (Array.isArray(node)) {
      {
        return node.map((item, subIndex) => {
          return this.treeNodeRender(
            item,
            index === '' ? subIndex : index + '-' + subIndex
          );
        });
      }
    } else {
      if (node.children) {
        return (
          <TreeNode title={node.name} key={index}>
            {this.treeNodeRender(node.children, index)}
          </TreeNode>
        );
      } else {
        return <TreeNode title={node.name} key={index} />;
      }
    }
  };

  render() {
    const { list } = this.props;
    const { data } = this.state;
    const treeRender = this.treeNodeRender(data, '');
    return (
      <Modal
        onOk={this.props.onOk}
        onCancel={this.props.onCancel}
        visible
        title="移動（僅可在同級部門內上下移動）"
      >
        <div style={{ overflow: 'hidden' }}>
          <Button
            style={{ float: 'right', marginLeft: 10 }}
            onClick={() => {
              this.swapNodeHandle('down');
            }}
          >
            下移
          </Button>
          <Button
            style={{ float: 'right' }}
            onClick={() => {
              this.swapNodeHandle('up');
            }}
          >
            上移
          </Button>
        </div>
        <Tree
          defaultExpandAll
          onSelect={this.onSelect}
          selectedKeys={this.state.selectedKeys}
        >
          {treeRender}
        </Tree>
      </Modal>
    );
  }
}
export default Form.create()(DepartmentMove);
