import React from 'react';
import { Icon, Steps, Popover } from 'antd';
import http from '../../service';
const { Step } = Steps;
class PipelineStatus extends React.Component{
  constructor(props) {
    super(props);
    this.statusData = [
      {
        name: 'Basic',
        status: 'wait',
      },
      {
        name: 'Upload',
        status: 'wait',
      }
    ];

    if (this.props.status === 'basic') {
      this.statusData[0].status = 'finish';
    } else if (this.props.status === 'uploaded') {
      this.statusData[0].status = 'finish';
      this.statusData[1].status = 'finish';
    } else if (this.props.status === 'pipeline') {
      this.statusData[0].status = 'finish';
      this.statusData[1].status = 'finish';
      let pipelineList = JSON.parse(this.props.pipeline) || [];
      this.pipeline = null;
      pipelineList.forEach(item => {
        if (!this.pipeline) this.pipeline = item;
        else if (this.pipeline.time < item.time) this.pipeline = item;
      });
    }
    this.pipelineId = this.pipeline ? this.pipeline.id : null;
    this.state = {
      pipelineStages: this.pipeline ? this.pipeline.stages : null,
      status: this.props.status
    };
    console.log(this.state)
  }

  componentDidMount() {
    if (this.checkPipelineStatus(this.state.pipelineStages) === 'process') {
      this.interval = setInterval(() => this.getPipelineState(), 1000);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  stopPolling() {
    clearInterval(this.interval);
  }

  checkPipelineStatus(stages) {
    if (!stages) return null;
    let isPipelineComplete = stages.every(stage => stage.state.status === 'success');
    let isPipelineError = stages.some(stages => stages.state.status === 'fail');
    if (isPipelineError) return 'error';
    else if (isPipelineComplete) return 'finish';
    else return 'process'
  }

  getPipelineState() {
    http.get(`/function/pipeline/${this.pipelineId}`).then(r => {
      let stages = r.data.stages;
      let status = this.checkPipelineStatus(stages);
      if (status !== 'process') {
        this.stopPolling();
      }
      this.setState({pipelineStages: stages});
    }).catch(e => {})
  }

  render() {
    let popContent = (
      <Steps direction="vertical" size="small">
        {
          this.state.pipelineStages && this.state.pipelineStages.map(item => {
            switch (item.state.status) {
              case 'success':
                return <Step title={item.name} status="finish" key={item.name}/>;
              case 'fail':
                return <Step title={item.name} status="error" key={item.name}/>;
              case 'waiting':
                return <Step title={item.name} status="wait" key={item.name}/>;
              default:
                return <Step title={item.name} status="process" icon={<Icon type="loading" />} key={item.name}/>;
            }
          })
        }
      </Steps>
    );
    let pop = (
      <Popover
        content={popContent}
        trigger="click"
      >
        <span>Pipeline</span>
      </Popover>
    );
    let pipelineStatus = this.checkPipelineStatus(this.state.pipelineStages);
    console.log('pipeline status', pipelineStatus)
    return (
      <Steps size="small">
        {
          this.statusData.map(item => {
            return <Step title={item.name} status={item.status} key={item.name}/>
          })
        }
        <Step
          title={this.state.pipelineStages ? pop : 'Pipeline'}
          status={pipelineStatus ? pipelineStatus : 'wait'}
          icon={pipelineStatus === 'process' && <Icon type="loading" />}
        />
      </Steps>
    )
  }
}

export default PipelineStatus;
