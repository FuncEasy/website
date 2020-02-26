import React from "react";
import DataSourceList from "./DataSourceList";
import {Button} from "antd";
class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Button type="primary" onClick={() => window.location.href = '/data-source/create'}>新建数据源</Button>
        <div style={{ marginBottom: 20 }}/>
        <DataSourceList/>
      </div>
    )
  }
}

export default Index