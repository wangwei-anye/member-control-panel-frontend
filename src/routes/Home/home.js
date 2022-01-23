import React from 'react';
import { Card, Icon } from 'antd';

const AppPage = () => (
  <div style={{ margin: '24px', backgroundColor: '#fff' }}>
    <Card
      bordered={false}
      title={
        <span>
          <Icon type="desktop" /> 看板
        </span>
      }
    />
  </div>
);
export default AppPage;
