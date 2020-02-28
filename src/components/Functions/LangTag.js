import React from "react";
import { Tag } from 'antd';
class LangTag extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    switch (this.props.runtime.name) {
      case 'nodeJS':
        return <Tag color="green">{`${this.props.runtime.name}:${this.props.runtime.version}`}</Tag>;
      case 'Go':
        return <Tag color="blue">{`${this.props.runtime.name}:${this.props.runtime.version}`}</Tag>;
      case 'Java':
        return <Tag color="red">{`${this.props.runtime.name}:${this.props.runtime.version}`}</Tag>;
      default:
        return
    }
  }
}
export default LangTag