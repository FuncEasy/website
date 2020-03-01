import React from 'react';
import {Card, message, Table, Tag, Modal} from "antd";
import http from '../../../service';
import { withRouter } from 'react-router-dom';
const { confirm } = Modal;

class RuntimeList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      runtime: [],
    };
  }

  componentDidMount() {
    this.getRuntime();
  }

  getRuntime() {
    http.get(`/runtime`).then(r => {
      this.setState({runtime: r.data});
    }).catch(e => {})
  }

  deleteRuntime(id) {
    return http.delete(`/runtime/${id}`).then(r => {
      message.success("Deleted");
      this.getRuntime();
    }).catch(e => {})
  }

  showConfirm(id) {
    let that = this;
    confirm({
      title: 'Do you want to delete this runtime?',
      content: 'All functions running in this runtime will get ERROR',
      onOk() {
        return that.deleteRuntime(id)
      },
      onCancel() {
      },
    });
  }

  render() {
    let columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        render: (id, record) => <a onClick={() => this.props.history.push(`/runtime/${id}`)}>{id}</a>,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Lang',
        dataIndex: 'lang',
        key: 'lang',
      },
      {
        title: 'Suffix',
        dataIndex: 'suffix',
        key: 'suffix',
      },
      {
        title: 'DepsName',
        dataIndex: 'depsName',
        key: 'depsName',
      },
      {
        title: 'DepsLang',
        dataIndex: 'depsLang',
        key: 'depsLang',
      },
      {
        title: 'Version',
        dataIndex: 'version',
        key: 'version',
        render: data => <Tag color="geekblue">{data}</Tag>
      },
      {
        title: 'Action',
        dataIndex: 'Action',
        key: 'Action',
        render: (text, record, index) => <a style={{color: "red"}} onClick={this.showConfirm.bind(this, record.id)}>Delete</a>,
      },
    ];
    return (
      <Card
        title="数据源"
      >
        <Table columns={columns} dataSource={this.state.runtime} rowKey={record => record.id}/>
      </Card>
    )
  }
}

export default withRouter(RuntimeList);
