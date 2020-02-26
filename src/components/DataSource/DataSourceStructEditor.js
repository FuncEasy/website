import React from "react";
import {Input, Select, Table, Button, Icon, message} from "antd";
const Option = Select.Option;
class DataSourceStructEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      struct: []
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({struct: nextProps.struct})
  }

  typeSelector(index, available) {
    let supportType = [
      'integer',
      'string',
      'text',
      'date',
      'float',
      'double',
    ];
    return (
      <Select
        placeholder="Select Type"
        value={this.state.struct[index].type}
        style={{ width: '100%' }}
        onChange={v => this.changeStruct(index, {type: v})}
        disabled={!available}
      >
        {
          supportType.map((item, index) => (
            <Option key={index} value={item}>{item}</Option>
          ))
        }
      </Select>
    )
  }

  add() {
    let struct = this.state.struct;
    struct.push({
      id: struct.length,
      field: '',
      type: undefined,
      available: true,
    });
    this.setState({struct})
  }

  changeStruct(index, data) {
    let struct = this.state.struct;
    if (struct[index].available) {
      struct[index] = Object.assign({}, struct[index], data);
      this.setState({struct})
    }
    this.props.onChange(struct)
  }

  render() {
    let columns = [
      {
        title: 'Field',
        dataIndex: 'field',
        key: 'field',
        render: (text, record, index) =>
          <Input
            value={this.state.struct[index].field}
            disabled={!record.available}
            onChange={e => this.changeStruct(index, {field: e.target.value})}
          />
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (text, record, index) => this.typeSelector(index, record.available)
      }
    ];
    return (
      <div>
        <Table
          pagination={false}
          style={{ width: '50%' }}
          columns={columns}
          dataSource={this.state.struct}
          rowKey={record => record.id}
        />
        <Button type="dashed" onClick={this.add.bind(this)} style={{ width: '50%' }}>
          <Icon type="plus" /> Add field
        </Button>
      </div>
    )
  }

}

export default DataSourceStructEditor