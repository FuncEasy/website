import React from 'react';
import {Button, Modal, Input} from "antd";
import http from '../../service';
class CreateNamespace extends React.Component{
  constructor() {
    super();
    this.state = {
      visible: false,
      name: '',
      desc: '',
      confirmLoading: false,
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    this.setState({confirmLoading: true});
    http.post('/namespace/create', {
      name: this.state.name,
      desc: this.state.desc,
    }).then(r => {
      this.setState({
        confirmLoading: false,
        visible: false,
      });
      window.location.reload();
    }).catch(e => {
      this.setState({
        confirmLoading: false,
        visible: false,
      });
    })
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  render() {
    return (
      <span style={{ paddingRight: 10 }}>
        <Button type="primary" onClick={this.showModal}>新建命名空间</Button>
        <Modal
          title="新建命名空间"
          visible={this.state.visible}
          confirmLoading={this.state.confirmLoading}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div style={{ marginBottom: 10 }}>
            <span>名称</span>
            <Input value={this.state.name} onChange={e => this.setState({name: e.target.value})}/>
          </div>
          <div>
            <span>描述</span>
            <Input value={this.state.desc} onChange={e => this.setState({desc: e.target.value})}/>
          </div>
        </Modal>
      </span>
    )
  }
}

export default CreateNamespace;
