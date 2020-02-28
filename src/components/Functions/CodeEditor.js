import React from "react";
import AceEditor from "react-ace";
import {Select, Alert, Divider, message, Icon, Button} from "antd";
import http from '../../service';
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-min-noconflict/mode-php";
import "ace-builds/src-min-noconflict/mode-golang";
import "ace-builds/src-min-noconflict/mode-java";
import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-monokai";

const { Option } = Select;
class CodeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: this.props.code,
      lang: this.props.lang,
      autoSave: false,
    };
    this.lastScript = this.props.code;
    this.langList = [
      'javascript',
      'php',
      'java',
      'golang',
      'json'
    ];
    this.timer = null;
  }

  componentDidMount() {
    this.autoSave()
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null
  }

  autoSave() {
    this.timer = setInterval(() => {
      this.setState({autoSave: true});
      if (this.state.code !== this.lastScript) {
        if (this.props.editor === "script") {
          this.saveCode().then(r =>
            setTimeout(() => this.setState({autoSave: false}), 500))
            .catch(e => this.setState({autoSave: false}))
        } else if (this.props.editor === "deps") {
          this.saveDeps().then(r =>
            setTimeout(() => this.setState({autoSave: false}), 500))
            .catch(e => this.setState({autoSave: false}))
        }
      } else {
        setTimeout(() => this.setState({autoSave: false}), 500);
        message.info("Unchanged")
      }
    }, 10 * 1000)
  }

  save() {
    if (this.props.editor === "script") {
      this.saveCode().then().catch()
    } else if (this.props.editor === "deps") {
      this.saveDeps().then().catch()
    }
  }

  saveCode() {
    return http.post(`/function/scriptOnline/${this.props.id}`, {
      script: this.state.code
    }).then(r => {
      this.props.refresh();
      this.props.getFileData();
      message.success("Saved");
      this.lastScript = this.state.code
    }).catch()
  }

  saveDeps() {
    return http.put(`/function/${this.props.id}`, {
      deps: this.state.code
    }).then(r => {
      this.props.refresh();
      message.success("Saved");
      this.lastScript = this.state.code
    }).catch(e => this.setState({autoSave: false}))
  }

  render() {
    return (
      <div>
        {
          this.props.lang !== this.state.lang && (
            <Alert
              message="The selected language and runtime don't match. You may need to change the runtime!"
              type="warning"
              closable
              showIcon
            />
          )
        }
        <div style={{ marginBottom: 10 }}>
          <div>Select Language</div>
          <Select
            style={{ width: 200 }}
            onChange={value => this.setState({lang: value})}
            value={this.state.lang}
          >
            {
              this.langList.map(item => (
                <Option key={item} value={item}>{item}</Option>
              ))
            }
          </Select>
        </div>
        <Divider/>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 18, paddingRight: 10 }}>{this.props.filename}</span>
          {
            this.props.editor === "script" && (
              <span style={{ fontSize: 14, paddingRight: 10, color: '#bdbdbd' }}>{`[handler: ${this.props.handler}]`}</span>
            )
          }
          <Button
            type="primary"
            onClick={this.save.bind(this)}
            style={{ marginRight: 10 }}
          >Save</Button>
          {
            this.state.autoSave && (
              <span style={{ color: '#009688', fontWeight: 700 }}>
                <Icon type="loading" />
                <span>Auto Saving...</span>
              </span>
            )
          }
        </div>
        <AceEditor
          style={{
            width: '100%',
            float: 'left'
          }}
          onChange={code => this.setState({code})}
          value={this.state.code}
          placeholder="Placeholder Text"
          mode={this.state.lang}
          theme="monokai"
          name="blah2"
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
            useWorker: false,
          }}
        />
      </div>
    )
  }
}

export default CodeEditor