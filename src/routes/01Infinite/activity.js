import React from "react";
import { Button } from "antd";
import { EXTERNAL_ACTIVITY_LINK } from "constants";

class ActivePage extends React.Component {
  handleClick = (s) => {
    window.open(EXTERNAL_ACTIVITY_LINK);
  };

  render() {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <Button
          type='prim 
          ary'
          onClick={this.handleClick}
          size='large'
          icon='link'
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          外鏈至01活動
        </Button>
      </div>
    );
  }
}

export default ActivePage;
