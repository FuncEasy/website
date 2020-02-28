import React from "react";
import {Button, Card} from "antd";
import TemplateList from "./TemplateList";
class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Button
          type="primary"
          onClick={() => this.props.history.push('/template/create')}
        >
          新建模版
        </Button>
        <div style={{ marginBottom: 20 }}/>
        <Card title="模版">
          <TemplateList/>
        </Card>
      </div>
    )
  }
}

export default Index