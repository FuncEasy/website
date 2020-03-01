import React from 'react';
import {Card, Empty, message, Modal} from 'antd';
import http from '../../service';
import FunctionSubTable from './FunctionSubTable';
const confirm = Modal.confirm;
class FunctionsList extends React.Component{
  constructor() {
    super();
    this.state = {
      namespaces: []
    };
  }
  componentDidMount() {
    this.getNameSpaces()
  }

  getNameSpaces() {
    http.get('/namespace').then(r => {
      this.setState({namespaces: r.data});
    }).catch(e => {})
  }

  deleteNameSpace(id) {
    return http.delete(`/namespace/${id}`).then(r => {
      message.success("Deleted");
      this.getNameSpaces();
    }).catch(e => {})
  }

  showConfirm(id) {
    let that = this;
    confirm({
      title: 'Do you want to delete this namespace?',
      content: 'the functions in this namesapce will be deleted',
      onOk() {
        return that.deleteNameSpace(id)
      },
      onCancel() {
      },
    });
  }

  render() {
    let TitleComponent = (name) => (
      <span>
        <span style={{ paddingRight: 5 }}>NameSpace:</span>
        <span style={{ color: "green" }}>{name}</span>
      </span>
    );
    return (
      <div>
        {
          this.state.namespaces.map(data => (
            <Card
              title={<Card.Meta title={TitleComponent(data.name)} description={data.desc} />}
              key={data.id}
              extra={<a style={{color: "red"}} onClick={this.showConfirm.bind(this, data.id)}>Delete</a>}
              style={{ marginBottom: 20 }}
            >
              <FunctionSubTable ns={data.id} />
            </Card>
          ))
        }
        {
          this.state.namespaces.length <= 0 &&  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
      </div>
    )
  }
}

export default FunctionsList;
