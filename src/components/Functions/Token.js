import React from "react";
import {Button, Card, Input, Alert, Tag} from "antd";
import moment from 'moment';
import http from '../../service';

class Token extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: '',
      createdAt: '',
    }
  }

  componentDidMount() {
    this.getToken()
  }

  getToken() {
    http.get('/function/access/token').then(r => {
      this.setState({
        token: r.data.token,
        createdAt: r.data.createdAt
      })
    })
  }

  refreshToken() {
    http.post('/function/access/token/create').then(r => {
      this.getToken()
    })
  }

  render() {
    return (
      <Card title="Function Token">
        <Alert
          style={{ marginBottom: 20 }}
          message="Function Token is used as private function access control"
          type="info"
          showIcon
        />
        <div style={{ marginBottom: 20 }}>
          <Button onClick={this.refreshToken.bind(this)} type="primary">
            {this.state.token ? 'Refresh Token' : 'Create Token'}
          </Button>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div  style={{ marginBottom: 10 }}>
            <span style={{ paddingRight: 10 }}>Token</span>
            <Tag color="red">{moment(this.state.createdAt).utc(8).format()}</Tag>
          </div>
          <Input disabled={true} value={this.state.token}/>
        </div>
      </Card>
    )
  }
}

export default Token