import React from 'react';
import { connect } from 'react-redux';
import { Layout, Menu, Icon } from 'antd';
import {BrowserRouter, Route, Redirect, Switch, Link} from 'react-router-dom';
import './app.less';
import Login from '../Auth/Login';
import User from '../Auth/User';
import { getAuth } from '../../actions';
import Dashboard from '../Dashboard';
import Functions from '../Functions';
import FunctionSteps from '../Functions/FunctionSteps';
const { Header, Content, Footer, Sider } = Layout;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.menus = [
      {name: '仪表盘', key: 'dashboard', icon: 'compass' },
      {name: '云函数', key: 'functions', icon: 'code-sandbox'}
    ];
    this.state = {
      currentMenu: this.menus.find(o => window.location.pathname.match(o.key)) || this.menus[0],
    }
  }

  componentDidMount() {
    this.props.getAuth();
  }

  getMenuKeyForCurrentRoute() {
    const menu = this.menus.find(o => window.location.pathname.match(o.key)) || null;
    return menu ? menu.key : 'dashboard';
  }

  render() {
    const MenuList = this.menus.map(item => (
      <Menu.Item key={item.key} onClick={() => this.setState({currentMenu: item})}>
        <Link to={`/${item.key}`}>
          <Icon type={item.icon}/>
          <span>{item.name}</span>
        </Link>
      </Menu.Item>
    ));
    return (
      <BrowserRouter>
        {
          this.props.auth.data && this.props.status !== 'Fail' ?
            <Layout style={{minHeight: '100%'}}>
              <Sider>
                <div className="logo" align="center">
                  <Icon type="deployment-unit" style={{ fontSize: 30, color: '#4fc3f7' }}/>
                  <span style={{ paddingLeft: 10 }}>FuncEasy</span>
                </div>
                <Menu
                  theme="dark"
                  mode="inline"
                  defaultSelectedKeys={this.getMenuKeyForCurrentRoute()}
                >
                  {MenuList}
                </Menu>
              </Sider>
              <Layout>
                <Header style={{ background: '#fff', padding: '0px 10px' }}>
                  <span>{this.state.currentMenu.name}</span>
                  <User />
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                  <Switch>
                    <Route exact path="/" component={() => <Redirect to="/dashboard"/>}/>
                    <Route exact path="/dashboard" component={Dashboard}/>
                    <Route exact path="/functions" component={Functions}/>
                    <Route exact path="/functions/create" component={FunctionSteps('create')} />
                    <Route exact path="/functions/:id" component={FunctionSteps('edit')} />
                  </Switch>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Fusion ©2019 Created by ZiqianCheng</Footer>
              </Layout>
            </Layout>
            : <Login/>
        }
      </BrowserRouter>
    )
  }
}

export default connect(function (state) {
  return {
    auth: state.auth
  }
}, { getAuth })(App);
