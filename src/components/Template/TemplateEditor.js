import React from "react";
import {withRouter} from "react-router-dom";
import {Card, Input, Select, Checkbox, Switch, Button, message} from "antd";
import AceEditor from "react-ace";
import http from "../../service";
import "ace-builds/src-min-noconflict/ext-language_tools"
import "ace-builds/src-min-noconflict/mode-javascript";
import "ace-builds/src-min-noconflict/mode-php";
import "ace-builds/src-min-noconflict/mode-golang";
import "ace-builds/src-min-noconflict/mode-java";
import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/theme-monokai";
const Option = Select.Option;
class TemplateEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: undefined,
      template: undefined,
      deps: undefined,
      desc: undefined,
      private: true,
      selectRuntime: undefined,
      runtime_id: undefined,
      runtimeList: [],
      runtime_loading: false,
      selectMode: undefined,
      moduleName: undefined,
      funcName: undefined,
      mode: ['script'],
    }
  }

  componentDidMount() {
    http.get('/runtime').then(r => {
      this.setState({runtimeList: r.data, runtime_loading: false})
    }).catch(e => this.setState({runtime_loading: false}));
    if (this.props.type === 'edit') this.getTemplate();
  }

  selectRuntime(value) {
    let runtimeList = this.state.runtimeList;
    let selectRuntime = undefined;
    for (let i = 0; i < runtimeList.length; i++) {
      if (runtimeList[i].id === value) {
        selectRuntime = runtimeList[i];
        break;
      }
    }
    this.setState({selectRuntime, runtime_id: value});
  }

  getTemplate() {
    http.get(`/template/${this.props.match.params.id}`).then(r => {
      let mode = [];
      if (r.data.template) mode.push('script');
      if (r.data.deps && r.data.deps !== 'none') mode.push('deps');
      let handler = r.data.handler;
      let regx = /^([-\w]+).([-\w]+)$/;
      let res = handler.match(regx);
      this.setState({
        name: r.data.name,
        template: r.data.template,
        deps: r.data.deps,
        private: r.data.private,
        selectRuntime: r.data.Runtime,
        runtime_id: r.data.Runtime.id,
        desc: r.data.desc,
        moduleName: res[1],
        funcName: res[2],
        mode,
      })
    })
  }

  createTemplate() {
    http.post('/template/create', {
      name: this.state.name,
      template: this.state.mode.includes('script') ? this.state.template : '',
      deps: this.state.mode.includes('deps') ? this.state.deps : '',
      runtime_id: this.state.runtime_id,
      private: +this.state.private,
      desc: this.state.desc,
      handler: `${this.state.moduleName}.${this.state.funcName}`,
    }).then(r => {
      this.props.history.push(`/template/${r.data.id}`);
      message.success("create template success")
    }).catch()
  }

  updateTemplate() {
    http.put(`/template/${this.props.match.params.id}`, {
      name: this.state.name,
      template: this.state.mode.includes('script') ? this.state.template : '',
      deps: this.state.mode.includes('deps') ? this.state.deps : '',
      runtime_id: this.state.runtime_id,
      private: +this.state.private,
      desc: this.state.desc,
      handler: `${this.state.moduleName}.${this.state.funcName}`,
    }).then(r => {
      message.success("update template success")
    }).catch()
  }

  render() {
    return (
      <div>
        <Card title="模版配置">
          <div style={{ marginBottom: 20 }}>
            <div>Template Name</div>
            <Input placeholder="Input Template Name"  value={this.state.name} onChange={e => this.setState({name: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Template Description</div>
            <Input placeholder="Input Template Description"  value={this.state.desc} onChange={e => this.setState({desc: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Function Handler</div>
            <Input style={{width: 200}} placeholder="Input Function Filename" value={this.state.moduleName} onChange={e => this.setState({moduleName: e.target.value})}/>
            <span style={{ padding: '0px 10px' }}>.</span>
            <Input style={{width: 200}} placeholder="Input Export Function Name" value={this.state.funcName} onChange={e => this.setState({funcName: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Runtime</div>
            <div>
              <Select
                placeholder="Select a Runtime"
                value={this.state.runtime_id}
                style={{ width: '50%' }}
                loading={this.state.runtime_loading}
                onChange={this.selectRuntime.bind(this)}>
                {
                  this.state.runtimeList.map((item, index) => (
                    <Option key={index} value={item.id}>{`${item.name}:${item.version}`}</Option>
                  ))
                }
              </Select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ paddingRight: 10 }}>Template Private</span>
            <Switch defaultChecked={true} disabled={true} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Template Script</div>
            <Checkbox.Group
              options={[
                { label: 'Include Script', value: 'script' },
                { label: 'Include Dependencies', value: 'deps' },
              ]}
              value={this.state.mode}
              onChange={values => this.setState({mode: values})}
              disabled={!this.state.runtime_id}
            />
            <div style={{ overflow: 'hidden' }}>
              {
                this.state.selectRuntime
                && this.state.mode.includes('script')
                && (
                  <div
                    style={{
                      width: '45%',
                      float: 'left'
                    }}
                  >
                    <div>Template</div>
                    <AceEditor
                      onChange={template => this.setState({template})}
                      value={this.state.template}
                      placeholder="// write template here"
                      mode={this.state.selectRuntime.lang}
                      theme="script-editor"
                      name="blah2"
                      fontSize={14}
                      showPrintMargin={true}
                      showGutter={true}
                      highlightActiveLine={true}
                      setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                        useWorker: false,
                      }}
                    />
                  </div>
                )
              }
              {
                this.state.selectRuntime
                && this.state.mode.includes('deps')
                && (
                  <div
                    style={{
                      width: '45%',
                      marginLeft: '50%'
                    }}
                  >
                    <div>{this.state.selectRuntime.depsName}</div>
                    <AceEditor
                      onChange={deps => this.setState({deps})}
                      value={this.state.deps}
                      placeholder="// write dependencies file here"
                      mode={this.state.selectRuntime.depsLang}
                      theme="monokai"
                      name="deps-editor"
                      fontSize={14}
                      showPrintMargin={true}
                      showGutter={true}
                      highlightActiveLine={true}
                      setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true,
                        showLineNumbers: true,
                        tabSize: 2,
                        useWorker: false,
                      }}
                    />
                  </div>
                )
              }
            </div>
          </div>
          <Button
            type="primary"
            onClick={this.props.type === 'create' ? this.createTemplate.bind(this) : this.updateTemplate.bind(this)}
          >{this.props.type === 'create' ? 'Create' : 'Save'}</Button>
        </Card>
      </div>
    )
  }
}

export default function (type) {
  class wrapped extends React.Component {
    render() {
      return <TemplateEditor {...this.props} type={type} />;
    }
  }
  return withRouter(wrapped)
};