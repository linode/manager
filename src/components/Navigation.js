import React, { Component } from 'react';
import { Link } from 'react-router';
import logo from 'file!../../styles/assets/linode-logo.svg';

class Navigation extends Component {
  render() {
    const { username } = this.props;
    return (
      <header className="container">
        <nav id="main-nav" className="navbar navbar-dark bg-inverse" role="navigation">
          <Link className="navbar-brand" to="/">
              <img id="navbar-logo" src={logo}
                  width="115" height="45" />
          </Link>
          <p className="nav-text">
              <strong>Manager</strong>
          </p>
          <ul className="nav navbar-nav">
              <li className="nav-item">
                  <Link className="nav-link" to="/">Linodes</Link>
              </li>
              <li className="nav-item">
                  <Link className="nav-link" to="/node-balancers">Node Balancers</Link>
              </li>
          </ul>
          {username ?
            <div>
              <div className="pull-right nav-text">
                <a className="btn btn-success" href="https://login.alpha.linode.com/logout">
                    Log Out &nbsp;
                    <i className="fa fa-caret-right" />
                </a>
              </div>
              <div className="pull-right nav-text" style={{
                  color: "white",
                  marginTop: "2px",
                  marginRight: "5px"}}> {/* TODO: styles */}
                Hi {username}! &nbsp;
              </div>
            </div>
          : <span />}
        </nav>
      </header>
    );
  }
}

export default Navigation;
