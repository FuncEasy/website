import React from 'react';
import { Icon, Steps, Popover } from 'antd';
import http from '../../service';
const { Step } = Steps;
class StepsStatus extends React.Component{
  constructor(props) {
    super(props);
    this.statusData = [
      {
        name: 'Basic',
        key: 'basic',
        status: 'wait',
      },
      {
        name: 'Script',
        key: 'uploaded',
        status: 'wait',
      },
      {
        name: 'Deploy',
        key: 'deployed',
        status: 'wait',
      }
    ];
    this.state = {
      podStatusList: [],
      statusData: this.statusData
    }
    this.timer = null;
  }

  componentDidMount() {
    for (let i = 0; i < this.statusData.length; i++) {
      if (this.statusData[i].key !== this.props.status) this.statusData[i].status = 'finish';
      if (this.statusData[i].key === this.props.status) {
        this.statusData[i].status = 'finish';
        if (i + 1 < this.statusData.length) {
          this.statusData[i+1].status = 'process';
          break;
        }
      }
    }
    if (this.props.status === 'redeploy') {
      this.statusData[2] = {
        name: 'Redeploy',
        key: 'redeploy',
        status: 'process',
        icon: <Icon type="exclamation-circle" style={{ color: "#fdd835" }} />
      }
    }
    this.setState({statusData: this.statusData});
    if (this.props.status === 'deployed' || this.props.status === 'redeploy') {
      this.getDeployStatus()
    }
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  checkStatus(podStatus) {
    if (podStatus.every(item => item.podPhase === "Running") && podStatus.length === this.props.size) {
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

  setTimer() {
    if (!this.timer) this.timer = setInterval(() => this.getDeployStatus(), 4000)
  }

  clearTimer() {
    clearInterval(this.timer);
    this.timer = null
  }

  getDeployStatus() {
    http.get(`/function/status/${this.props.id}`).then(r => {
      let status = this.checkStatus(r.data.podStatus);
      if (status === 'pending') {
        this.statusData[2].status = 'process';
        this.statusData[2].icon = <Icon type="loading" />;
        this.setTimer();
      } else if (status === 'success') {
        this.statusData[2].status = 'finish';
        this.statusData[2].icon = null;
        if (this.props.status === 'redeploy')
          this.statusData[2].icon = <Icon type="exclamation-circle" style={{ color: "#fdd835" }} />;
        this.clearTimer();
      } else if (status === 'failed') {
        this.statusData[2].status = 'error';
        this.statusData[2].icon = null;
        this.clearTimer();
      }
      this.setState({
        podStatusList: r.data.podStatus,
        statusData: this.statusData
      })
    }).catch(e => {})
  }

  render() {
    return (
      <Steps size="small">
        {
          this.statusData.map(item => {
            return <Step title={item.name} status={item.status} key={item.name} icon={item.icon}/>
          })
        }
      </Steps>
    )
  }
}

export default StepsStatus;
