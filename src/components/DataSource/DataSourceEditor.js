import React from "react";
import {Button, Card, Input, message} from "antd";
import DataSourceStructEditor from "./DataSourceStructEditor";
import http from '../../service';

class DataSourceEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      struct: [],
    }
  }

  componentDidMount() {
    if (this.props.type === 'edit') {
      this.getData()
    }
  }

  getData() {
    http.get(`/dataSource/${this.props.match.params.id}`).then(r => {
      let struct = JSON.parse(r.data.define);
      struct = Object.keys(struct).map((key, i) => ({
        id: i,
        field: key,
        type: struct[key].type,
        available: false,
      }));
      this.setState({
        name: r.data.name,
        struct: struct
      })
    }).catch()
  }

  save() {
    let define = {};
    this.state.struct.forEach(item => {
      if (item.type && item.field) {
        define[item.field] = {
          type: item.type,
        }
      }
    });
    http.post(`/dataSource/update/${this.props.match.params.id}`, {
      name: this.state.name,
      define,
    }).then(r => {
      message.success("Saved");
      this.getData()
    }).catch()
  }

  create() {
    let define = {};
    this.state.struct.forEach(item => {
      if (item.type && item.field) {
        define[item.field] = {
          type: item.type,
        }
      }
    });
    http.post(`/dataSource/create`, {
      name: this.state.name,
      define,
    }).then(r => {
      message.success("Created");
      this.props.history.push(`/data-source/${r.data.id}`)
    }).catch()
  }

  selectorChange(value) {
    this.setState({struct: value})
  }

  render() {
    return (
      <div>
        <Card title="数据源配置">
          <div style={{ marginBottom: 20 }}>
            <div>Data Source Name</div>
            <Input placeholder="Input Data Source Name"  value={this.state.name} onChange={e => this.setState({name: e.target.value})}/>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div>Data Source Struct Define</div>
            <DataSourceStructEditor
              struct={this.state.struct}
              onChange={this.selectorChange.bind(this)}
            />
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
      return <DataSourceEditor {...this.props} type={type} />;
    }
  }
  return wrapped
};