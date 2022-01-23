/**
 * 权限树工具函数
 */
import React from 'react';
import Immutable from 'immutable';
import { Tree, Radio } from 'antd';
import { isEqual } from 'lodash';
import { addApplication } from 'services/integralManage/approve/approve';

const TreeNode = Tree.TreeNode;

// 创建树节点
export const createTreeNode = (
  data,
  keyPre = '',
  treeRadioChange,
  dataRangeKeys
) => {
  return Object.entries(data)
    .sort((a, b) => {
      return a[1].order - b[1].order;
    })
    .map(([key, value]) => {
      return (
        <TreeNode
          title={
            value.data_auth ? (
              <React.Fragment>
                <div style={{ width: 200, display: 'inline-block' }}>
                  {value.name}
                </div>
                <Radio.Group
                  style={{ marginLeft: 50 }}
                  value={
                    dataRangeKeys[`${keyPre}${key}`]
                      ? dataRangeKeys[`${keyPre}${key}`]
                      : 'next_department'
                  }
                  onChange={(e) => {
                    treeRadioChange(e, `${keyPre}${key}`);
                  }}
                >
                  <Radio value="company">全公司</Radio>
                  <Radio value="department">所在部門</Radio>
                  <Radio value="next_department">所在部門及下級部門</Radio>
                  <Radio value="self">僅本人</Radio>
                </Radio.Group>
              </React.Fragment>
            ) : (
              value.name
            )
          }
          key={
            value.data
              ? `${keyPre}${key}`
              : value.data_auth
              ? `${keyPre}${key}.lastAuth`
              : `${keyPre}${key}.last`
          }
        >
          {value.data
            ? createTreeNode(
                value.data,
                `${keyPre}${key}.`,
                treeRadioChange,
                dataRangeKeys
              )
            : null}
        </TreeNode>
      );
    });
};

/**
 * 将从树中取得的keys转换为json形式
 */
export const convertKeysToJson = (keys, dataRangeKeys) => {
  let ret = Immutable.fromJS({});
  keys.forEach((key) => {
    const keyPath = key.split('.');
    const lastKey = keyPath[keyPath.length - 1];
    if (lastKey === 'last' || lastKey === 'lastAuth') {
      keyPath.pop();
      const tempKeyStr = keyPath.join('.');
      let lastSecondKey = keyPath.pop();
      if (dataRangeKeys[tempKeyStr]) {
        lastSecondKey = lastSecondKey + ':' + dataRangeKeys[tempKeyStr];
      } else if (lastKey === 'lastAuth') {
        // 默认值
        lastSecondKey += ':next_department';
      }
      if (!Immutable.List.isList(ret.getIn(keyPath))) {
        ret = ret.setIn(keyPath, Immutable.fromJS([]));
      }
      ret = ret.updateIn(keyPath, (list) => list.push(lastSecondKey));
    } else {
      // const lastSecondKey = keyPath.pop();
      // if (Immutable.List.isList(ret.getIn(keyPath))) {
      //   ret = ret.updateIn(keyPath, (list) => {
      //     const tempObj = {};
      //     tempObj[lastSecondKey] = [];
      //     return list.set(list.size, Immutable.fromJS(tempObj));
      //   });
      // } else {
      //   keyPath.push(lastSecondKey);
      //   ret = ret.setIn(keyPath, Immutable.fromJS({}));
      // }
      ret = ret.setIn(keyPath, Immutable.fromJS({}));
    }
  });
  return ret.toJS();
};

/**
 * 将json转换为tree需要的keys
 */
export const convertJsonToKeys = (json, keyPre = '') => {
  let keys = [];
  if (Array.isArray(json)) {
    json.forEach((key) => {
      keys.push(`${keyPre}${key}`);
    });
  } else {
    Object.entries(json).forEach(([key, val]) => {
      const key2 = `${keyPre}${key}`;
      keys.push(key2);
      if (typeof val === 'object') {
        keys = keys.concat(convertJsonToKeys(val, `${key2}.`));
      }
    });
  }
  return keys;
};

/**
 * 生成treeKeys
 * 注：子节点未勾满的父节点应当去除
 * @param {json} rights  权限列表
 * @param {json} current 当前权限
 * @return {array}
 */
export const generateKeys = (rights, current, pre = '', dataRangeKeys) => {
  let keys = [];
  let isNeedPop = false;
  let isChildFull = true; // 子级是否已选满
  Object.entries(current).forEach(([key, child]) => {
    const right = rights[key];
    if (!child || !right || !right.data) return;
    const childKeys = Array.isArray(child) ? child : Object.keys(child);
    const key2 = `${pre}${key}`;
    if (
      isEqual(childKeys.sort(), Object.keys(right.data).sort()) ||
      childKeys.length === 0
    ) {
      isNeedPop = true;
      keys.push(key2);
    } else {
      isNeedPop = false;
      isChildFull = false;
    }
    // 处理child
    if (!Array.isArray(child)) {
      const deep = generateKeys(right.data, child, `${key2}.`, dataRangeKeys);
      if (!deep.isChildFull) {
        // 如果孙级未满，则弹出父级
        isChildFull = false;
        isNeedPop && keys.pop();
      }
      keys = keys.concat(deep.keys);
    } else {
      // 是数组，说明已到最底层
      keys = keys.concat(
        child.map((it) => {
          const tempArr = it.split(':');
          if (tempArr.length > 1) {
            dataRangeKeys[`${key2}.${tempArr[0]}`] = tempArr[1];
            it = tempArr[0] + '.lastAuth';
          } else {
            it = tempArr[0] + '.last';
          }
          return `${key2}.${it}`;
        })
      );
    }
  });
  return { keys, isChildFull };
};
