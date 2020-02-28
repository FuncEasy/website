import React, {useState} from "react";
import http from '../../service';
import {withRouter} from 'react-router-dom'
import {Row, Col, Icon, Card, Tag, message, Modal, Empty} from "antd";
import LangTag from "../Functions/LangTag";
const confirm = Modal.confirm;
class TemplateList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      templateList: [],
    }
  }

  componentDidMount() {
    this.getTemplate()
  }

  deleteTemplate(id) {
    http.delete(`template/${id}`).then(r => {
      message.success("delete template success");
      this.getTemplate();
    }).catch()
  }

  getTemplate() {
    http.get('/template').then(r => {
      this.setState({templateList: r.data})
    }).catch()
  }

  showConfirm(id) {
    let that = this;
    confirm({
      title: 'Do you want to delete this function?',
      content: '',
      onOk() {
        return that.deleteTemplate(id)
      },
      onCancel() {
      },
    });
  }

  render() {
    return (
      <Row gutter={16}>
        {
          this.state.templateList.map(item => (
            <Col span={6}>
              <Card
                title={<a onClick={() => this.props.history.push(`/template/${item.id}`)}>{item.name}</a>}
                hoverable
                extra={<a style={{color: 'red'}} onClick={this.showConfirm.bind(this, item.id)}>Delete</a>}
              >
                <div style={{ marginBottom: 10 }}>
                  <LangTag runtime={item.Runtime}/>
                  {item.deps && item.deps !== 'none' && <Tag color="blue">with dependencies</Tag>}
                </div>
                <div>{item.desc || "No Description"}</div>
              </Card>
            </Col>
          ))
        }
        {
          this.state.templateList.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
      </Row>
    )
  }
}

export default withRouter(TemplateList)