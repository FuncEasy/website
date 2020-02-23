import React from "react";
import { Menu, Dropdown, Icon } from "antd";
import { connect } from 'react-redux';
class User extends React.Component {
  logout() {
    localStorage.removeItem("$FUSION_TOKEN");
    window.location.reload();
  }

  render() {
    let menu = (
      <Menu>
        <Menu.Item onClick={() => this.logout()}>
          <span style={{ color: 'red' }}>
            <Icon type="logout" />
            LOGOUT
          </span>
        </Menu.Item>
      </Menu>
    );
    return (
      <span style={{ float: 'right' }}>
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link">
            <span style={{ paddingRight: 5 }}>{this.props.auth.data.username}</span>
            <Icon type="down" />
          </a>
        </Dropdown>
      </span>
    )
  }

}

export default connect((state) => ({
  auth: state.auth
}))(User);