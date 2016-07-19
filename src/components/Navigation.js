import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import logo from 'file!../../assets/linode-logo.svg';

export default function Navigation(props) {
  const { username, emailHash } = props;
  const gravatarLink = `https://gravatar.com/avatar/${emailHash}`;

  return (
    <nav id="main-nav" className="navbar navbar-default" role="navigation">
      <div className="navbar-header">
        <div className="navbar-linode nav-item">
          <Link to="/">
            <img
              id="navbar-logo" src={logo}
              width="102" height="40"
              alt="Linode"
            />
          </Link>
        </div>
        <div className="navbar-search nav-item">
          <input
            className="form-control"
            type="search"
            placeholder="Search..."
            id="navbar-search"
          />
        </div>
        <div className="navbar-collapse collapse nav-item">
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
            <div className="nav-gravatar">
              <img
                className="nav-gravatar-img"
                src={gravatarLink}
                alt="User Avatar"
                height={35}
                width={35}
              />
              <div className="nav-gravatar-badge">3</div>
            </div>
          </div>
         : ''}
      </div>
    </nav>
  );
}

Navigation.propTypes = {
  username: PropTypes.string,
  emailHash: PropTypes.string,
};
