import React from 'react';
import { Card, Input, Icon, Row, Col, Divider, Button, message } from "antd";
import http from '../../service';
import sha256 from 'sha256';
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      type: 'login',
      loading: false,
    }
  }

  login() {
    let { username, password } = this.state;
    this.setState({ loading: true });
    http.post('/auth/login', {
      username,
      password: sha256(password)
    }).then(r => {
      message.success('login success');
      localStorage.setItem('$FUSION_TOKEN', r.data.api_token);
      this.setState({ loading: false });
      window.location.reload()
    }).catch(e => {
      this.setState({ loading: false });
    });
  }

  register() {
    let { username, password } = this.state;
    this.setState({ loading: true });
    http.post('/auth/register', {
      username,
      password: sha256(password)
    }).then(r => {
      message.success('register success');
      localStorage.setItem('$FUSION_TOKEN', r.data.api_token);
      this.setState({ loading: false });
      window.location.reload()
    }).catch(e => {
      this.setState({ loading: false });
    });
  }

  render() {
    let centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    let activeStyle = {
      color: '#1890ff'
    };

    let commonStyle = {
      cursor: 'pointer'
    };

    return (
      <div style={{
        height: '100%',
        ...centerStyle
      }}>
        <Card
          hoverable
          style={{
            width: 750,
            height: 300,
            ...centerStyle
          }}
        >
          <Row gutter={16} type="flex" justify="center">
            <Col span={14} style={centerStyle}>
              <Row gutter={16} type="flex" justify="center">
                <Col span={10} style={centerStyle}>
                  <Icon type="deployment-unit" style={{ fontSize: 100, color: '#4fc3f7' }}/>
                </Col>
                <Col span={14}>
                  <span style={{ fontSize: 40 }}>FuncEasy</span>
                  <p>A Serverless Platform for Functions</p>
                </Col>
              </Row>
            </Col>
            <Col span={1}>
              <Divider type="vertical" style={{ height: 200 }}/>
            </Col>
            <Col span={9}>
              <div>
                <div style={{ marginBottom: 20 }}>
                  <span
                    onClick={e => this.setState({ type: 'login' })}
                    style={this.state.type === 'login' ? {...commonStyle,...activeStyle} : commonStyle}
                  >LOGIN</span>
                  <Divider type="vertical" />
                  <span
                    onClick={e => this.setState({ type: 'register' })}
                    style={this.state.type === 'register' ? {...commonStyle,...activeStyle} : commonStyle}
                  >REGISTER</span>
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Input
                    value={this.state.username}
                    placeholder="Enter your username"
                    prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    onChange={e => this.setState({ username: e.target.value})}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Input
                    value={this.state.password}
                    placeholder="Enter your password"
                    prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    onChange={e => this.setState({ password: e.target.value})}
                  />
                </div>
                <Button
                  type="default" block
                  loading={this.state.loading}
                  onClick={this.state.type === 'login' ? this.login.bind(this) : this.register.bind(this)}
                >
                  {this.state.type === 'login' ? 'LOGIN' : 'REGISTER'}
                </Button>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    );
  }
}