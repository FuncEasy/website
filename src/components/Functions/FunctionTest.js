import React from "react";
import {Button, Input, message, Radio, Spin, Icon, InputNumber} from "antd";
import AceEditor from "react-ace";
import CodePreview from "./CodePreview";
import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/theme-github";
import http from '../../service';
import {connect} from "react-redux";

class FunctionTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      method: 'post',
      getPayload: '{\n\t"params": {\n\t\t"param1": "data1",\n\t\t"param2": "data2"\n\t}\n}',
      postPayload: '{\n\t"field1": "data1",\n\t"field2": "data2"\n}',
      respond: '{\n\t//Respond here\n}',
      trigger: `call/${this.props.auth.data.username}/${this.props.nsName}/${this.props.funcName}/${this.props.version}`,
      loading: false,
      logs: '',
      log_loading: false,
      lines: 20
    }
  }

  componentDidMount() {
    this.getLogs()
  }

  getLogs() {
    this.setState({log_loading: true});
    http.get(`/function/logs/${this.props.id}`, {
      params: {
        lines: this.state.lines
      }
    }).then(r => {
      this.setState({logs: r.data.logs, log_loading: false});
      this.LogElement.scrollTop = this.LogElement.scrollHeight;
    }).catch(e => this.setState({log_loading: false}))
  }

  functionCall() {
    this.setState({loading: true});
    if (this.state.method === "get") {
      let data = {};
      try {
        data = JSON.parse(this.state.getPayload)
      } catch (e) {
        message.error(e.message)
      }
      http.get(`/function/${this.state.trigger}`, data).then(r => {
        let resData = r.data;
        try {
          resData = JSON.parse(resData)
        } catch (e) {}
        this.setState({
          respond: JSON.stringify(resData, null, 2),
          loading: false
        })
      }).catch(e => {
        this.setState({
          respond: e.response.data ? e.response.data.err || 'unknown error' : JSON.stringify(e.response) || 'unknown error',
          loading: false
        })
      })
    }
    if (this.state.method === "post") {
      let data = {};
      try {
        data = JSON.parse(this.state.postPayload)
      } catch (e) {
        message.error(e.message)
      }
      http.post(`/function/${this.state.trigger}`, data).then(r => {
        let resData = r.data;
        try {
          resData = JSON.parse(resData)
        } catch (e) {}
        this.setState({
          respond: JSON.stringify(resData, null, 2),
          loading: false
        })
      }).catch(e => {
        this.setState({
          respond: e.response.data ? e.response.data.err || 'unknown error' : JSON.stringify(e.response) || 'unknown error',
          loading: false
        })
      })
    }
  }

  render() {
    return (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h2>HTTP Trigger</h2>
          <Input value={this.state.trigger} disabled={true}/>
        </div>
        <div style={{ marginBottom: 20 }}>
          <Radio.Group onChange={e => this.setState({method: e.target.value})} value={this.state.method}>
            <Radio value="get">GET</Radio>
            <Radio value="post">POST</Radio>
          </Radio.Group>
          <Button type="primary" onClick={this.functionCall.bind(this)} loading={this.state.loading}>Send</Button>
          <div style={{overflow: 'hidden'}}>
            <div style={{ marginTop: 20, float: 'left', width: '40%' }}>
              <h3>Request Payload:</h3>
              <AceEditor
                style={{
                  width: '100%',
                  height: 300,
                }}
                onChange={
                  v => this.state.method === 'get'
                    ? this.setState({getPayload: v})
                    : this.setState({postPayload: v})
                }
                value={this.state.method === 'get' ? this.state.getPayload : this.state.postPayload}
                placeholder="Placeholder Text"
                mode="json"
                theme="github"
                name="payload-editor"
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                }}
              />
            </div>
            <div style={{ marginTop: 20, marginLeft: '45%'}}>
              <h3>Respond:</h3>
              <div style={{  height: 300, overflow: 'scroll' }}>
                <CodePreview code={this.state.respond} language="json"/>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 10 }}>
            <h2 style={{ fontSize: 20, paddingRight: 10}}>Logs:</h2>
            <span style={{ paddingRight: 5 }}>Lines:</span>
            <InputNumber
              onChange={v => this.setState({lines: v})}
              value={this.state.lines}
              style={{ marginRight:10 }}
            />
            <Button type="primary" onClick={this.getLogs.bind(this)} loading={this.state.log_loading}>Sync</Button>
          </div>
          <div ref={ref => this.LogElement = ref} style={{  maxHeight: 300, overflow: 'scroll' }}>
            <Spin spinning={this.state.log_loading} indicator={<Icon type="loading" />}>
              <CodePreview code={this.state.logs} language="prolog" dark/>
            </Spin>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(function (state) {
  return {
    auth: state.auth
  }
}, {})(FunctionTest);