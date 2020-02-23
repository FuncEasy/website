import React from "react";
import {message, Icon, Steps, Popover} from "antd";
import http from '../../service';
const { Step } = Steps;
class FunctionDeploy extends React.Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      hover: false,
      podStatusList: [],
      deploying: false,
    }
  }
  componentDidMount() {
    if (this.props.status === "deployed" || this.props.status === "redeploy") {
      this.getStatus()
    }
  }

  getStatus() {
    http.get(`/function/status/${this.props.id}`).then(r => {
      console.log(r.data);
      if (r.data.podStatus.every(item => item.podPhase === "Running") && r.data.podStatus.length === this.props.size) {
        this.setState({
          deploying: false,
        });
        if (this.timer) clearInterval(this.timer)
      }
      this.setState({podStatusList: r.data.podStatus})
    }).catch(e => {})
  }

  deploy() {
    http.get(`/function/deploy/${this.props.id}`).then(r => {
      message.info("start deploying...");
      this.setState({
        deploying: true,
      });
      this.timer = setInterval(() => this.getStatus(), 2000)
    })
  }

  deploySteps() {
    return this.state.podStatusList.map(item => (
      <Steps style={{ width: "70%" }}>
        {item.initContainerStatuses.map(container => {
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
            <div>
              {
                Object.keys(container.state[key]).map(subKey => (<div>{`${subKey}: ${container.state[key][subKey]}`}</div>))
              }
            </div>
          ));
          let titleComponent = (
            <Popover title={container.name} content={contentComponent} trigger="hover">
              <span>{container.name}</span>
            </Popover>
          );
          return (
            <Step title={titleComponent} status={status} icon={(status === "process" || status === "wait") && <Icon type="loading" />}/>
          )
        })}
        {
          item.containerStatuses.map(container => {
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
              <div>
                {
                  Object.keys(container.state[key]).map(subKey => (<div>{`${subKey}: ${container.state[key][subKey]}`}</div>))
                }
              </div>
            ));
            let titleComponent = (
              <Popover title={container.name} content={contentComponent} trigger="hover">
                <span>run</span>
              </Popover>
            );
            return (
              <Step title={titleComponent} status={status} icon={(status === "process" || status === "wait") && <Icon type="loading" />}/>
            )
          })
        }
      </Steps>
    ))
  }
  render() {
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
      color: '#52c41a'
    };
    let buttonHoverStyle = {
      ...commonStyle,
      border: '2px dashed',
      backgroundColor: '#52c41a',
      color: '#ebedf0',
      borderColor: '#52c41a'
    };
    return (
      <div>
        <div style={{float: 'left'}}>
          <div
            style={this.state.hover ? buttonHoverStyle : buttonDefaultStyle}
            onMouseMove={() => this.setState({hover: true})}
            onMouseLeave={() => this.setState({hover: false})}
            onClick={this.deploy.bind(this)}
          >
            <div>
              <div style={centerStyle}>
                {
                  this.state.deploying
                    ? <Icon type="loading" style={{fontSize: 50}} />
                    : <Icon type="play-circle" theme="twoTone" twoToneColor="#52c41a" style={{fontSize: 50}} />
                }
              </div>
              <span>开始部署</span>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 220, minHeight: 500 }}>
          <h3>Deploy</h3>
          {this.deploySteps()}
        </div>
      </div>
    )
  }
}

export default FunctionDeploy