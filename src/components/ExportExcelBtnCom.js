import React from 'react';
import { Button, Tooltip } from 'antd';

export default class ExportExcelBtnCom extends React.Component {
  render() {
    const { name, ...restProps } = this.props;
    return (
      <Tooltip title="僅支持搜索條件後的數據導出">
        <Button icon="export" type="primary" {...restProps}>
          {name || '導出Excel'}
        </Button>
      </Tooltip>
    );
  }
}
