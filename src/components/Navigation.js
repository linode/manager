import React, { Component } from 'react';
import { Link } from 'react-router';
import logo from 'file!../../styles/assets/linode-logo.svg';

class Navigation extends Component {
  render() {
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
                  <Link className="nav-link" to="/linodes">Linodes</Link>
              </li>
              <li className="nav-item">
                  <Link className="nav-link" to="/node-balancers">Node Balancers</Link>
              </li>
          </ul>
          <ul className="pull-right nav nav-text">
            <a className="btn btn-success" href="/login">
                Log In &nbsp;
                <i className="fa fa-caret-right"></i>
            </a>
          </ul>
        </nav>
      </header>
    );
  }
}

export default Navigation;
