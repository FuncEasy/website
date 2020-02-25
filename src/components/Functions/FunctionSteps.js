import React from 'react';
import {
  Steps,
  Spin,
  Select,
  Divider,
  Row,
  Col,
  Input,
  Icon,
  InputNumber,
  Switch,
  Button,
  message, Alert,
} from "antd";
import http from '../../service';
import FunctionScript from "./FunctionScript";
import FunctionDeploy from "./FunctionDeploy";
import { withRouter } from 'react-router-dom'
const { Step } = Steps;
const { Option } = Select;

const originSteps = {
  basic: {
    key: 'basic',
    title: 'Basic',
    index: 1,
    description: '基本信息',
    status: 'process',
  },
  uploaded: {
    key: 'uploaded',
    title: 'Function',
    index: 2,
    description: '函数配置',
    status: 'wait',
  },
  deployed: {
    key: 'deployed',
    title: 'Deploy',
    index: 3,
    description: '函数部署',
    status: 'wait',
  },
};
class FunctionSteps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      nameSpaceList: [],
      namespace_id: undefined,
      ns_loading: false,
      runtime_id: undefined,
      runtimeList: [],
      runtime_loading: false,
      runtimeObj: {},
      dataSourceList: [],
      dataSource_id: undefined,
      data_source_loading: false,
      name: '',
      moduleName: '',
      funcName: '',
      handler: '',
      desc: '',
      timeout: '',
      size: 1,
      deps: '',
      _private: '',
      version: '',
      type: this.props.type,
      steps: originSteps,
      currentStep: 'basic',
      currentIndex: 1,
      completeStep: '',
      selectedStep: '',
      needRedeploy: false
    };
  }

  componentDidMount() {
    this.setState({
      ns_loading: true,
      runtime_loading: true,
    });
    http.get('/runtime').then(r => {
      this.setState({runtimeList: r.data, runtime_loading: false})
    }).catch(e => this.setState({runtime_loading: false}));
    http.get('/namespace').then(r => {
      this.setState({nameSpaceList: r.data, ns_loading: false})
    }).catch(e => this.setState({ns_loading: false}));
    http.get('/dataSource').then(r => {
      this.setState({dataSourceList: r.data, data_source_loading: false})
    }).catch(e => this.setState({data_source_loading: false}));
    if (this.props.type === 'edit') {
      this.functionGet()
    }
  }
  functionGet() {
    let id = this.props.match.params.id;
    http.get(`/function/${id}`).then(r => {
      let completeStep = r.data.status;
      if (completeStep === 'redeploy') {
        this.setState({needRedeploy: true});
        completeStep = 'uploaded';
        originSteps['deployed'] = {
          key: 'deployed',
          title: 'Redeploy',
          index: 3,
          description: '重新部署',
          status: 'process',
          icon: <Icon type="exclamation-circle" style={{ color: "#fdd835", fontSize: 30 }} />
        }
      } else {
        this.setState({needRedeploy: false});
      }
      let completeIndex = originSteps[completeStep].index;
      let currentStep = this.state.selectedStep ? this.state.selectedStep : 'deployed';
      let currentIndex = this.state.selectedStep ? originSteps[this.state.selectedStep].index : 3;
      Object.keys(originSteps).forEach(key => {
        if (originSteps[key].index <= completeIndex) originSteps[key].status = "finish";
        if (originSteps[key].index === completeIndex + 1) {
          originSteps[key].status = "process";
          if (!this.state.selectedStep) {
            currentStep = key;
            currentIndex = originSteps[key].index;
          }
        }
        if (originSteps[key].index > completeIndex + 1) originSteps[key].status = "wait";
      });
      let handler = r.data.handler;
      let regx = /^([-\w]+).([-\w]+)$/;
      let res = handler.match(regx);
      this.setState({
        id: r.data.id,
        namespace_id: r.data.NameSpaceId,
        runtime_id: r.data.RuntimeId,
        runtimeObj: r.data.Runtime,
        name: r.data.name,
        status: r.data.status,
        moduleName: res[1],
        funcName: res[2],
        handler: r.data.handler,
        desc: r.data.desc,
        deps: r.data.deps,
        version: r.data.version,
        dataSource_id: r.data.DataSourceId,
        timeout: +r.data.timeout,
        size: +r.data.size,
        _private: !r.data.private,
        steps: originSteps,
        currentStep: currentStep,
        currentIndex: currentIndex,
        completeStep: completeStep,
      })
    })
  }

  functionCreate() {
    http.post('function/create', {
      name: this.state.name,
      desc: this.state.desc,
      version: this.state.version,
      runtime_id: this.state.runtime_id,
      ns_id: this.state.namespace_id,
      handler: `${this.state.moduleName}.${this.state.funcName}`,
      data_source_id: this.state.dataSource_id,
      timeout: this.state.timeout + '',
      size: +this.state.size,
    }).then(r => {
      this.props.history.push(`/functions/${r.data.id}`)
    }).catch()
  }

  functionUpdate() {
    let id = this.props.match.params.id;
    http.put(`function/${id}`, {
      name: this.state.name,
      desc: this.state.desc,
      version: this.state.version,
      runtime_id: this.state.runtime_id,
      ns_id: this.state.namespace_id,
      handler: `${this.state.moduleName}.${this.state.funcName}`,
      data_source_id: this.state.dataSource_id,
      timeout: this.state.timeout + '',
      size: +this.state.size,
    }).then(r => {
      message.success("saved success!");
      this.refresh()
    }).catch()
  }

  stepClick(key, index) {
    let targetStepIndex = this.state.steps[key].index;
    let completeStepIndex = this.state.completeStep ? this.state.steps[this.state.completeStep].index : 0;
    if (targetStepIndex <= completeStepIndex + 1) {
      this.setState({
        currentStep: key,
        currentIndex: index + 1,
        selectedStep: key,
      })
    }
  }

  RuntimeList() {
    let centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };
    let commonStyle = {
      width: 100,
      height: 100,
      cursor: this.props.type === 'create' ? 'pointer' : 'not-allowed',
      borderRadius: 6,
      ...centerStyle,
    };
    let activeStyle = {
      color: '#1890ff',
      background: '#fff',
      borderColor: '#1890ff',
      border: '1px solid',
      ...commonStyle,
    };
    let defaultStyle = {
      background: '#fff',
      border: '1px solid #d9d9d9',
      ...commonStyle,
    };
    let containerStyle = {
      minHeight: 200,
      maxHeight: 500,
      overflow: 'scroll',
      background: '#fff',
      borderRadius: 6,
    };
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: 20, textAlign: "center" }}>Function Runtime</div>
        <Divider dashed={true} style={{ margin: '2px 0px' }}/>
        <Spin
          indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />}
          spinning={this.state.runtime_loading}
        >
          <Row gutter={16}>
            {
              this.state.runtimeList.map((item, index) => (
                <Col key={index} span={8} style={{ marginTop: 10, ...centerStyle }}>
                  <div
                    align="center"
                    style={this.state.runtime_id === item.id ? activeStyle : defaultStyle}
                    onClick={this.props.type === "create" ? () => this.setState({runtime_id: item.id}) : null}
                  >
                    <div>
                      <div style={{ fontSize: 24 }}>{item.lang}</div>
                      <div>{`version: ${item.version}`}</div>
                    </div>
                  </div>
                </Col>
              ))
            }
          </Row>
        </Spin>
      </div>
    )
  }

  refresh() {
    console.log("refresh");
    this.functionGet()
  }

  setDeployStatus(status, setLoading) {
    console.log(status);
    let steps = this.state.steps;
    steps.deployed.status = status;
    if (setLoading) {
      steps.deployed.icon = <Icon type="loading" />
    } else {
      steps.deployed.icon = null
    }
    this.setState({steps})
  }

  BasicRender() {
    return (
      <Row gutter={32}>
        <Col span={10}>
          {this.RuntimeList()}
        </Col>
        <Col span={14}>
          <div style={{ marginBottom: 20 }}>
            <div>Function Name</div>
            <Input placeholder="Input Function Name" value={this.state.name} onChange={e => this.setState({name: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function NameSpace</div>
            <div>
              <Select
                placeholder="Select a NameSpace"
                value={this.state.namespace_id}
                style={{ width: '100%' }}
                loading={this.state.ns_loading}
                onChange={value => this.setState({namespace_id: value})}>
                {
                  this.state.nameSpaceList.map((item, index) => (
                    <Option key={index} value={item.id}>{item.name}</Option>
                  ))
                }
              </Select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function Version</div>
            <Input placeholder="Input Function Version"  value={this.state.version} onChange={e => this.setState({version: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function Description</div>
            <Input placeholder="Input Function Description"  value={this.state.desc} onChange={e => this.setState({desc: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function Handler</div>
            <Input style={{width: 200}} placeholder="Input Function Filename" value={this.state.moduleName} onChange={e => this.setState({moduleName: e.target.value})}/>
            <span style={{ padding: '0px 10px' }}>.</span>
            <Input style={{width: 200}} placeholder="Input Export Function Name" value={this.state.funcName} onChange={e => this.setState({funcName: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function DataSource</div>
            <div>
              <Select
                placeholder="Select a DataSource"
                value={this.state.dataSource_id}
                style={{ width: '100%' }}
                loading={this.state.data_source_loading}
                onChange={value => this.setState({dataSource_id: value})}>
                {
                  this.state.dataSourceList.map((item, index) => (
                    <Option key={index} value={item.id}>{item.name}</Option>
                  ))
                }
              </Select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function Timeout</div>
            <InputNumber style={{width: 200}} placeholder="Input Function Timeout" defaultValue={2000} value={this.state.timeout} onChange={v => this.setState({timeout: v})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function Size</div>
            <InputNumber
              disabled={true}
              style={{width: 200}}
              defaultValue={1}
              value={this.state.size} onChange={v => this.setState({size: v})}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ paddingRight: 10 }}>Function Private</span>
            <Switch value={this.state._private} onChange={v => this.setState({_private: v})} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <Button
              type="primary"
              onClick={this.props.type === 'create'
                ? this.functionCreate.bind(this)
                : this.functionUpdate.bind(this)}
            >
              {this.props.type === 'create' ? 'Next' : 'Save'}
            </Button>
          </div>
        </Col>
      </Row>
    )
  }

  FunctionRender() {
    return (
      <FunctionScript
        id={this.state.id}
        status={this.state.status}
        runtime={this.state.runtimeObj}
        handler={this.state.handler}
        moduleName={this.state.moduleName}
        refresh={this.refresh.bind(this)}
        deps={this.state.deps}
      />
    )
  }

  DeployRender() {
    return (
      <FunctionDeploy
        id={this.state.id}
        status={this.state.status}
        size={this.state.size}
        setDeployStatus={this.setDeployStatus.bind(this)}
        refresh={this.refresh.bind(this)}
      />
    )
  }

  renderContent() {
    switch (this.state.currentStep) {
      case 'basic':
        return this.BasicRender();
      case 'uploaded':
        return this.FunctionRender();
      case 'deployed':
        return this.DeployRender();
      default:
        return;
    }
  }

  render() {
    const { steps } = this.state;
    let contentStyle = {
      marginTop: 16,
      border: '1px dashed #e9e9e9',
      borderRadius: 6,
      backgroundColor: '#fafafa',
      padding: 10,
    };
    return (
      <div style={{ backgroundColor: '#fff', padding: 5 }}>
        <Steps
          type="navigation"
          current={this.state.currentIndex - 1}
        >
          {Object.keys(steps).map((key, index) => (
            <Step
              {...steps[key]}
              onClick={this.stepClick.bind(this, key, index)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Steps>
        {
          this.state.needRedeploy && (
            <Alert
              message="Function Changed! You need redeploy to update"
              type="warning"
              showIcon
            />
          )
        }
        <div style={contentStyle}>
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

export default function (type) {
  class wrapped extends React.Component {
    render() {
      return <FunctionSteps {...this.props} type={type} />;
    }
  }
  return withRouter(wrapped)
};