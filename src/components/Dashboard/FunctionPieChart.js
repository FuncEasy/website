import React from "react";
import { Pie } from 'ant-design-pro/lib/Charts';
import http from "../../service";
class FunctionPieChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.chartData(nextProps.functions).then().catch()
  }

  async chartData(functions) {
    let creatingCount = 0;
    let runningCount = 0;
    let failedCount = 0;
    let pendingCount = 0;
    let unknownCount = 0;
    for (let i = 0; i < functions.length; i++) {
      if (functions[i].status === 'basic' || functions[i].status === 'uploaded') creatingCount++;
      else {
        let status = await this.getDeployStatus(functions[i].id, functions[i]);
        if (status === 'pending') pendingCount++;
        else if (status === 'success') runningCount++;
        else if (status === 'failed') failedCount++;
        else unknownCount++;
      }
    }
    let data = [{
      x: 'Creating',
      y: creatingCount,
    },{
      x: 'Pending',
      y: pendingCount,
    },{
      x: 'Running',
      y: runningCount
    },{
      x: 'Unknown',
      y: unknownCount
    },{
      x: "Failed",
      y: failedCount,
    }];
    this.setState({data})
  }

  async getDeployStatus(id, functionObj) {
    let data = await http.get(`/function/status/${id}`);
    return this.checkStatus(data.data.podStatus, functionObj);
  }

  checkStatus(podStatus, functionObj) {
    if (podStatus.every(item => item.podPhase === "Running") && podStatus.length === functionObj.size) {
      return "success"
    }
    if (podStatus.some(item => item.podPhase === "Pending")) {
      let pendingStatus = [];
      let isFailed = false;
      podStatus.forEach(item => {
        if (item.podPhase === "Pending") pendingStatus.push(item)
      });
      pendingStatus.forEach(item => {
        let containers = [];
        containers.push(...item.initContainerStatuses, ...item.containerStatuses);
        isFailed = containers.some(item =>
          !item.ready && item.state.terminated && item.state.terminated.exitCode !== 0)
      });
      if (isFailed) return "failed";
      else return "pending";
    }
  }

  render() {
    return (
      <Pie
        animate={true}
        hasLegend
        height={200}
        subTitle="Functions Status"
        data={this.state.data}
      />
    )
  }
}

export default FunctionPieChart