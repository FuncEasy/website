import React from 'react';
import {message, Modal, Table, Tag} from "antd";
import { withRouter } from 'react-router-dom'
import http from '../../service';
import StepsStatus from './StepsStatus';
import LangTag from "./LangTag";
const confirm = Modal.confirm;

class FunctionSubTable extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      functions: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.getFunctions();
  }

  getFunctions() {
    let nsId = this.props.ns;
    this.setState({loading: true});
    http.get(`function/${nsId}/functions`).then(r => {
      this.setState({functions: r.data, loading: false});
    }).catch(e => {this.setState({loading: false})})
  }

  deleteFunction(id) {
    return http.delete(`/function/${id}`).then(r => {
      message.success("Deleted");
      this.getFunctions();
    }).catch(e => {})
  }

  showConfirm(id) {
    let that = this;
    confirm({
      title: 'Do you want to delete this function?',
      content: '',
      onOk() {
        return that.deleteFunction(id)
      },
      onCancel() {
      },
    });
  }

  render() {
    let columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <a onClick={() => this.props.history.push(`/functions/${record.id}`)}>{text}</a>,
      },
      {
        title: 'Handler',
        dataIndex: 'handler',
        key: 'handler',
      },
      {
        title: 'Version',
        key: 'version',
        dataIndex: 'version',
        render: version => (
          <Tag color="green" key={version}>
            {version}
          </Tag>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        width: 400,
        dataIndex: 'status',
        render: (status, record) =>
          <StepsStatus status={status} id={record.id} size={record.size}/>,
      },
      {
        title: 'Runtime',
        dataIndex: 'Runtime',
        key: 'runtime',
        render: (runtime, record) => <LangTag runtime={runtime}/>
      },
      {
        title: 'Access',
        dataIndex: 'private',
        key: 'private',
        render: isPrivate => (
          <Tag color={isPrivate ? 'red' : 'blue'} key={isPrivate}>
            {isPrivate ? 'Private' : 'Public'}
          </Tag>
        )
      },
      {
        title: 'Action',
        dataIndex: 'Action',
        key: 'Action',
        render: (text, record, index) => <a style={{color: "red"}} onClick={this.showConfirm.bind(this, record.id)}>Delete</a>,
      },
    ];
    return (
      <Table
        loading={this.state.loading}
        columns={columns}
        dataSource={this.state.functions}
        rowKey={record => record.id}
      />
    )
  }
}

export default withRouter(FunctionSubTable);
