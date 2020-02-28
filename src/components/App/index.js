import React from 'react';
import { connect } from 'react-redux';
import { Layout, Menu, Icon, Spin } from 'antd';
import {BrowserRouter, Route, Redirect, Switch, Link} from 'react-router-dom';
import './app.less';
import Login from '../Auth/Login';
import User from '../Auth/User';
import { getAuth } from '../../actions';
import Dashboard from '../Dashboard';
import Functions from '../Functions';
import DataSource from "../DataSource";
import Token from "../Functions/Token";
import Template from "../Template";
import TemplateEditor from "../Template/TemplateEditor";
import FunctionSteps from '../Functions/FunctionSteps';
import DataSourceEditor from '../DataSource/DataSourceEditor';
const { Header, Content, Footer, Sider } = Layout;
class App extends React.Component {
  constructor(props) {
    super(props);
    this.menus = [
      {name: '仪表盘', key: 'dashboard', icon: 'compass' },
      {name: '云函数', key: 'functions', icon: 'code-sandbox'},
      {name: '数据源', key: 'data-source', icon: 'database'},
      {name: '函数模版', key: 'template', icon: 'switcher'},
      {name: 'Function Token', key: 'token', icon: 'key'}
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
          this.props.auth.status === 'Pending'
          && <Spin style={{ position: "fixed", right: 10, top: 10 }} indicator={<Icon type="loading" />} />
        }
        {
          this.props.auth.status === 'Success'
          &&
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
                    <Route exact path="/data-source" component={DataSource}/>
                    <Route exact path="/data-source/create" component={DataSourceEditor('create')}/>
                    <Route exact path="/data-source/:id" component={DataSourceEditor('edit')}/>
                    <Route exact path="/template" component={Template} />
                    <Route exact path="/template/create" component={TemplateEditor('create')} />
                    <Route exact path="/template/:id" component={TemplateEditor('edit')} />
                    <Route exact path="/token" component={Token}/>
                  </Switch>
                </Content>
                <Footer style={{ textAlign: 'center' }}>Fusion ©2019 Created by ZiqianCheng</Footer>
              </Layout>
            </Layout>
        }
        {
          this.props.auth.status === "Fail" && <Login/>
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
