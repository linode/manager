import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import logo from 'file!../../assets/linode-logo.svg';

export default function Navigation(props) {
  const { username } = props;

  return (
    <nav id="main-nav" className="navbar navbar-default" role="navigation">
      <div className="navbar-header">
        <div className="navbar-linode">
          <Link to="/">
            <img
              id="navbar-logo" src={logo}
              width="102" height="40"
              alt="Linode"
            />
          </Link>
        </div>
        <div className="navbar-search">
          <input
            className="form-control"
            type="search"
            placeholder="Search..."
            id="navbar-search"
          />
        </div>
        <div className="navbar-collapse collapse">
          <ul className="nav navbar-nav">
            <li className="nav-item">
              <a href="https://www.linode.com/docs/" className="nav-link">Documentation</a>
            </li>
            <li className="nav-item">
              <a href="https://forum.linode.com" className="nav-link">Community</a>
            </li>
            <li className="nav-item">
              <a href="https://developers.linode.com" className="nav-link">Developers</a>
            </li>
          </ul>
        </div>
        {username ?
          <div className="navbar-session pull-right">
            <a href="/account" className="nav-text nav-user">
              {username}
            </a>
            <span className="nav-notifications">1</span>
            <a href="/logout" className="nav-text nav-logout">
              Logout
            </a>
          </div>
         : ''}
      </div>
    </nav>
  );
}

Navigation.propTypes = { username: PropTypes.string };
