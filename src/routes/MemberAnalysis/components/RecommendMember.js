import React from 'react';
import _get from 'lodash/get';
import _forEach from 'lodash/forEach';
import _reverse from 'lodash/reverse';
import { getReferral } from 'services/memberAnalysis';
import SummaryTable from './SummaryTable';

export default class RecommendMember extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true
    };
  }
  componentDidMount() {
    this.getData().then(res => {
      if (res.data && res.data.status) {
        const data = _get(res, 'data.data');
        this.setState({
          loading: false,
          data: this.mappingData(data),
        });
      }
    });
  }
  getData = () => {
    return getReferral();
  }
  mappingData = (data) => {
    let result = [];
    _forEach(data, (val, key) => {
      result.push({
        time: key,
        value: val
      });
    });
    result = _reverse(result);
    return result;
  }
  render() {
    return (
      <SummaryTable
        title="推薦會員情況"
        data={this.state.data}
        loading={this.state.loading}
      />
    );
  }
}
