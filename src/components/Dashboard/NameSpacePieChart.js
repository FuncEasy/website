import React from "react";
import { Pie } from 'ant-design-pro/lib/Charts';
class NameSpacePieChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let data = nextProps.ns.map(item => ({
      x: item.name,
      y: item.Functions.length
    }));
    this.setState({data})
  }

  render() {
    return (
      <Pie
        animate={true}
        height={200}
        subTitle="NameSpaces"
        data={this.state.data}
      />
    )
  }
}

export default NameSpacePieChart