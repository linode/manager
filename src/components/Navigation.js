import React, { Component } from 'react';
import { Link } from 'react-router';
import logo from 'file!../../styles/assets/linode-logo.svg';

class Navigation extends Component {
  render() {
    const { username } = this.props;
    return (
      <nav id="main-nav" className="navbar navbar-default navbar-dark container" role="navigation">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/">
              <img id="navbar-logo" src={logo}
                  width="115" height="45" />
          </Link>
          <p className="nav-text">
              <strong>Manager</strong>
          </p>
        </div>
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-nav">
              <li className="nav-item">
                  <Link className="nav-link" to="/">Linodes</Link>
              </li>
              <li className="nav-item">
                  <Link className="nav-link" to="/dns">DNS</Link>
              </li>
              <li className="nav-item">
                  <Link className="nav-link" to="/node-balancers">Node Balancers</Link>
              </li>
          </ul>
        </div>
        {username ?
          <div className="login-info">
            <div className="pull-right nav-text">
              <a className="btn btn-success" href="https://login.alpha.linode.com/logout">
                  Log Out &nbsp;
                  <i className="fa fa-caret-right" />
              </a>
            </div>
            <div className="pull-right nav-text" style={{
                textTransform: 'none',
                color: 'white',
                fontWeight: 'bold',
                marginTop: '0.5rem' }}>
              Hi {username}! &nbsp;
            </div>
          </div>
        : <span />}
      </nav>
    );
  }
}

export default Navigation;
