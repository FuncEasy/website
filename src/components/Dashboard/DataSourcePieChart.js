import React from "react";
import { Pie } from 'ant-design-pro/lib/Charts';
import {Empty} from "antd";
class DataSourcePieChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let data = nextProps.ds.map(item => ({
      x: item.name,
      y: item.Functions.length
    }));
    this.setState({data})
  }

  render() {
    return (
      this.props.ds.length > 0
        ? <Pie
          animate={true}
          height={200}
          subTitle="Data Source"
          data={this.state.data}
        />
        : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    )
  }
}

export default DataSourcePieChart