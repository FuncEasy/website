import React from 'react';
import {Steps, Table, Tag} from "antd";
import http from '../../service';
import StepsStatus from './StepsStatus';

const { Step } = Steps;
class FunctionSubTable extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      functions: [],
    };
  }

  componentDidMount() {
    this.getFunctions();
  }

  getFunctions() {
    let nsId = this.props.ns;
    http.get(`function/${nsId}/functions`).then(r => {
      this.setState({functions: r.data});
    }).catch(e => {})
  }

  render() {
    let columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <a onClick={() => window.location.href = `/functions/${record.id}`}>{text}</a>,
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
        render: (runtime, record) =>
          <Tag color={'green'} key={runtime.id}>
          {`${runtime.lang}:${runtime.version}`}
          </Tag>
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
    ];
    return (
      <Table columns={columns} dataSource={this.state.functions} rowKey={record => record.id}/>
    )
  }
}

export default FunctionSubTable;
