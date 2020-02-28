import React from 'react';
import {Button} from "antd";
import { withRouter } from 'react-router-dom'
import CreateNamespace from "./CreateNamespace";
import FunctionsList from "./FunctionsList";
class Index extends React.Component{
  render() {
    return (
      <div>
        <CreateNamespace/>
        <Button type="primary" onClick={() => this.props.history.push('/functions/create')}>新建云函数</Button>
        <div style={{ marginBottom: 20 }}/>
        <FunctionsList/>
      </div>
    )
  }
}

export default withRouter(Index);
