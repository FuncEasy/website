import React from "react";
import {Button, Card, Input, message} from "antd";
import http from '../../../service';

class RuntimeEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      lang: '',
      version: '',
      suffix: '',
      depsName: '',
      depsLang: '',
    }
  }

  componentDidMount() {
    if (this.props.type === 'edit') {
      this.getData()
    }
  }

  getData() {
    http.get(`/runtime/${this.props.match.params.id}`).then(r => {
      this.setState({...r.data})
    }).catch()
  }

  save() {
    http.put(`/runtime/${this.props.match.params.id}`, {...this.state}).then(r => {
      message.success("Saved");
      this.getData()
    }).catch()
  }

  create() {
    http.post(`/runtime/create`, {...this.state}).then(r => {
      message.success("Created");
      this.props.history.push(`/runtime/${r.data.id}`)
    }).catch()
  }

  render() {
    return (
      <div>
        <Card title="Runtime">
          <div style={{ marginBottom: 20 }}>
            <div>Runtime Name</div>
            <Input placeholder="Input Runtime Name"  value={this.state.name} onChange={e => this.setState({name: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Runtime Lang</div>
            <Input placeholder="Input Runtime Lang"  value={this.state.lang} onChange={e => this.setState({lang: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Runtime Suffix</div>
            <Input placeholder="Input Runtime Suffix"  value={this.state.suffix} onChange={e => this.setState({suffix: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Runtime Version</div>
            <Input placeholder="Input Runtime Version"  value={this.state.version} onChange={e => this.setState({version: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Runtime DepsName</div>
            <Input placeholder="Input Runtime depsName"  value={this.state.depsName} onChange={e => this.setState({depsName: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Runtime DepsLang</div>
            <Input placeholder="Input Runtime depsLang"  value={this.state.depsLang} onChange={e => this.setState({depsLang: e.target.value})}/>
          </div>
          <Button
            type="primary"
            onClick={this.props.type === 'create' ? this.create.bind(this) : this.save.bind(this)}
          >
            {this.props.type === 'create' ? 'Create' : 'Save'}
          </Button>
        </Card>
      </div>
    )
  }
}

export default function (type) {
  class wrapped extends React.Component {
    render() {
      return <RuntimeEditor {...this.props} type={type} />;
    }
  }
  return wrapped
};