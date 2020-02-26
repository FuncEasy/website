import React, { useState } from "react";
import {message, Icon, Steps, Popover, Tag} from "antd";
import http from '../../service';
const { Step } = Steps;
class FunctionDeploy extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      podStatusList: [],
      deploying: false,
      deploySuccess: false,
      deployFailed: false,
      redeploying: false,
      needDeploy: this.props.status === "uploaded",
      needRedeploy: this.props.status === "redeploy",
      needForceDeploy: false,
      lastState: 'deploying',
      retrying: false,
    };
  }
  componentDidMount() {
    if (this.props.status === "deployed" || this.props.status === "redeploy") {
      this.getStatus("first-check")
    }
  }

  static getDerivedStateFromProps(nextProps, preState) {
    return {
      needDeploy: nextProps.status === "uploaded",
      needRedeploy: nextProps.status === "redeploy",
    }
  }

  clearTimer() {
    clearInterval(this.timer);
    this.timer = null;
  }

  setTimer(from) {
    setTimeout(() => {
      this.timer = setInterval(() => this.getStatus(from), 2000);
    }, 2000)
  }

  getStatus(from) {
    http.get(`/function/status/${this.props.id}`).then(r => {
      let status = this.checkStatus(r.data.podStatus);
      if (from === "first-check") {
        if (status === "pending") {
          this.props.setDeployStatus("process", true);
          this.props.setTestStatus("wait");
          if (!this.timer) this.setTimer("first-check");
          this.setState({
            deploySuccess: false,
            deploying: this.state.lastState === "deploying",
            deployFailed: false,
            retrying: this.state.lastState === "failed"
          });
        }
        if (status === "success") {
          if (this.timer) this.clearTimer();
          if (!this.state.needRedeploy) this.props.setDeployStatus("finish");
          this.props.setTestStatus("process");
          this.setState({
            deploySuccess: true,
            deploying: false,
            deployFailed: false,
            retrying: false,
            needForceDeploy: true,
            lastState: 'success',
          });
        }
        if (status === "failed") {
          this.props.setDeployStatus("error");
          this.props.setTestStatus("wait");
          this.setState({
            deploySuccess: false,
            deploying: false,
            deployFailed: true,
            needForceDeploy: true,
            lastState: 'failed',
          });
        }
      } else {
        if (status === "pending") {
          this.props.setDeployStatus("process", true);
          this.props.setTestStatus("wait");
          this.setState({
            deploySuccess: false,
            deploying: this.state.lastState === "deploying",
            deployFailed: false,
            retrying: this.state.lastState === "failed"
          });
        }
        if (status === "success") {
          if (this.timer) this.clearTimer();
          this.props.setDeployStatus("finish");
          this.props.setTestStatus("process");
          this.setState({
            deploySuccess: true,
            deploying: false,
            retrying: false,
            deployFailed: false,
            needForceDeploy: true,
            lastState: 'success',
          });
        }
        if (status === "failed") {
          this.props.setDeployStatus("error");
          this.props.setTestStatus("wait");
          this.setState({
            deploySuccess: false,
            deploying: false,
            deployFailed: true,
            needForceDeploy: true,
            lastState: 'failed',
          });
        }
      }
      this.setState({podStatusList: r.data.podStatus})
    }).catch(e => {})
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

  deploy(force) {
    let params = null;
    if (force) {
      this.setState({
        needForceDeploy: false,
      });
      params = {
        force: true
      }
    }
    http.get(`/function/deploy/${this.props.id}`, {params}).then(r => {
      message.info("start deploying...");
      this.props.refresh();
      this.setState({
        deploying: true,
        retrying: false,
        lastState: 'deploying',
      });
      this.clearTimer();
      this.setTimer("deploy")
    })
  }

  redeploy() {
    http.get(`/function/redeploy/${this.props.id}`).then(r => {
      message.info("start redeploying...");
      this.props.refresh();
      this.setState({
        deploying: true,
        needForceDeploy: false,
        retrying: false,
        lastState: 'deploying',
      });
      this.clearTimer();
      this.setTimer("redeploy")
    })
  }

  deleteInstance() {
    message.info("delete instance...");
    http.delete(`/function/instance/${this.props.id}`).then(r => {
      message.info("delete instance success");
      this.clearTimer();
      this.props.refresh();
      this.props.setDeployStatus("process", false);
      this.props.setTestStatus("wait");
      this.setState({
        retrying: false,
        needForceDeploy: false,
        deploying: false,
        podStatusList: [],
      })
    }).catch()
  }

  podTag(status) {
    switch (status) {
      case "Pending":
        return <Tag color="geekblue">Pending</Tag>;
      case "Running":
        return <Tag color="green">Running</Tag>;
      case "Succeeded":
        return <Tag color="green">Succeeded</Tag>;
      case "Failed":
        return <Tag color="red">Failed</Tag>;
      case "Unknown":
        return <Tag color="oragne">Failed</Tag>;
      default:
        return
    }
  }

  deploySteps() {
    let containerStyle = {
      padding: '10px 5px',
      marginBottom: 20,
      borderRadius: 6,
      border: '2px solid',
      borderColor: '#ebedf0',
    };
    return this.state.podStatusList.map((item, index) => (
      <div key={index} style={containerStyle}>
        <p style={{ fontSize: 20 }}>
          <span>{this.podTag(item.podPhase)}</span>
          <span>{`Pod: ${item.podName}`}</span>
        </p>
        <Steps style={{ width: "70%" }}>
          {item.initContainerStatuses.map((container, index) => {
            let status;
            if (container.ready) status="finish";
            else if (container.state.waiting) status="wait";
            else if (container.state.running) status="process";
            else if (container.state.terminated) {
              if (container.state.terminated.exitCode === 0) status="finish";
              else status = "error"
            } else {
              status = "error"
            }
            let contentComponent = Object.keys(container.state).map((key, index) => (
              <div key={"tip-content-" + index}>
                {
                  Object.keys(container.state[key]).map(subKey => (<div key={"tips-"+index}>{`${subKey}: ${container.state[key][subKey]}`}</div>))
                }
              </div>
            ));
            let titleComponent = (
              <Popover title={container.name} content={contentComponent} trigger="hover">
                <span>{container.name}</span>
              </Popover>
            );
            return (
              <Step key={index} title={titleComponent} status={status} icon={(status === "process" || status === "wait") && <Icon type="loading" />}/>
            )
          })}
          {
            item.containerStatuses.map((container, index) => {
              let status;
              if (container.ready) status="finish";
              else if (container.state.waiting) status="wait";
              else if (container.state.running) status="process";
              else if (container.state.terminated) {
                if (container.state.terminated.exitCode === 0) status="finish";
                else status = "error"
              } else {
                status = "error"
              }
              let contentComponent = Object.keys(container.state).map(key => (
                <div key={key}>
                  {
                    Object.keys(container.state[key]).map(subKey => (<div key={subKey}>{`${subKey}: ${container.state[key][subKey]}`}</div>))
                  }
                </div>
              ));
              let titleComponent = (
                <Popover title={container.name} content={contentComponent} trigger="hover">
                  <span>run</span>
                </Popover>
              );
              return (
                <Step key={index} title={titleComponent} status={status} icon={(status === "process" || status === "wait") && <Icon type="loading" />}/>
              )
            })
          }
        </Steps>
      </div>
    ))
  }

  DeployButton(props) {
    const {color, icon, click, loading, text} = props;
    let centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    };
    let commonStyle = {
      width: 150,
      height: 150,
      cursor: 'pointer',
      borderRadius: 10,
      ...centerStyle,
    };
    let buttonDefaultStyle = {
      ...commonStyle,
      border: '2px dashed',
      borderColor: '#ebedf0',
      color: color
    };
    let buttonHoverStyle = {
      ...commonStyle,
      border: '2px dashed',
      backgroundColor: color,
      color: '#ebedf0',
      borderColor: color
    };
    const [hover, setHover] = useState(false);
    function handleHover(isHover) {
      return setHover(isHover)
    }
    return (
      <div
        style={hover ? buttonHoverStyle : buttonDefaultStyle}
        onMouseMove={handleHover.bind(this, true)}
        onMouseLeave={handleHover.bind(this, false)}
        onClick={loading ? null : click}
      >
        <div>
          <div style={centerStyle}>
            {
              loading ? <Icon type="loading" style={{fontSize: 40}} /> : icon
            }
          </div>
          <span>{text}</span>
        </div>
      </div>
    )
  }

  DeployStatus() {
    if (this.state.deploySuccess) {
      return <Tag color="green">Succeed</Tag>
    }
    if (this.state.deployFailed) {
      return <Tag color="red">Failed</Tag>
    }
    if (this.state.podStatusList.length > this.props.size) {
      return <Tag color="blue">Rolling...</Tag>
    }
    return <Tag color="cyan">Unknown</Tag>
  }
  render() {
    return (
      <div>
        <div style={{float: 'left'}}>
          {
            this.state.needDeploy && (
              <this.DeployButton
                color="#52c41a"
                icon={<Icon type="play-circle" style={{fontSize: 45}} theme="twoTone" twoToneColor="#52c41a" />}
                text="开始部署"
                click={this.deploy.bind(this, false)}
              />
            )
          }
          {
            this.state.deploying && (
              <this.DeployButton
                color="#52c41a"
                loading={this.state.deploying}
                text="正在部署"
              />
            )
          }
          {
            this.state.retrying && (
              <this.DeployButton
                color="#ff9800"
                loading={this.state.retrying}
                text="正在重试"
              />
            )
          }
          {
            this.state.needRedeploy && (
              <this.DeployButton
                color="#fdd835"
                icon={<Icon type="reload" style={{fontSize: 45}}/>}
                text="重新部署"
                click={this.redeploy.bind(this)}
              />
            )
          }
          {
            this.state.needForceDeploy && !this.state.needRedeploy && (
              <this.DeployButton
                color="#ff5722"
                icon={<Icon type="reload" style={{fontSize: 45}}/>}
                text="强制重新部署"
                click={this.deploy.bind(this, true)}
              />
            )
          }
          {
            (!this.state.needDeploy || this.state.needRedeploy) && (
              <this.DeployButton
                color="#ff5722"
                icon={<Icon type="close-circle" style={{fontSize: 45}}/>}
                text="删除实例"
                click={this.deleteInstance.bind(this)}
              />
            )
          }
        </div>
        <div style={{ marginLeft: 220, minHeight: 500 }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{fontSize: 24, paddingRight: 10}}>Deploy Status</span>
            <Tag color="magenta">{`Replicas: ${this.state.podStatusList.length}/${this.props.size}`}</Tag>
            {this.DeployStatus()}
          </div>
          {this.deploySteps()}
        </div>
      </div>
    )
  }
}

export default FunctionDeploy