import React from 'react';
import { Card, Icon, Button } from 'antd';

const AppPage = props => (
  <div
    style={{
      height: '100%',
      backgroundColor: '#f0f4f7',
      paddingTop: '5%'
    }}
  >
    <Card
      bordered={false}
      title={
        <span>
          <Icon type="frown" /> 404 Not Found
        </span>
      }
      style={{ width: '50%', margin: '0 auto' }}
    >
      Sorry, 页面没找到！
      <p>
        <Button
          type="primary"
          icon="rollback"
          style={{ marginTop: 10 }}
          size="small"
          onClick={() => {
            props.history.goBack();
          }}
        >
          返回
        </Button>
      </p>
    </Card>
  </div>
);

export default AppPage;
