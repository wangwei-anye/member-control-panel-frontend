/**
 * 富文本组件
 * 基于quill.js封装
 *
 * @prop {function} onChange             可选，输入时返回富文本内容
 * @prop {string}   uploaderAdditionData 可选，上传文件时附加的参数。缺省值可在config/editor.config.js文件配置
 */
/* eslint-disable */
import React from 'react';
import ReactQuill from 'react-quill';
import Chance from 'chance';
import PropTypes from 'prop-types';
import 'react-quill/dist/quill.snow.css';
import config from 'config/editor.config';
import Toolbar from './Toolbar';
import Uploader from './Uploader';

import './style.css';

class Editor extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    uploaderAdditionData: PropTypes.object
  };

  state = {
    value: '',
    imageEditorVisible: false,
    selectionIndex: 0
  };

  componentWillMount() {
    const chance = new Chance();
    const _this = this;
    this.toolbarId = `toolbar-${chance.guid()}`;
    this.modules = {
      toolbar: {
        container: `#${this.toolbarId}`,
        handlers: {
          'cus-image': function() {
            const range = this.quill.getSelection();
            _this.quill = this.quill;
            _this.setState({
              imageEditorVisible: true,
              selectionIndex: (range && range.index) || 0
            });
          }
        }
      }
    };
    this.updateStateByProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.updateStateByProps(nextProps);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextState) !== JSON.stringify(this.state); // 仅在state有更新时才允许更新组件
  }

  updateStateByProps(props) {
    this.setState({
      value: props.value || ''
    });
  }

  handleChange = value => {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value);
    }
    this.setState({ value });
  };

  render() {
    const { imageEditorVisible, selectionIndex } = this.state;
    return (
      <div>
        <Toolbar id={this.toolbarId} />
        <ReactQuill
          value={this.state.value}
          onChange={this.handleChange}
          modules={this.modules}
          style={this.props.style}
        />
        {imageEditorVisible ? (
          <Uploader
            visible={true}
            onClose={() => this.setState({ imageEditorVisible: false })}
            quill={this.quill}
            selectionIndex={selectionIndex}
            uploaderAdditionData={this.props.uploaderAdditionData}
          />
        ) : null}
      </div>
    );
  }
}

export default Editor;
