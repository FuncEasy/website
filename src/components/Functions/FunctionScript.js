import React from "react";
import { Tabs, Button } from "antd";
import FunctionEditor from "./FunctionEditor";
const { TabPane } = Tabs;
class FunctionScript extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'upload',
      hover: false,
      contentType: '',
      script: '',
      loading: false,
      filename: '',
    }
  }



  render() {
    return (
      <div>
        <Tabs defaultActiveKey="1">
          <TabPane tab="代码配置" key="1">
            <FunctionEditor
              editor="script"
              id={this.props.id}
              status={this.props.status}
              runtime={this.props.runtime}
              moduleName={this.props.moduleName}
              handler={this.props.handler}
              refresh={this.props.refresh}
            />
          </TabPane>
          <TabPane tab="依赖配置" key="2">
            <FunctionEditor
              editor="deps"
              deps={this.props.deps}
              id={this.props.id}
              status={this.props.status}
              runtime={this.props.runtime}
              handler={this.props.handler}
              moduleName={this.props.moduleName}
              refresh={this.props.refresh}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default FunctionScript