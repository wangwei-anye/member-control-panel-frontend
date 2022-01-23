import React from 'react';
import { getMerge } from 'services/memberAnalysis';
import RecommendMember from './RecommendMember';
import SummaryTable from './SummaryTable';

export default class MergeMember extends RecommendMember {
  getData = () => {
    return getMerge();
  }
  render() {
    return (
      <SummaryTable
        title="合併會員情況"
        data={this.state.data}
        loading={this.state.loading}
      />
    );
  }
}
