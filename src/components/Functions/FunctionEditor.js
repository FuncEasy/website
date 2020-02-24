import React from "react";
import {Button, Empty, Icon, message, Radio, Spin} from "antd";
import http from "../../service";
import LangTag from "./LangTag";
import CodePreview from "./CodePreview";

class FunctionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: 'upload',
      hover: false,
      contentType: '',
      fileData: this.props.editor === "deps" ? this.props.deps : "",
      loading: false,
      filename: '',
    }
  }

  componentDidMount() {
    console.log(this.props);
    if (this.props.editor === "script"
      && (this.props.status === "uploaded"
      || this.props.status === "deployed"
      || this.props.status === "redeploy")
    ) {
      this.setState({loading: true});
      http.get(`/function/script/${this.props.id}`).then(r => {
        this.setState({
          contentType: r.data.contentType,
          fileData: r.data.decodeFunctionScript,
          loading: false,
        })
      }).catch(e => {
        this.setState({loading: false});
      })
    }
  }

  uploadScript() {
    let files = this.fileInput.files;
    if (files.length > 0) {
      const formData = new FormData();
      formData.append('file', files[0]);
      message.info("start uploading...");
      http.post(`/function/scriptUpload/${this.props.id}`, formData)
        .then(r => {
          message.info("upload success!");
          this.props.refresh()
        })
        .catch(e => {
          message.info("upload error!");
        });
      this.fileInput.value = null;
      this.setState({
        filename: '',
      })
    }
  }

  uploadDeps() {
    let files = this.fileInput.files;
    if (files.length > 0 && this.state.fileData) {
      message.info("start uploading...");
      http.put(`/function/${this.props.id}`, {
        deps: this.state.fileData
      }).then(r => {
        message.info("upload success!");
        this.props.refresh()
      }).catch(e => {})
    }
  }

  checkType(filename) {
    if(/\.(js|go|py|java|c|cpp|php)$/.test(filename)){
      return "code"
    }
    if (/\.(json|xml)$/.test(filename)) {
      return "deps"
    }
    if (/\.(zip)$/.test(filename)) {
      return "zip"
    }
    return false;
  }

  readyToUpload() {
    let fileObj = this.fileInput.files[0];
    let type = this.checkType(fileObj.name);
    if (!type) {
      message.error('Unsupported Content Type');
      return
    }
    const reader = new FileReader();
    reader.readAsText(this.fileInput.files[0]);
    reader.onload = () => {
      this.setState({
        filename: fileObj.name,
        fileData: reader.result,
        contentType: type,
      });
    };
  }

  uploadRender() {
    let centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    };
    let commonStyle = {
      width: 200,
      height: 200,
      cursor: 'pointer',
      borderRadius: 6,
      ...centerStyle,
    };
    let uploadButtonDefaultStyle = {
      ...commonStyle,
      border: '2px dashed',
      borderColor: '#ebedf0',

    };
    let uploadButtonHoverStyle = {
      ...commonStyle,
      border: '2px dashed',
      color: '#1890ff',
      borderColor: '#1890ff'
    };
    return (
      <div style={{ overflow: 'hidden' }}>
        <div style={{float: 'left'}}>
          <div
            style={this.state.hover ? uploadButtonHoverStyle : uploadButtonDefaultStyle}
            onMouseMove={() => this.setState({hover: true})}
            onMouseLeave={() => this.setState({hover: false})}
            onClick={() => this.fileInput.click()}
          >
            <div>
              <div style={centerStyle}>
                {this.state.filename && <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" style={{fontSize: 50}} />}
              </div>
              <span>{`${this.state.filename ? `Selected: ${this.state.filename}` : this.props.editor === "script" ? 'Select Function File' : 'Select Dependencies File'}`}</span>
            </div>
          </div>
          <Button type="primary" block onClick={this.props.editor === "script" ? this.uploadScript.bind(this) : this.uploadDeps.bind(this)}>Upload</Button>
          <input
            type="file"
            style={{ display: 'none' }}
            ref={e => this.fileInput = e}
            onChange={this.readyToUpload.bind(this)}
          />
        </div>
        <div style={{ marginLeft: 220 }}>
          <h3>File Preview</h3>
          {this.scriptRender(this.state.fileData, this.props.runtime, this.props.handler, this.state.contentType)}
        </div>
      </div>
    )
  }

  scriptRender(script, runtime, handler, type) {
    if (this.props.editor === "script") {
      if (script) {
        if (type === 'code' || type === 'text') {
          return (
            <Spin spinning={this.state.loading}>
              <LangTag runtime={runtime} />
              <span style={{ fontSize: 20 }}>{`Handler: ${handler}`}</span>
              <CodePreview code={script} language={runtime.suffix}/>
            </Spin>
          )
        } else {
          return (
            <Spin spinning={this.state.loading}>
              <LangTag runtime={runtime} />
              <span style={{ fontSize: 20 }}>{`Handler: ${handler}`}</span>
              <div>{"base64:"}</div>
              <p style={{wordBreak:'break-all'}}>{script}</p>
            </Spin>
          )
        }
      } else {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }
    } else if (this.props.editor === "deps") {
      if (script) {
        return (
          <Spin spinning={this.state.loading}>
            <LangTag runtime={runtime} />
            <span style={{ fontSize: 20 }}>{runtime.depsName}</span>
            <CodePreview code={script} language={runtime.depsLang}/>
          </Spin>
        )
      } else {
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }
    }
  }

  onlineRender() {
    return (
      <div>online</div>
    )
  }

  contentRender() {
    switch (this.state.type) {
      case 'upload':
        return this.uploadRender();
      case 'online':
        return this.onlineRender();
      default:
        break;
    }
  }

  render() {
    return (
      <div>
        <Radio.Group onChange={e => this.setState({type: e.target.value})} value={this.state.type}>
          <Radio value="upload">Upload</Radio>
          <Radio value="online">Online</Radio>
        </Radio.Group>
        <div style={{ marginTop: 20 }}>
          {this.contentRender()}
        </div>
      </div>
    )
  }

}

export default FunctionEditor