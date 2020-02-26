import React from 'react';
import {Card, message, Table, Tag, Modal} from "antd";
import http from '../../service';
const { confirm } = Modal;

class DataSourceList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      dataSources: [],
    };
  }

  componentDidMount() {
    this.getDataSources();
  }

  getDataSources() {
    http.get(`/dataSource`).then(r => {
      this.setState({dataSources: r.data});
    }).catch(e => {})
  }

  deleteDataSource(id) {
    return http.delete(`/dataSource/${id}`).then(r => {
      message.success("Deleted");
      this.getDataSources();
    }).catch(e => {})
  }

  showConfirm(id) {
    let that = this;
    confirm({
      title: 'Do you want to delete this data source?',
      content: 'All functions mounted with to data source will get ERROR when getting data',
      onOk() {
        return that.deleteDataSource(id)
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
        key: 'id'
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <a onClick={() => window.location.href = `/data-source/${record.id}`}>{text}</a>,
      },
      {
        title: 'Mount Functions',
        dataIndex: 'Functions',
        key: 'Functions',
        render: data => <div>{data.map((e,i) => <Tag key={i} color="geekblue">{e.name}</Tag>)}</div>
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
        <Table columns={columns} dataSource={this.state.dataSources} rowKey={record => record.id}/>
      </Card>
    )
  }
}

export default DataSourceList;
