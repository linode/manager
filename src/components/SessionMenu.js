import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import { ExternalLink } from 'linode-components/buttons';


export default function SessionMenu(props) {
  const { open } = props;
  return (
    <div className={`SessionMenu ${open ? 'SessionMenu--open' : ''}`}>
      <ul className="SessionMenu-body">
        <li className="SessionMenu-item">
          <Link to="/profile">My Profile</Link>
        </li>
        <li className="SessionMenu-item">
          <a href="mailto:feedback@linode.com">Submit Feedback</a>
        </li>
        <hr />
        <li className="SessionMenu-header">Account</li>
        <li className="SessionMenu-item">
          <Link to="/settings">Account Settings</Link>
        </li>
        <li className="SessionMenu-item">
          <Link to="/billing">Billing</Link>
        </li>
        <li className="SessionMenu-item">
          <Link to="/users">Users</Link>
        </li>
        <hr />
        <li className="SessionMenu-header">Resources</li>
        <li className="SessionMenu-item">
          <ExternalLink to="https://forum.linode.com/">Community Forum</ExternalLink>
        </li>
        <li className="SessionMenu-item">
          <ExternalLink to="https://linode.com/docs">User Documentation</ExternalLink>
        </li>
        <li className="SessionMenu-item">
          <ExternalLink to="https://developers.linode.com">Developer Documentation</ExternalLink>
        </li>
        <hr />
        <li className="SessionMenu-item">
          <Link to="/logout">Log out</Link>
        </li>
      </ul>
    </div>
  );
}

SessionMenu.propTypes = {
  open: PropTypes.bool.isRequired,
};
