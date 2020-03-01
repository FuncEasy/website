import React from "react";
import RuntimeList from "./RuntimeList"
import {Button} from "antd";
class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Button type="primary" onClick={() => this.props.history.push('/runtime/create')}>New Runtime</Button>
        <div style={{ marginBottom: 20 }}/>
        <RuntimeList/>
      </div>
    )
  }
}

export default Index