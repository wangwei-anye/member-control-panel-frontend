import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import uuid from 'uuid';
import { Button, Modal, Form, Select, Spin } from 'antd';
import styles from './styles.less';
import Question from './question';
import StemModal from './stemmodal';

const Option = Select.Option;

@connect(
  ({ system, activityConfig }) => ({
    questions: activityConfig.get('questions').toJS(),
    templateId: activityConfig.getIn(['detail', 'id'])
  }),
  null,
  null,
  { withRef: true }
)
export default class AnswerInfo extends React.Component {
  static propTypes = {
    editable: PropTypes.bool
  };
  static defaultProps = {
    editable: false
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false
    };
    this.question_answer_type = 0;
  }
  async componentDidMount() {
    const { isAdd, templateId: id } = this.props;
    if (isAdd) {
      // 修改模式
      await this.props.dispatch({
        type: 'activityConfig/getStemList'
      });
      await this.props.dispatch({
        type: 'activityConfig/fetchActivityQuestion',
        id
      });
    } else {
      await this.props.dispatch({
        type: 'activityConfig/getStemList'
      });
    }
  }
  handleOpen = type => {
    this.question_answer_type = type;
    this.setState({
      visible: true
    });
  };

  handleOk = async ({ stemId, styleStr, cb }) => {
    this.setState({
      loading: true
    });
    const options = await this.props.dispatch({
      type: 'activityConfig/getOptionList',
      id: stemId
    });
    const { stem } = this.props.questions;
    const originStem = stem.find(item => item.id === stemId);
    const stemName = originStem ? originStem.value : '';
    const q = {
      id: 'uuidq' + uuid.v4(),
      question_template_id: stemId, // 题干id
      alias_value: '', // 题目名称(题干别名)
      alias_style: styleStr, // 答题选项类型,SELECT 下拉选择,DATE 日期选择,RADIO_SINGLE单选单栏,RADIO_DOUBLE 单选双栏
      origin_value: stemName, // 题干名称
      question_answer_type: this.question_answer_type,
      option: options.map(item => ({
        id: 'uuido' + uuid.v4(),
        origin_value: item.value, // 题干选项名称
        option_template_id: item.id, // 题干选项id
        alias_value: '' // 题目选项名称
      }))
    };
    this.props.dispatch({
      type: 'activityConfig/addQuestion',
      payload: q
    });
    this.setState(
      {
        loading: false,
        visible: false
      },
      () => {
        cb();
      }
    );
  };

  handleCancel = cb => {
    this.setState(
      {
        visible: false
      },
      () => {
        cb();
      }
    );
  };

  submit = async () => {
    const { questions } = this.props;
    try {
      const allR = await Promise.all(
        questions.list.map(async item => {
          const result = await this[`q${item.id}`].submit();
          return result;
        })
      );
      if (allR.indexOf(false) !== -1) {
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  handleDel = id => {
    this.props.dispatch({
      type: 'activityConfig/deleteQuestion',
      id
    });
  };

  handleChangeQuestion = (info, changed) => {
    if (!this.props.editable) {
      return;
    }
    this.props.dispatch({
      type: 'activityConfig/changeQuestion',
      id: info.id,
      changed
    });
  };

  handleMoveUp = index => {
    this.move('up', index);
  };

  swapQuestion = (i, j, list) => {
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  };

  handleMoveDown = index => {
    this.move('down', index);
  };

  move = (type, index) => {
    const { list } = this.props.questions;
    if (type === 'down') {
      this.swapQuestion(index, index + 1, list);
    } else {
      this.swapQuestion(index, index - 1, list);
    }
    setTimeout(() => {
      this.props.dispatch({
        type: 'activityConfig/moveQuestionList',
        list
      });
    }, 0);
  };

  render() {
    const { questions } = this.props;
    return (
      <div className={styles.wrap}>
        <Spin spinning={this.state.loading}>
          <div className={styles.title}>正式題</div>
          <div className={styles.questions}>
            {questions.list.map((item, index) => {
              if (item.question_answer_type === 0) {
                return (
                  <Question
                    disabled={!this.props.editable}
                    wrappedComponentRef={qf => (this[`q${item.id}`] = qf)}
                    onDelete={this.handleDel}
                    onQuestionChange={this.handleChangeQuestion}
                    info={item}
                    key={item.id}
                    index={index}
                    isLast={index === questions.list.length - 1}
                    title={`問題${index + 1}`}
                    moveUp={this.handleMoveUp}
                    moveDown={this.handleMoveDown}
                  />
                );
              }
            })}
            {this.props.editable ? (
              <Button
                onClick={() => {
                  this.handleOpen(0);
                }}
                type="dashed"
                icon="plus"
                style={{ width: '100%' }}
              >
                添加題目
              </Button>
            ) : null}
          </div>
          <div className={styles.title}>備選題</div>
          <div className={styles.questions}>
            {questions.list.map((item, index) => {
              if (item.question_answer_type === 1) {
                return (
                  <Question
                    disabled={!this.props.editable}
                    wrappedComponentRef={qf => (this[`q${item.id}`] = qf)}
                    onDelete={this.handleDel}
                    onQuestionChange={this.handleChangeQuestion}
                    info={item}
                    key={item.id}
                    index={index}
                    isLast={index === questions.list.length - 1}
                    title={`問題${index + 1}`}
                    moveUp={this.handleMoveUp}
                    moveDown={this.handleMoveDown}
                  />
                );
              }
            })}
            {this.props.editable ? (
              <Button
                onClick={() => {
                  this.handleOpen(1);
                }}
                icon="plus"
                style={{ width: '100%' }}
              >
                添加題目
              </Button>
            ) : null}
          </div>
        </Spin>
        <StemModal
          list={questions.stem}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        />
      </div>
    );
  }
}
